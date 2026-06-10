import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  computeGroupStandings,
  type StandingTeamInput,
} from "@/lib/standings";

// Cache tags: admin mutations call revalidateTag() to invalidate.
export const CACHE_TAG_MATCHES = "matches";
export const CACHE_TAG_LEADERBOARD = "leaderboard";
export const CACHE_TAG_SCORING = "scoring";

export const getCachedMatches = unstable_cache(
  async () => {
    const matches = await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { matchNumber: "asc" },
    });
    return matches.map((m) => ({
      ...m,
      dateTime: m.dateTime.toISOString(),
    }));
  },
  ["matches-list"],
  { tags: [CACHE_TAG_MATCHES], revalidate: 300 }
);

export const getCachedGroups = unstable_cache(
  async () => {
    const teamsRaw = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        flagUrl: true,
        group: true,
      },
    });

    const matches = await prisma.match.findMany({
      where: { stage: "group" },
      select: {
        status: true,
        group: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const teams: StandingTeamInput[] = teamsRaw.filter(
      (t) => t.group !== null
    );
    return computeGroupStandings(teams, matches);
  },
  ["groups-standings"],
  { tags: [CACHE_TAG_MATCHES], revalidate: 300 }
);

export const getCachedLeaderboard = unstable_cache(
  async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        predictions: {
          where: { points: { not: null } },
          select: { points: true },
        },
      },
    });

    return users
      .map((user) => ({
        id: user.id,
        name: user.name,
        image: user.image,
        totalPoints: user.predictions.reduce(
          (sum, p) => sum + (p.points ?? 0),
          0
        ),
        totalPredictions: user.predictions.length,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  },
  ["leaderboard"],
  { tags: [CACHE_TAG_LEADERBOARD], revalidate: 120 }
);

export const getCachedScoringConfig = unstable_cache(
  async () => prisma.scoringConfig.findFirst(),
  ["scoring-config"],
  { tags: [CACHE_TAG_SCORING], revalidate: 3600 }
);
