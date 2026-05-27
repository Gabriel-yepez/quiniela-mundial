import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { calculatePoints, resolveFinalScore } from "@/lib/scoring";
import { isKnockoutStage } from "@/lib/match-constants";

interface ResultPayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
  extraTimeHomeScore?: number | null;
  extraTimeAwayScore?: number | null;
  penaltyHomeScore?: number | null;
  penaltyAwayScore?: number | null;
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function normalizeOptional(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return isNonNegativeInt(value) ? value : NaN;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const body = (await req.json()) as ResultPayload;
  const { matchId, homeScore, awayScore } = body;

  if (!isNonNegativeInt(homeScore) || !isNonNegativeInt(awayScore)) {
    return NextResponse.json({ error: "Marcador invalido" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  const knockout = isKnockoutStage(match.stage);

  const extraTimeHomeScore = normalizeOptional(body.extraTimeHomeScore);
  const extraTimeAwayScore = normalizeOptional(body.extraTimeAwayScore);
  const penaltyHomeScore = normalizeOptional(body.penaltyHomeScore);
  const penaltyAwayScore = normalizeOptional(body.penaltyAwayScore);

  const optionalValues = [
    extraTimeHomeScore,
    extraTimeAwayScore,
    penaltyHomeScore,
    penaltyAwayScore,
  ];

  if (optionalValues.some((v) => Number.isNaN(v))) {
    return NextResponse.json(
      { error: "Valores de tiempo extra/penales invalidos" },
      { status: 400 }
    );
  }

  const sentAnyOptional = optionalValues.some(
    (v) => v !== undefined && v !== null
  );
  if (sentAnyOptional && !knockout) {
    return NextResponse.json(
      {
        error:
          "Tiempo extra y penales solo aplican a partidos de eliminacion directa",
      },
      { status: 400 }
    );
  }

  const config = await prisma.scoringConfig.findFirst();
  if (!config) {
    return NextResponse.json(
      { error: "Configuracion de puntos no encontrada" },
      { status: 500 }
    );
  }

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      status: "finished",
      ...(extraTimeHomeScore !== undefined ? { extraTimeHomeScore } : {}),
      ...(extraTimeAwayScore !== undefined ? { extraTimeAwayScore } : {}),
      ...(penaltyHomeScore !== undefined ? { penaltyHomeScore } : {}),
      ...(penaltyAwayScore !== undefined ? { penaltyAwayScore } : {}),
    },
  });

  // Grade against the final scoreline (regulation + extra time). Knockout
  // matches decided in extra time would otherwise be scored as their 90' draw.
  const finalScore = resolveFinalScore({
    homeScore,
    awayScore,
    extraTimeHomeScore: updatedMatch.extraTimeHomeScore,
    extraTimeAwayScore: updatedMatch.extraTimeAwayScore,
  });

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const pred of predictions) {
    const points = calculatePoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      finalScore,
      config
    );

    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    });
  }

  return NextResponse.json({ success: true, scored: predictions.length });
}
