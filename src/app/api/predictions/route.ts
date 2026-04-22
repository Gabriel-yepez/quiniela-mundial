import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
        userId: session.user.id,
        matchId,
      },
    },
    update: { homeScore, awayScore },
    create: {
      userId: session.user.id,
      matchId,
      homeScore,
      awayScore,
    },
  });

  return NextResponse.json(prediction);
}
