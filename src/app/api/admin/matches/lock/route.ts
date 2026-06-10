import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { CACHE_TAG_MATCHES } from "@/lib/cached-queries";

interface LockPayload {
  matchId?: string;
  action?: string;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const body = (await req.json()) as LockPayload;
  const matchId = body.matchId;
  const action = body.action ?? "lock";

  if (!matchId || (action !== "lock" && action !== "unlock")) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  if (action === "lock" && match.status !== "scheduled") {
    return NextResponse.json(
      { error: "Solo se pueden bloquear partidos programados" },
      { status: 400 }
    );
  }

  if (action === "unlock" && match.status !== "locked") {
    return NextResponse.json(
      { error: "Solo se pueden desbloquear partidos bloqueados" },
      { status: 400 }
    );
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { status: action === "lock" ? "locked" : "scheduled" },
  });

  revalidateTag(CACHE_TAG_MATCHES, "max");

  return NextResponse.json({ success: true });
}
