import { describe, test, expect } from "vitest";
import { rankBestThirds } from "./bracket";
import type { GroupStanding } from "./standings";

function third(opts: {
  group: string;
  teamId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  name?: string;
}): GroupStanding {
  const { group, teamId, points, goalDifference, goalsFor } = opts;
  return {
    group,
    standings: [
      placeholderStanding(`${group}-1`, 1, group),
      placeholderStanding(`${group}-2`, 2, group),
      {
        teamId,
        team: {
          name: opts.name ?? `Team-${teamId}`,
          code: teamId.slice(0, 3).toUpperCase(),
          flagUrl: null,
        },
        matchesPlayed: 3,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor,
        goalsAgainst: goalsFor - goalDifference,
        goalDifference,
        points,
        position: 3,
      },
      placeholderStanding(`${group}-4`, 4, group),
    ],
  };
}

function placeholderStanding(id: string, position: number, group: string) {
  return {
    teamId: id,
    team: { name: id, code: id, flagUrl: null },
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    position,
  };
}

describe("rankBestThirds", () => {
  test("orders by points then goalDifference then goalsFor then name", () => {
    const groups: GroupStanding[] = [
      third({ group: "A", teamId: "tA", points: 6, goalDifference: 3, goalsFor: 5 }),
      third({ group: "B", teamId: "tB", points: 7, goalDifference: 1, goalsFor: 4 }),
      third({ group: "C", teamId: "tC", points: 6, goalDifference: 4, goalsFor: 5 }),
      third({ group: "D", teamId: "tD", points: 6, goalDifference: 3, goalsFor: 7 }),
    ];

    const ranked = rankBestThirds(groups);

    expect(ranked.map((r) => r.teamId)).toEqual(["tB", "tC", "tD", "tA"]);
    expect(ranked.map((r) => r.seed)).toEqual([1, 2, 3, 4]);
    expect(ranked.map((r) => r.group)).toEqual(["B", "C", "D", "A"]);
  });

  test("breaks final ties by team name alphabetically", () => {
    const groups: GroupStanding[] = [
      third({
        group: "A",
        teamId: "tA",
        points: 4,
        goalDifference: 0,
        goalsFor: 2,
        name: "Zeta",
      }),
      third({
        group: "B",
        teamId: "tB",
        points: 4,
        goalDifference: 0,
        goalsFor: 2,
        name: "Alfa",
      }),
    ];

    const ranked = rankBestThirds(groups);

    expect(ranked.map((r) => r.teamId)).toEqual(["tB", "tA"]);
  });

  test("skips groups without a 3rd-position entry", () => {
    const groups: GroupStanding[] = [
      { group: "A", standings: [] },
    ];

    expect(rankBestThirds(groups)).toEqual([]);
  });
});

import { resolveBracket, BRACKET_RULES_2026 } from "./bracket";

describe("BRACKET_RULES_2026", () => {
  test("covers exactly the 16 round32 matches (#73-#88)", () => {
    const numbers = BRACKET_RULES_2026.map((r) => r.matchNumber).sort(
      (a, b) => a - b
    );
    expect(numbers).toEqual([
      73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
    ]);
  });

  test("uses each of the 12 winners and 12 runners-up exactly once", () => {
    const winners: string[] = [];
    const runners: string[] = [];
    for (const rule of BRACKET_RULES_2026) {
      for (const slot of [rule.home, rule.away]) {
        if (slot.type === "winner") winners.push(slot.group);
        if (slot.type === "runnerUp") runners.push(slot.group);
      }
    }
    expect(winners.sort()).toEqual(
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].sort()
    );
    expect(runners.sort()).toEqual(
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].sort()
    );
  });

  test("uses third seeds 1..8 exactly once", () => {
    const seeds: number[] = [];
    for (const rule of BRACKET_RULES_2026) {
      for (const slot of [rule.home, rule.away]) {
        if (slot.type === "thirdSeed") seeds.push(slot.seed);
      }
    }
    expect(seeds.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("resolveBracket", () => {
  function buildGroup(letter: string, ids: string[]): GroupStanding {
    return {
      group: letter,
      standings: ids.map((id, i) => ({
        teamId: id,
        team: { name: id, code: id, flagUrl: null },
        matchesPlayed: 3,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 9 - i * 3,
        position: i + 1,
      })),
    };
  }

  test("resolves all 16 matches when 12 groups are complete", () => {
    const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(
      (letter) =>
        buildGroup(letter, [
          `${letter}1`,
          `${letter}2`,
          `${letter}3`,
          `${letter}4`,
        ])
    );
    groups.forEach((g, idx) => {
      const t3 = g.standings[2];
      t3.points = 12 - idx;
    });

    const bestThirds = rankBestThirds(groups);
    const resolved = resolveBracket(groups, bestThirds);

    expect(resolved.size).toBe(16);
    for (const [, pair] of resolved) {
      expect(pair.homeTeamId).not.toBeNull();
      expect(pair.awayTeamId).not.toBeNull();
    }
  });

  test("returns null slots when source group is missing", () => {
    const groups: GroupStanding[] = [];
    const resolved = resolveBracket(groups, []);
    expect(resolved.size).toBe(16);
    for (const [, pair] of resolved) {
      expect(pair.homeTeamId).toBeNull();
      expect(pair.awayTeamId).toBeNull();
    }
  });

  test("is deterministic for the same input", () => {
    const groups = ["A", "B"].map((letter) =>
      buildGroup(letter, [`${letter}1`, `${letter}2`, `${letter}3`, `${letter}4`])
    );
    const a = resolveBracket(groups, rankBestThirds(groups));
    const b = resolveBracket(groups, rankBestThirds(groups));
    expect([...a.entries()]).toEqual([...b.entries()]);
  });
});
