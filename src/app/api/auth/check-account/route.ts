import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { password: true },
  });

  if (!user) {
    return NextResponse.json({ exists: false, needsPassword: false });
  }

  return NextResponse.json({
    exists: true,
    needsPassword: !user.password,
  });
}
