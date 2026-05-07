import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeGroupStandings,
  type StandingTeamInput,
} from "@/lib/standings";

export async function GET() {
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

  const teams: StandingTeamInput[] = teamsRaw.filter((t) => t.group !== null);
  const groups = computeGroupStandings(teams, matches);
  return NextResponse.json(groups);
}
