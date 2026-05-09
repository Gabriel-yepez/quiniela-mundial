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
