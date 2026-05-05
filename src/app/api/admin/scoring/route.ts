import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.scoringConfig.findFirst();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

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
