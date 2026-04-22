import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Correo y contrasena son requeridos" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contrasena debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, accounts: { where: { provider: "google" } } },
  });

  if (!user) {
    return NextResponse.json(
      { error: "No existe una cuenta con este correo" },
      { status: 404 }
    );
  }

  if (user.password) {
    return NextResponse.json(
      { error: "Esta cuenta ya tiene contrasena configurada" },
      { status: 400 }
    );
  }

  if (user.accounts.length === 0) {
    return NextResponse.json(
      { error: "Esta cuenta no fue creada con Google" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
