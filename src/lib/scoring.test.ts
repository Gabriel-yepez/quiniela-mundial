import { describe, test, expect } from "vitest";
import { calculatePoints } from "./scoring";

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
