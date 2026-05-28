import { describe, test, expect } from "vitest";
import {
  calculatePoints,
  calculateKnockoutPoints,
  resolveFinalScore,
  resolveWinnerSide,
} from "./scoring";

const cfg = { exactScore: 5, correctWinner: 3, correctDraw: 2 };

describe("calculatePoints", () => {
  describe("exact score", () => {
    test("returns exactScore when home and away goals match exactly", () => {
      expect(calculatePoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }, cfg)).toBe(5);
    });

    test("returns exactScore for 0-0 vs 0-0", () => {
      expect(calculatePoints({ homeScore: 0, awayScore: 0 }, { homeScore: 0, awayScore: 0 }, cfg)).toBe(5);
    });

    test("returns exactScore for high-scoring match", () => {
      expect(calculatePoints({ homeScore: 4, awayScore: 3 }, { homeScore: 4, awayScore: 3 }, cfg)).toBe(5);
    });
  });

  describe("correct winner (not exact)", () => {
    test("returns correctWinner when predicted home win matches real home win", () => {
      expect(calculatePoints({ homeScore: 1, awayScore: 0 }, { homeScore: 3, awayScore: 1 }, cfg)).toBe(3);
    });

    test("returns correctWinner when predicted away win matches real away win", () => {
      expect(calculatePoints({ homeScore: 0, awayScore: 2 }, { homeScore: 1, awayScore: 4 }, cfg)).toBe(3);
    });
  });

  describe("correct draw (not exact)", () => {
    test("returns correctDraw when predicted draw matches real draw with different score", () => {
      expect(calculatePoints({ homeScore: 1, awayScore: 1 }, { homeScore: 2, awayScore: 2 }, cfg)).toBe(2);
    });

    test("returns correctDraw for 2-2 predicted vs 3-3 result", () => {
      expect(calculatePoints({ homeScore: 2, awayScore: 2 }, { homeScore: 3, awayScore: 3 }, cfg)).toBe(2);
    });
  });

  describe("wrong prediction (0 points)", () => {
    test("returns 0 when predicted home win but away team won", () => {
      expect(calculatePoints({ homeScore: 2, awayScore: 0 }, { homeScore: 0, awayScore: 1 }, cfg)).toBe(0);
    });

    test("returns 0 when predicted away win but home team won", () => {
      expect(calculatePoints({ homeScore: 0, awayScore: 2 }, { homeScore: 3, awayScore: 0 }, cfg)).toBe(0);
    });

    test("returns 0 when predicted draw but there was a winner", () => {
      expect(calculatePoints({ homeScore: 1, awayScore: 1 }, { homeScore: 2, awayScore: 0 }, cfg)).toBe(0);
    });

    test("returns 0 when predicted winner but result was draw", () => {
      expect(calculatePoints({ homeScore: 2, awayScore: 0 }, { homeScore: 1, awayScore: 1 }, cfg)).toBe(0);
    });
  });

  describe("knockout matches decided in extra time / penalties", () => {
    test("adds extra-time goals to the regulation score", () => {
      // 1-1 at 90', home scores once in extra time -> final 2-1
      const result = resolveFinalScore({
        homeScore: 1,
        awayScore: 1,
        extraTimeHomeScore: 1,
        extraTimeAwayScore: 0,
      });
      expect(result).toEqual({ homeScore: 2, awayScore: 1 });
    });

    test("predicting the eventual extra-time winner earns winner points", () => {
      // Real match: 1-1 at 90', 2-1 after extra time. User predicted a home win.
      const finalScore = resolveFinalScore({
        homeScore: 1,
        awayScore: 1,
        extraTimeHomeScore: 1,
        extraTimeAwayScore: 0,
      });
      expect(
        calculatePoints({ homeScore: 3, awayScore: 0 }, finalScore, cfg)
      ).toBe(3);
    });

    test("predicting the exact extra-time scoreline earns exact points", () => {
      const finalScore = resolveFinalScore({
        homeScore: 1,
        awayScore: 1,
        extraTimeHomeScore: 1,
        extraTimeAwayScore: 0,
      });
      expect(
        calculatePoints({ homeScore: 2, awayScore: 1 }, finalScore, cfg)
      ).toBe(5);
    });

    test("penalty shootout does not change the scoreline (stays a draw)", () => {
      // 1-1 at 90', 0-0 in extra time, decided on penalties -> scoreline 1-1.
      // The penalty shootout (e.g. 4-3) is a separate tiebreaker, not goals.
      const finalScore = resolveFinalScore({
        homeScore: 1,
        awayScore: 1,
        extraTimeHomeScore: 0,
        extraTimeAwayScore: 0,
      });
      expect(finalScore).toEqual({ homeScore: 1, awayScore: 1 });
      expect(
        calculatePoints({ homeScore: 1, awayScore: 1 }, finalScore, cfg)
      ).toBe(5);
    });

    test("treats missing extra-time fields as zero (regulation result)", () => {
      const result = resolveFinalScore({ homeScore: 2, awayScore: 0 });
      expect(result).toEqual({ homeScore: 2, awayScore: 0 });
    });

    test("treats null extra-time fields as zero", () => {
      const result = resolveFinalScore({
        homeScore: 0,
        awayScore: 0,
        extraTimeHomeScore: null,
        extraTimeAwayScore: null,
      });
      expect(result).toEqual({ homeScore: 0, awayScore: 0 });
    });
  });

  describe("resolveWinnerSide (knockout always has a winner)", () => {
    test("home wins on goals (regulation)", () => {
      expect(resolveWinnerSide({ homeScore: 2, awayScore: 1 })).toBe(1);
    });

    test("away wins on goals including extra time", () => {
      expect(
        resolveWinnerSide({
          homeScore: 1,
          awayScore: 1,
          extraTimeHomeScore: 0,
          extraTimeAwayScore: 1,
        })
      ).toBe(-1);
    });

    test("home advances on penalties when level after extra time", () => {
      expect(
        resolveWinnerSide({
          homeScore: 1,
          awayScore: 1,
          extraTimeHomeScore: 0,
          extraTimeAwayScore: 0,
          penaltyHomeScore: 4,
          penaltyAwayScore: 3,
        })
      ).toBe(1);
    });

    test("away advances on penalties when level after extra time", () => {
      expect(
        resolveWinnerSide({
          homeScore: 0,
          awayScore: 0,
          penaltyHomeScore: 2,
          penaltyAwayScore: 4,
        })
      ).toBe(-1);
    });

    test("returns 0 only when level and no penalties recorded yet", () => {
      expect(resolveWinnerSide({ homeScore: 1, awayScore: 1 })).toBe(0);
    });
  });

  describe("calculateKnockoutPoints", () => {
    test("draw prediction never scores (no draws in knockout)", () => {
      // 1-1 decided on penalties for home: predicting 1-1 earns nothing.
      expect(
        calculateKnockoutPoints(
          { homeScore: 1, awayScore: 1 },
          {
            homeScore: 1,
            awayScore: 1,
            penaltyHomeScore: 4,
            penaltyAwayScore: 3,
          },
          cfg
        )
      ).toBe(0);
    });

    test("draw prediction scores 0 even on a decisive scoreline", () => {
      expect(
        calculateKnockoutPoints(
          { homeScore: 0, awayScore: 0 },
          { homeScore: 2, awayScore: 1 },
          cfg
        )
      ).toBe(0);
    });

    test("backing the penalty winner earns correctWinner", () => {
      // 1-1, home wins on penalties; user predicted a home win.
      expect(
        calculateKnockoutPoints(
          { homeScore: 2, awayScore: 1 },
          {
            homeScore: 1,
            awayScore: 1,
            penaltyHomeScore: 4,
            penaltyAwayScore: 3,
          },
          cfg
        )
      ).toBe(3);
    });

    test("exact final scoreline including extra time earns exactScore", () => {
      // 1-1 at 90', 1-0 in extra time -> final 2-1; user predicted 2-1.
      expect(
        calculateKnockoutPoints(
          { homeScore: 2, awayScore: 1 },
          {
            homeScore: 1,
            awayScore: 1,
            extraTimeHomeScore: 1,
            extraTimeAwayScore: 0,
          },
          cfg
        )
      ).toBe(5);
    });

    test("backing the eventual extra-time winner without exact score earns correctWinner", () => {
      // final 2-1; user predicted 3-0 (home win, not exact).
      expect(
        calculateKnockoutPoints(
          { homeScore: 3, awayScore: 0 },
          {
            homeScore: 1,
            awayScore: 1,
            extraTimeHomeScore: 1,
            extraTimeAwayScore: 0,
          },
          cfg
        )
      ).toBe(3);
    });

    test("backing the wrong side earns 0", () => {
      // 1-1, home wins on penalties; user predicted an away win.
      expect(
        calculateKnockoutPoints(
          { homeScore: 1, awayScore: 2 },
          {
            homeScore: 1,
            awayScore: 1,
            penaltyHomeScore: 4,
            penaltyAwayScore: 3,
          },
          cfg
        )
      ).toBe(0);
    });
  });

  describe("custom config values", () => {
    const custom = { exactScore: 10, correctWinner: 6, correctDraw: 4 };

    test("uses custom exactScore", () => {
      expect(calculatePoints({ homeScore: 1, awayScore: 0 }, { homeScore: 1, awayScore: 0 }, custom)).toBe(10);
    });

    test("uses custom correctWinner", () => {
      expect(calculatePoints({ homeScore: 1, awayScore: 0 }, { homeScore: 2, awayScore: 0 }, custom)).toBe(6);
    });

    test("uses custom correctDraw", () => {
      expect(calculatePoints({ homeScore: 0, awayScore: 0 }, { homeScore: 1, awayScore: 1 }, custom)).toBe(4);
    });
  });
});
