import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PointsRange = "0" | "1-5" | "6-10" | "11-15" | "16-20" | "21+";

const RANGE_KEYS: PointsRange[] = ["0", "1-5", "6-10", "11-15", "16-20", "21+"];

function bucketForPoints(points: number): PointsRange {
  if (points <= 0) return "0";
  if (points <= 5) return "1-5";
  if (points <= 10) return "6-10";
  if (points <= 15) return "11-15";
  if (points <= 20) return "16-20";
  return "21+";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [users, matches] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        predictions: {
          select: {
            homeScore: true,
            awayScore: true,
            points: true,
            match: {
              select: { homeScore: true, awayScore: true },
            },
          },
        },
      },
    }),
    prisma.match.findMany({
      orderBy: { matchNumber: "asc" },
      select: {
        matchNumber: true,
        stage: true,
        status: true,
        homeScore: true,
        awayScore: true,
        homeTeam: { select: { code: true } },
        awayTeam: { select: { code: true } },
        _count: { select: { predictions: true } },
      },
    }),
  ]);

  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  ).length;

  let totalPredictions = 0;
  let globalExact = 0;
  let globalCorrectWinner = 0;
  let globalCorrectDraw = 0;
  let globalWrong = 0;
  let globalPending = 0;

  const leaderboard = users
    .map((u) => {
      let totalPoints = 0;
      let scoredCount = 0;
      let exactScores = 0;
      let correctWinners = 0;
      let correctDraws = 0;

      for (const p of u.predictions) {
        totalPredictions += 1;
        const matchHasResult =
          p.match.homeScore !== null && p.match.awayScore !== null;

        if (!matchHasResult) {
          globalPending += 1;
          continue;
        }

        scoredCount += 1;
        totalPoints += p.points ?? 0;

        const realHome = p.match.homeScore as number;
        const realAway = p.match.awayScore as number;
        const isExact =
          p.homeScore === realHome && p.awayScore === realAway;

        if (isExact) {
          exactScores += 1;
          globalExact += 1;
          continue;
        }

        const predOutcome = Math.sign(p.homeScore - p.awayScore);
        const realOutcome = Math.sign(realHome - realAway);

        if (predOutcome === realOutcome) {
          if (realOutcome === 0) {
            correctDraws += 1;
            globalCorrectDraw += 1;
          } else {
            correctWinners += 1;
            globalCorrectWinner += 1;
          }
        } else {
          globalWrong += 1;
        }
      }

      return {
        name: u.name,
        image: u.image,
        totalPoints,
        totalPredictions: scoredCount,
        exactScores,
        correctWinners,
        correctDraws,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const totalUsers = leaderboard.length;
  const sumPoints = leaderboard.reduce((acc, u) => acc + u.totalPoints, 0);
  const avgPointsPerUser = totalUsers > 0 ? sumPoints / totalUsers : 0;
  const maxPoints = leaderboard.length > 0 ? leaderboard[0].totalPoints : 0;

  const matchParticipation = matches.map((m) => {
    const home = m.homeTeam?.code ?? "TBD";
    const away = m.awayTeam?.code ?? "TBD";
    return {
      matchNumber: m.matchNumber,
      label: `${home} vs ${away}`,
      predictionCount: m._count.predictions,
      stage: m.stage,
      status: m.status,
    };
  });

  const distributionMap = new Map<PointsRange, number>(
    RANGE_KEYS.map((k) => [k, 0])
  );
  for (const u of leaderboard) {
    const bucket = bucketForPoints(u.totalPoints);
    distributionMap.set(bucket, (distributionMap.get(bucket) ?? 0) + 1);
  }
  const pointsDistribution = RANGE_KEYS.map((range) => ({
    range,
    count: distributionMap.get(range) ?? 0,
  }));

  return NextResponse.json({
    summary: {
      totalUsers,
      totalPredictions,
      totalMatches,
      completedMatches,
      avgPointsPerUser,
      maxPoints,
    },
    leaderboard,
    matchParticipation,
    predictionAccuracy: {
      exact: globalExact,
      correctWinner: globalCorrectWinner,
      correctDraw: globalCorrectDraw,
      wrong: globalWrong,
      pending: globalPending,
    },
    pointsDistribution,
  });
}
