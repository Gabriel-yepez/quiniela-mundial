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

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    match: { findMany: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockUserFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;
const mockMatchFindMany = prisma.match.findMany as ReturnType<typeof vi.fn>;

const adminSession = { user: { id: "admin-1", role: "admin" } };

const noMatches = () => mockMatchFindMany.mockResolvedValue([]);
const noUsers = () => mockUserFindMany.mockResolvedValue([]);

function makeUser(overrides: {
  id?: string;
  name?: string;
  predictions?: unknown[];
} = {}) {
  return {
    id: overrides.id ?? "user-1",
    name: overrides.name ?? "Test User",
    image: null,
    predictions: overrides.predictions ?? [],
  };
}

function makePrediction(opts: {
  homeScore: number;
  awayScore: number;
  points?: number | null;
  matchHomeScore?: number | null;
  matchAwayScore?: number | null;
}) {
  return {
    homeScore: opts.homeScore,
    awayScore: opts.awayScore,
    points: opts.points ?? null,
    match: {
      homeScore: opts.matchHomeScore ?? null,
      awayScore: opts.matchAwayScore ?? null,
    },
  };
}

function makeMatch(overrides: Partial<{
  matchNumber: number;
  stage: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { code: string } | null;
  awayTeam: { code: string } | null;
  _count: { predictions: number };
}> = {}) {
  return {
    matchNumber: overrides.matchNumber ?? 1,
    stage: overrides.stage ?? "Group",
    status: overrides.status ?? "scheduled",
    homeScore: overrides.homeScore ?? null,
    awayScore: overrides.awayScore ?? null,
    homeTeam: Object.hasOwn(overrides, "homeTeam") ? overrides.homeTeam ?? null : { code: "BRA" },
    awayTeam: Object.hasOwn(overrides, "awayTeam") ? overrides.awayTeam ?? null : { code: "ARG" },
    _count: overrides._count ?? { predictions: 0 },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/stats", () => {
  describe("authentication", () => {
    test("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      noUsers();
      noMatches();

      const res = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "No autorizado" },
        { status: 401 }
      );
    });

    test("returns 401 when user role is not admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1", role: "user" } });
      noUsers();
      noMatches();

      const res = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "No autorizado" },
        { status: 401 }
      );
    });

    test("proceeds when user is admin", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      noMatches();

      await GET();

      expect(NextResponse.json).not.toHaveBeenCalledWith(
        { error: "No autorizado" },
        { status: 401 }
      );
    });
  });

  describe("summary stats", () => {
    test("returns zero summary when database is empty", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.summary).toEqual({
        totalUsers: 0,
        totalPredictions: 0,
        totalMatches: 0,
        completedMatches: 0,
        avgPointsPerUser: 0,
        maxPoints: 0,
      });
    });

    test("counts only matches with both scores as completed", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      mockMatchFindMany.mockResolvedValue([
        makeMatch({ matchNumber: 1, homeScore: 2, awayScore: 1 }),
        makeMatch({ matchNumber: 2, homeScore: null, awayScore: null }),
        makeMatch({ matchNumber: 3, homeScore: 0, awayScore: 0 }),
      ]);

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.summary.totalMatches).toBe(3);
      expect(data.summary.completedMatches).toBe(2);
    });

    test("computes average points per user correctly", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ id: "u1", predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 })] }),
        makeUser({ id: "u2", predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: 3, matchHomeScore: 2, matchAwayScore: 0 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.summary.avgPointsPerUser).toBe(4); // (5+3)/2
    });

    test("reports max points from the leading user", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ id: "u1", predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 })] }),
        makeUser({ id: "u2", predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: 10, matchHomeScore: 1, matchAwayScore: 0 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.summary.maxPoints).toBe(10);
    });
  });

  describe("prediction accuracy classification", () => {
    test("classifies exact score prediction correctly", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.predictionAccuracy.exact).toBe(1);
      expect(data.predictionAccuracy.correctWinner).toBe(0);
      expect(data.predictionAccuracy.correctDraw).toBe(0);
      expect(data.predictionAccuracy.wrong).toBe(0);
    });

    test("classifies correct winner prediction (not exact)", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: 3, matchHomeScore: 3, matchAwayScore: 1 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.predictionAccuracy.exact).toBe(0);
      expect(data.predictionAccuracy.correctWinner).toBe(1);
      expect(data.predictionAccuracy.correctDraw).toBe(0);
      expect(data.predictionAccuracy.wrong).toBe(0);
    });

    test("classifies correct draw prediction (not exact)", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 1, awayScore: 1, points: 2, matchHomeScore: 2, matchAwayScore: 2 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.predictionAccuracy.exactScore).toBe(undefined);
      expect(data.predictionAccuracy.exact).toBe(0);
      expect(data.predictionAccuracy.correctDraw).toBe(1);
    });

    test("classifies wrong prediction when winner is incorrect", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 2, awayScore: 0, points: 0, matchHomeScore: 0, matchAwayScore: 1 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.predictionAccuracy.wrong).toBe(1);
      expect(data.predictionAccuracy.exact).toBe(0);
    });

    test("counts pending predictions for matches without results", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: null, matchHomeScore: null, matchAwayScore: null })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.predictionAccuracy.pending).toBe(1);
      expect(data.predictionAccuracy.exact).toBe(0);
    });
  });

  describe("leaderboard", () => {
    test("orders users by totalPoints descending", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ id: "u1", name: "Alice", predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: 3, matchHomeScore: 2, matchAwayScore: 0 })] }),
        makeUser({ id: "u2", name: "Bob", predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.leaderboard[0].name).toBe("Bob");
      expect(data.leaderboard[1].name).toBe("Alice");
    });

    test("counts exactScores per user in leaderboard", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({
          predictions: [
            makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 }),
            makePrediction({ homeScore: 0, awayScore: 0, points: 5, matchHomeScore: 0, matchAwayScore: 0 }),
            makePrediction({ homeScore: 1, awayScore: 0, points: 3, matchHomeScore: 2, matchAwayScore: 0 }),
          ],
        }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const user = data.leaderboard[0];
      expect(user.exactScores).toBe(2);
      expect(user.correctWinners).toBe(1);
      expect(user.correctDraws).toBe(0);
    });
  });

  describe("match participation", () => {
    test("builds label from team codes", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      mockMatchFindMany.mockResolvedValue([
        makeMatch({ matchNumber: 1, homeTeam: { code: "BRA" }, awayTeam: { code: "ARG" }, _count: { predictions: 7 } }),
      ]);

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.matchParticipation[0].label).toBe("BRA vs ARG");
      expect(data.matchParticipation[0].predictionCount).toBe(7);
    });

    test("uses TBD when team is null", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      mockMatchFindMany.mockResolvedValue([
        makeMatch({ matchNumber: 50, homeTeam: null, awayTeam: null }),
      ]);

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(data.matchParticipation[0].label).toBe("TBD vs TBD");
    });
  });

  describe("points distribution buckets", () => {
    test("always returns all 6 buckets even when empty", async () => {
      mockAuth.mockResolvedValue(adminSession);
      noUsers();
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const ranges = data.pointsDistribution.map((b: { range: string }) => b.range);
      expect(ranges).toEqual(["0", "1-5", "6-10", "11-15", "16-20", "21+"]);
    });

    test("places user with 0 points in '0' bucket", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([makeUser({ predictions: [] })]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const bucket = data.pointsDistribution.find((b: { range: string }) => b.range === "0");
      expect(bucket.count).toBe(1);
    });

    test("places user with 5 points in '1-5' bucket", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 5, matchHomeScore: 2, matchAwayScore: 1 })] }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const bucket = data.pointsDistribution.find((b: { range: string }) => b.range === "1-5");
      expect(bucket.count).toBe(1);
    });

    test("places user with 21+ points in '21+' bucket", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({
          predictions: Array.from({ length: 5 }, () =>
            makePrediction({ homeScore: 1, awayScore: 0, points: 5, matchHomeScore: 1, matchAwayScore: 0 })
          ),
        }),
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const bucket = data.pointsDistribution.find((b: { range: string }) => b.range === "21+");
      expect(bucket.count).toBe(1);
    });

    test("distributes multiple users across correct buckets", async () => {
      mockAuth.mockResolvedValue(adminSession);
      mockUserFindMany.mockResolvedValue([
        makeUser({ id: "u1", predictions: [] }),                                                                          // 0 pts → "0"
        makeUser({ id: "u2", predictions: [makePrediction({ homeScore: 1, awayScore: 0, points: 3, matchHomeScore: 2, matchAwayScore: 0 })] }), // 3 pts → "1-5"
        makeUser({ id: "u3", predictions: [makePrediction({ homeScore: 2, awayScore: 1, points: 8, matchHomeScore: 2, matchAwayScore: 1 })] }), // 8 pts → "6-10" (but points=8, stored)
      ]);
      noMatches();

      await GET();

      const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
      const dist = Object.fromEntries(
        data.pointsDistribution.map((b: { range: string; count: number }) => [b.range, b.count])
      );
      expect(dist["0"]).toBe(1);
      expect(dist["1-5"]).toBe(1);
      expect(dist["6-10"]).toBe(1);
    });
  });
});
