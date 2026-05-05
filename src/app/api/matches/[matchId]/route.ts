import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const prediction = user
    ? await prisma.prediction.findUnique({
        where: {
          userId_matchId: { userId: user.id, matchId: match.id },
        },
      })
    : null;

  return NextResponse.json({
    match: { ...match, dateTime: match.dateTime.toISOString() },
    prediction,
    isAuthenticated: Boolean(user),
  });
}
