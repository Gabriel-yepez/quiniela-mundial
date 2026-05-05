import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

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
