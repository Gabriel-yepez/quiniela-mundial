import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const leaderboard = users
    .map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
      totalPoints: user.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0),
      totalPredictions: user.predictions.length,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  return NextResponse.json(leaderboard);
}
