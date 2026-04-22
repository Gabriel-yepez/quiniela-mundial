import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await prisma.scoringConfig.findFirst();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { exactScore, correctWinner, correctDraw } = await req.json();

  const existing = await prisma.scoringConfig.findFirst();
  if (!existing) {
    const config = await prisma.scoringConfig.create({
      data: { exactScore, correctWinner, correctDraw },
    });
    return NextResponse.json(config);
  }

  const config = await prisma.scoringConfig.update({
    where: { id: existing.id },
    data: { exactScore, correctWinner, correctDraw },
  });

  return NextResponse.json(config);
}
