import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { matchId } = await req.json();

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "locked" },
  });

  return NextResponse.json({ success: true });
}
