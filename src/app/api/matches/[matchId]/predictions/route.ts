import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OtherPrediction {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user: { name: string; image: string | null };
}

function displayName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim();
  if (email) return email.split("@")[0];
  return "Anónimo";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, status: true },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Partido no encontrado" },
      { status: 404 }
    );
  }

  if (match.status === "scheduled") {
    return NextResponse.json({ locked: false, predictions: [] });
  }

  const rows = await prisma.prediction.findMany({
    where: { matchId },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: [
      { points: { sort: "desc", nulls: "last" } },
      { createdAt: "asc" },
    ],
  });

  const predictions: OtherPrediction[] = rows.map((p) => ({
    id: p.id,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    points: p.points,
    user: {
      name: displayName(p.user.name, p.user.email),
      image: p.user.image,
    },
  }));

  return NextResponse.json({ locked: true, predictions });
}
