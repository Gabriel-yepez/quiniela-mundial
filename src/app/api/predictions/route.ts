import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { matchId, homeScore, awayScore } = await req.json();

  if (homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: "Marcador invalido" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  if (match.status !== "scheduled") {
    return NextResponse.json(
      { error: "No se pueden hacer predicciones para este partido" },
      { status: 400 }
    );
  }

  const prediction = await prisma.prediction.upsert({
    where: {
      userId_matchId: {
        userId: auth.user.id,
        matchId,
      },
    },
    update: { homeScore, awayScore },
    create: {
      userId: auth.user.id,
      matchId,
      homeScore,
      awayScore,
    },
  });

  return NextResponse.json(prediction);
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const predictions = await prisma.prediction.findMany({
    where: { userId: auth.user.id },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
    },
    orderBy: { match: { matchNumber: "asc" } },
  });

  const totalPoints = predictions.reduce(
    (sum, p) => sum + (p.points ?? 0),
    0
  );

  return NextResponse.json({
    predictions: predictions.map((p) => ({
      ...p,
      match: {
        ...p.match,
        dateTime: p.match.dateTime.toISOString(),
      },
    })),
    totalPoints,
  });
}
