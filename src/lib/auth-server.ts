import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { auth } from "./auth";

export type ServerUser = {
  id: string;
  role: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

const SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

async function readJwt(): Promise<{ id?: string; role?: string }> {
  if (!SECRET) return {};
  const cookieStore = await cookies();

  for (const name of SESSION_COOKIE_NAMES) {
    const value = cookieStore.get(name)?.value;
    if (!value) continue;
    try {
      const decoded = await decode({ token: value, secret: SECRET, salt: name });
      if (decoded) {
        return {
          id: typeof decoded.id === "string" ? decoded.id : undefined,
          role: typeof decoded.role === "string" ? decoded.role : undefined,
        };
      }
    } catch {
      // try the next cookie name
    }
  }
  return {};
}

export async function getCurrentUser(): Promise<ServerUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const jwt = await readJwt();
  const fallback = session.user as { id?: string; role?: string };

  const id = jwt.id ?? fallback.id;
  const role = jwt.role ?? fallback.role ?? "user";

  if (!id) return null;

  return {
    id,
    role,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };
}

type Authorized = { user: ServerUser; response: null };
type Rejected = { user: null; response: NextResponse };

export async function requireUser(): Promise<Authorized | Rejected> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export async function requireAdmin(): Promise<Authorized | Rejected> {
  const result = await requireUser();
  if (result.response) return result;
  if (result.user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return result;
}
