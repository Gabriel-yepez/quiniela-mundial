import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      _data: data,
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(
    (fn: (...args: unknown[]) => unknown) => fn
  ),
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/auth-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-server")>(
    "@/lib/auth-server"
  );
  return actual;
});
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], get: () => undefined })),
}));
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(async () => null),
  decode: vi.fn(async () => null),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";
import type { NextRequest } from "next/server";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.match.findUnique as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.match.update as ReturnType<typeof vi.fn>;

const adminSession = { user: { id: "admin-1", role: "admin" } };

function makeRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

interface MockResponse {
  status: number;
  json: () => Promise<Record<string, unknown>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(adminSession);
  mockUpdate.mockResolvedValue({});
});

describe("POST /api/admin/matches/lock", () => {
  test("rechaza usuarios no admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "user" } });
    const res = (await POST(makeRequest({ matchId: "m1" }))) as unknown as MockResponse;
    expect(res.status).toBe(401);
  });

  test("bloquea un partido programado por defecto", async () => {
    mockFindUnique.mockResolvedValue({ id: "m1", status: "scheduled" });
    const res = (await POST(makeRequest({ matchId: "m1" }))) as unknown as MockResponse;
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { status: "locked" },
    });
  });

  test("desbloquea un partido bloqueado con action=unlock", async () => {
    mockFindUnique.mockResolvedValue({ id: "m1", status: "locked" });
    const res = (await POST(
      makeRequest({ matchId: "m1", action: "unlock" })
    )) as unknown as MockResponse;
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: { status: "scheduled" },
    });
  });

  test("no permite bloquear un partido que no está programado", async () => {
    mockFindUnique.mockResolvedValue({ id: "m1", status: "finished" });
    const res = (await POST(makeRequest({ matchId: "m1" }))) as unknown as MockResponse;
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test("no permite desbloquear un partido que no está bloqueado", async () => {
    mockFindUnique.mockResolvedValue({ id: "m1", status: "scheduled" });
    const res = (await POST(
      makeRequest({ matchId: "m1", action: "unlock" })
    )) as unknown as MockResponse;
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test("devuelve 404 si el partido no existe", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = (await POST(makeRequest({ matchId: "nope" }))) as unknown as MockResponse;
    expect(res.status).toBe(404);
  });

  test("devuelve 400 con acción inválida o sin matchId", async () => {
    const res1 = (await POST(
      makeRequest({ matchId: "m1", action: "destroy" })
    )) as unknown as MockResponse;
    expect(res1.status).toBe(400);

    const res2 = (await POST(makeRequest({}))) as unknown as MockResponse;
    expect(res2.status).toBe(400);
  });
});
