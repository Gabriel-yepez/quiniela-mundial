import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      _data: data,
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: { findUnique: vi.fn() },
    prediction: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "./route";

const mockMatchFindUnique = prisma.match.findUnique as ReturnType<typeof vi.fn>;
const mockPredictionFindMany = prisma.prediction.findMany as ReturnType<typeof vi.fn>;

function makeParams(matchId: string) {
  return { params: Promise.resolve({ matchId }) };
}

function predictionRow(overrides: {
  id?: string;
  homeScore?: number;
  awayScore?: number;
  points?: number | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} = {}) {
  return {
    id: overrides.id ?? "p1",
    homeScore: overrides.homeScore ?? 2,
    awayScore: overrides.awayScore ?? 1,
    points: overrides.points ?? null,
    user: {
      name: Object.hasOwn(overrides, "name") ? overrides.name ?? null : "Alice",
      email: overrides.email ?? "alice@example.com",
      image: overrides.image ?? null,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/matches/[matchId]/predictions", () => {
  test("returns 404 when match does not exist", async () => {
    mockMatchFindUnique.mockResolvedValue(null);

    await GET(new Request("http://t"), makeParams("missing"));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Partido no encontrado" },
      { status: 404 }
    );
  });

  test("hides predictions while match is scheduled", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "scheduled" });

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data).toEqual({ locked: false, predictions: [] });
    expect(mockPredictionFindMany).not.toHaveBeenCalled();
  });

  test("reveals predictions when match is locked", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "locked" });
    mockPredictionFindMany.mockResolvedValue([predictionRow()]);

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data.locked).toBe(true);
    expect(data.predictions).toHaveLength(1);
    expect(data.predictions[0]).toEqual({
      id: "p1",
      homeScore: 2,
      awayScore: 1,
      points: null,
      user: { name: "Alice", image: null },
    });
  });

  test("orders by points descending", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "finished" });
    mockPredictionFindMany.mockResolvedValue([]);

    await GET(new Request("http://t"), makeParams("m1"));

    const callArg = mockPredictionFindMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual([
      { points: { sort: "desc", nulls: "last" } },
      { createdAt: "asc" },
    ]);
  });

  test("never exposes the full email; derives name from local-part when name is null", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "finished" });
    mockPredictionFindMany.mockResolvedValue([
      predictionRow({ name: null, email: "bob@example.com", points: 5 }),
    ]);

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data.predictions[0].user.name).toBe("bob");
    expect(JSON.stringify(data)).not.toContain("bob@example.com");
  });
});
