import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  computeGroupStandings,
  type StandingTeamInput,
} from "@/lib/standings";
import { rankBestThirds } from "@/lib/bracket";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const teamsRaw = await prisma.team.findMany({
    select: { id: true, name: true, code: true, flagUrl: true, group: true },
  });

  const groupMatches = await prisma.match.findMany({
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

  const round32 = await prisma.match.findMany({
    where: { stage: "round32" },
    orderBy: { matchNumber: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  const teams: StandingTeamInput[] = teamsRaw.filter((t) => t.group !== null);
  const groups = computeGroupStandings(teams, groupMatches);
  const bestThirds = rankBestThirds(groups);

  const incompleteGroupMatches = groupMatches.filter(
    (m) => m.status !== "finished"
  ).length;

  return NextResponse.json({
    groups,
    bestThirds,
    round32Matches: round32.map((m) => ({
      id: m.id,
      matchNumber: m.matchNumber,
      dateTime: m.dateTime.toISOString(),
      venue: m.venue,
      status: m.status,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeTeam: m.homeTeam
        ? { name: m.homeTeam.name, code: m.homeTeam.code, flagUrl: m.homeTeam.flagUrl }
        : null,
      awayTeam: m.awayTeam
        ? { name: m.awayTeam.name, code: m.awayTeam.code, flagUrl: m.awayTeam.flagUrl }
        : null,
    })),
    incompleteGroupMatches,
    teams: teamsRaw,
  });
}
