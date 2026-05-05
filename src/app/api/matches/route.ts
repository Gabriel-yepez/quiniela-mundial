import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchNumber: "asc" },
  });

  return NextResponse.json(
    matches.map((m) => ({
      ...m,
      dateTime: m.dateTime.toISOString(),
    }))
  );
}
