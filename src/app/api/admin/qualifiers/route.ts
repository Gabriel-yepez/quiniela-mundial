import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  computeGroupStandings,
  type StandingTeamInput,
} from "@/lib/standings";
import { rankBestThirds } from "@/lib/bracket";
import { CACHE_TAG_MATCHES } from "@/lib/cached-queries";

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

interface AssignmentInput {
  matchId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
}

interface PostBody {
  assignments: AssignmentInput[];
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isNullableString(v: unknown): v is string | null {
  return v === null || isString(v);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const body = (await req.json()) as PostBody;
  if (!Array.isArray(body?.assignments)) {
    return NextResponse.json(
      { error: "Formato invalido" },
      { status: 400 }
    );
  }

  const seenMatchIds = new Set<string>();
  const seenTeamIds = new Set<string>();
  for (const a of body.assignments) {
    if (!isString(a.matchId) || !isNullableString(a.homeTeamId) || !isNullableString(a.awayTeamId)) {
      return NextResponse.json(
        { error: "Datos de asignacion invalidos" },
        { status: 400 }
      );
    }
    if (seenMatchIds.has(a.matchId)) {
      return NextResponse.json(
        { error: "Partido duplicado en la asignacion" },
        { status: 400 }
      );
    }
    seenMatchIds.add(a.matchId);

    if (a.homeTeamId !== null && a.homeTeamId === a.awayTeamId) {
      return NextResponse.json(
        { error: "Un equipo no puede jugar contra si mismo" },
        { status: 400 }
      );
    }
    for (const teamId of [a.homeTeamId, a.awayTeamId]) {
      if (teamId === null) continue;
      if (seenTeamIds.has(teamId)) {
        return NextResponse.json(
          { error: "Un mismo equipo aparece en mas de un partido" },
          { status: 400 }
        );
      }
      seenTeamIds.add(teamId);
    }
  }

  const targetMatches = await prisma.match.findMany({
    where: { id: { in: body.assignments.map((a) => a.matchId) } },
    select: { id: true, stage: true, status: true },
  });

  const byId = new Map(targetMatches.map((m) => [m.id, m]));
  for (const a of body.assignments) {
    const m = byId.get(a.matchId);
    if (!m) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }
    if (m.stage !== "round32") {
      return NextResponse.json(
        { error: "Solo se pueden asignar partidos de round32" },
        { status: 400 }
      );
    }
    if (m.status === "finished") {
      return NextResponse.json(
        { error: "No se puede modificar un partido finalizado" },
        { status: 400 }
      );
    }
  }

  await prisma.$transaction(
    body.assignments.map((a) =>
      prisma.match.update({
        where: { id: a.matchId },
        data: { homeTeamId: a.homeTeamId, awayTeamId: a.awayTeamId },
      })
    )
  );

  revalidateTag(CACHE_TAG_MATCHES, "max");

  return NextResponse.json({ ok: true, updated: body.assignments.length });
}
