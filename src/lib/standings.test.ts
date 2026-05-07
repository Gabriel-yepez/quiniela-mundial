import { describe, test, expect } from "vitest";
import {
  computeGroupStandings,
  type StandingMatch,
  type StandingTeamInput,
} from "./standings";

const teams: StandingTeamInput[] = [
  { id: "t1", name: "Alfa", code: "ALF", flagUrl: null, group: "A" },
  { id: "t2", name: "Beta", code: "BET", flagUrl: null, group: "A" },
  { id: "t3", name: "Gama", code: "GAM", flagUrl: null, group: "A" },
  { id: "t4", name: "Delta", code: "DEL", flagUrl: null, group: "A" },
  { id: "t5", name: "Eco", code: "ECO", flagUrl: null, group: "B" },
  { id: "t6", name: "Foxtrot", code: "FOX", flagUrl: null, group: "B" },
];

function match(
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  group = "A",
  status = "finished"
): StandingMatch {
  return { status, group, homeTeamId, awayTeamId, homeScore, awayScore };
}

describe("computeGroupStandings", () => {
  test("returns one entry per distinct group, sorted alphabetically", () => {
    const result = computeGroupStandings(teams, []);
    expect(result.map((g) => g.group)).toEqual(["A", "B"]);
  });

  test("each group includes all its teams with zeros when no matches finished", () => {
    const result = computeGroupStandings(teams, []);
    const groupA = result.find((g) => g.group === "A")!;
    expect(groupA.standings).toHaveLength(4);
    for (const s of groupA.standings) {
      expect(s.matchesPlayed).toBe(0);
      expect(s.points).toBe(0);
      expect(s.goalDifference).toBe(0);
    }
  });

  test("ignores matches that are not finished", () => {
    const matches = [match("t1", "t2", 3, 0, "A", "scheduled")];
    const result = computeGroupStandings(teams, matches);
    const t1 = result[0].standings.find((s) => s.teamId === "t1")!;
    expect(t1.matchesPlayed).toBe(0);
    expect(t1.points).toBe(0);
  });

  test("ignores matches outside the team's group", () => {
    const matches = [match("t5", "t6", 2, 1, "B")];
    const result = computeGroupStandings(teams, matches);
    const groupA = result.find((g) => g.group === "A")!;
    for (const s of groupA.standings) {
      expect(s.matchesPlayed).toBe(0);
    }
  });

  test("home win awards 3 to home and 0 to away", () => {
    const matches = [match("t1", "t2", 2, 1)];
    const result = computeGroupStandings(teams, matches);
    const groupA = result[0].standings;
    const t1 = groupA.find((s) => s.teamId === "t1")!;
    const t2 = groupA.find((s) => s.teamId === "t2")!;
    expect(t1.wins).toBe(1);
    expect(t1.points).toBe(3);
    expect(t2.losses).toBe(1);
    expect(t2.points).toBe(0);
  });

  test("draw awards 1 point to each team", () => {
    const matches = [match("t1", "t2", 1, 1)];
    const result = computeGroupStandings(teams, matches);
    const t1 = result[0].standings.find((s) => s.teamId === "t1")!;
    const t2 = result[0].standings.find((s) => s.teamId === "t2")!;
    expect(t1.draws).toBe(1);
    expect(t1.points).toBe(1);
    expect(t2.draws).toBe(1);
    expect(t2.points).toBe(1);
  });

  test("accumulates goals for and against, computes goal difference", () => {
    const matches = [match("t1", "t2", 3, 1), match("t1", "t3", 0, 2)];
    const result = computeGroupStandings(teams, matches);
    const t1 = result[0].standings.find((s) => s.teamId === "t1")!;
    expect(t1.goalsFor).toBe(3);
    expect(t1.goalsAgainst).toBe(3);
    expect(t1.goalDifference).toBe(0);
    expect(t1.matchesPlayed).toBe(2);
  });

  test("sorts by points desc, then goal difference desc, then goals for desc", () => {
    const matches = [
      match("t1", "t4", 5, 0),
      match("t2", "t4", 1, 0),
      match("t3", "t4", 1, 0),
      match("t1", "t2", 1, 1),
      match("t1", "t3", 1, 1),
      match("t2", "t3", 0, 0),
    ];
    const result = computeGroupStandings(teams, matches);
    const groupA = result[0].standings;
    expect(groupA.map((s) => s.teamId)).toEqual(["t1", "t2", "t3", "t4"]);
    expect(groupA[0].position).toBe(1);
    expect(groupA[3].position).toBe(4);
  });

  test("breaks ties by alphabetical name when points/GD/GF all equal", () => {
    const matches = [match("t2", "t1", 0, 0), match("t4", "t3", 0, 0)];
    const result = computeGroupStandings(teams, matches);
    const order = result[0].standings.map((s) => s.team.name);
    expect(order).toEqual(["Alfa", "Beta", "Delta", "Gama"]);
  });

  test("skips matches without team ids or scores", () => {
    const matches: StandingMatch[] = [
      {
        status: "finished",
        group: "A",
        homeTeamId: null,
        awayTeamId: "t2",
        homeScore: 1,
        awayScore: 0,
      },
      {
        status: "finished",
        group: "A",
        homeTeamId: "t1",
        awayTeamId: "t2",
        homeScore: null,
        awayScore: null,
      },
    ];
    const result = computeGroupStandings(teams, matches);
    for (const s of result[0].standings) {
      expect(s.matchesPlayed).toBe(0);
    }
  });
});
