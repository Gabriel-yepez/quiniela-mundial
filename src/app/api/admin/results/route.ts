import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { matchId, homeScore, awayScore } = await req.json();

  if (homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: "Marcador invalido" }, { status: 400 });
  }

  const config = await prisma.scoringConfig.findFirst();
  if (!config) {
    return NextResponse.json(
      { error: "Configuracion de puntos no encontrada" },
      { status: 500 }
    );
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "finished" },
  });

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const pred of predictions) {
    const points = calculatePoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { homeScore, awayScore },
      config
    );

    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    });
  }

  return NextResponse.json({ success: true, scored: predictions.length });
}
