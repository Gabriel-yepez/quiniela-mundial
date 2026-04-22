import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { matchId } = await req.json();

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "locked" },
  });

  return NextResponse.json({ success: true });
}
