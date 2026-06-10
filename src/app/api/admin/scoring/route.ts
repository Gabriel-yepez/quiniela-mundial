import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  CACHE_TAG_SCORING,
  getCachedScoringConfig,
} from "@/lib/cached-queries";

export async function GET() {
  const config = await getCachedScoringConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { exactScore, correctWinner, correctDraw } = await req.json();

  const existing = await prisma.scoringConfig.findFirst();
  const config = existing
    ? await prisma.scoringConfig.update({
        where: { id: existing.id },
        data: { exactScore, correctWinner, correctDraw },
      })
    : await prisma.scoringConfig.create({
        data: { exactScore, correctWinner, correctDraw },
      });

  revalidateTag(CACHE_TAG_SCORING, "max");

  return NextResponse.json(config);
}
