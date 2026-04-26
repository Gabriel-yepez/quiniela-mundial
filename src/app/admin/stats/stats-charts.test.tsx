// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StatsCharts } from "./stats-charts";

vi.mock("recharts", () => {
  const Responsive = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Chart = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Stub = () => null;
  return {
    ResponsiveContainer: Responsive,
    BarChart: Chart,
    PieChart: Chart,
    Bar: Stub,
    Pie: Stub,
    Cell: Stub,
    XAxis: Stub,
    YAxis: Stub,
    CartesianGrid: Stub,
    Tooltip: Stub,
    Legend: Stub,
  };
});

const baseStats = {
  summary: {
    totalUsers: 10,
    totalPredictions: 80,
    totalMatches: 48,
    completedMatches: 12,
    avgPointsPerUser: 7.5,
    maxPoints: 30,
  },
  leaderboard: [
    {
      name: "Alice",
      image: null,
      totalPoints: 30,
      totalPredictions: 12,
      exactScores: 4,
      correctWinners: 5,
      correctDraws: 3,
    },
  ],
  matchParticipation: [
    { matchNumber: 1, label: "BRA vs ARG", predictionCount: 8, stage: "Group", status: "completed" },
  ],
  predictionAccuracy: {
    exact: 20,
    correctWinner: 30,
    correctDraw: 10,
    wrong: 15,
    pending: 5,
  },
  pointsDistribution: [
    { range: "0", count: 1 },
    { range: "1-5", count: 3 },
    { range: "6-10", count: 4 },
    { range: "11-15", count: 2 },
    { range: "16-20", count: 0 },
    { range: "21+", count: 0 },
  ],
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetchSuccess(data: unknown = baseStats) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchError(status = 500) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: "Internal Server Error" }),
  });
}

describe("StatsCharts", () => {
  describe("loading state", () => {
    test("renders skeleton placeholders while fetching", () => {
      (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
      render(<StatsCharts />);

      const skeletons = document.querySelectorAll(".animate-pulse, [class*='skeleton']");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("error state", () => {
    test("shows error message when fetch returns non-ok response", async () => {
      mockFetchError(401);
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("No se pudieron cargar las estadísticas")).toBeInTheDocument();
      });
    });

    test("shows error message when fetch rejects", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("No se pudieron cargar las estadísticas")).toBeInTheDocument();
      });
    });
  });

  describe("loaded state — KPI cards", () => {
    test("displays total users count", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    test("displays total predictions count", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("80")).toBeInTheDocument();
      });
    });

    test("displays completed / total matches", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("12 / 48")).toBeInTheDocument();
      });
    });

    test("displays average points rounded to one decimal", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("7.5")).toBeInTheDocument();
      });
    });

    test("rounds avgPointsPerUser to 1 decimal place", async () => {
      mockFetchSuccess({ ...baseStats, summary: { ...baseStats.summary, avgPointsPerUser: 7.333 } });
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("7.3")).toBeInTheDocument();
      });
    });
  });

  describe("loaded state — section headings", () => {
    test("renders leaderboard section title", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Top participantes por puntos")).toBeInTheDocument();
      });
    });

    test("renders prediction accuracy section title", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Tipos de predicciones")).toBeInTheDocument();
      });
    });

    test("renders match participation section title", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Participación por partido")).toBeInTheDocument();
      });
    });
  });

  describe("empty states", () => {
    test("shows empty message when leaderboard has no users", async () => {
      mockFetchSuccess({ ...baseStats, leaderboard: [] });
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Aún no hay datos de participantes")).toBeInTheDocument();
      });
    });

    test("shows empty message when all prediction accuracy counts are zero", async () => {
      mockFetchSuccess({
        ...baseStats,
        predictionAccuracy: { exact: 0, correctWinner: 0, correctDraw: 0, wrong: 0, pending: 0 },
      });
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Aún no hay predicciones registradas")).toBeInTheDocument();
      });
    });

    test("shows empty message when no matches have participations", async () => {
      mockFetchSuccess({ ...baseStats, matchParticipation: [] });
      render(<StatsCharts />);

      await waitFor(() => {
        expect(screen.getByText("Aún no hay partidos con predicciones")).toBeInTheDocument();
      });
    });
  });

  describe("fetch behavior", () => {
    test("calls /api/admin/stats on mount", async () => {
      mockFetchSuccess();
      render(<StatsCharts />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "/api/admin/stats",
          expect.objectContaining({ credentials: "include" })
        );
      });
    });
  });
});
