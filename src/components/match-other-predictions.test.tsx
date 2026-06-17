import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MatchOtherPredictions } from "@/components/match-other-predictions";

const realFetch = global.fetch;

afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MatchOtherPredictions", () => {
  test("shows reveal message and does not fetch while match is scheduled", () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="scheduled" />);

    expect(
      screen.getByText(/se revelar/i)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("renders a row with predicted score and points when finished", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        locked: true,
        predictions: [
          {
            id: "p1",
            homeScore: 2,
            awayScore: 1,
            points: 5,
            user: { name: "Alice", image: null },
          },
        ],
      }),
    }) as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="finished" />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeInTheDocument();
    expect(screen.getByText(/5 pts/i)).toBeInTheDocument();
  });

  test("shows empty state when there are no predictions", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ locked: true, predictions: [] }),
    }) as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="finished" />);

    await waitFor(() =>
      expect(screen.getByText(/no hay predicciones/i)).toBeInTheDocument()
    );
  });
});
