import type { GroupStanding, TeamStanding } from "./standings";

export interface ThirdPlacedRanking {
  group: string;
  teamId: string;
  team: TeamStanding["team"];
  points: number;
  goalDifference: number;
  goalsFor: number;
  seed: number;
}

export function rankBestThirds(groups: GroupStanding[]): ThirdPlacedRanking[] {
  const thirds = groups
    .map((g) => {
      const third = g.standings.find((s) => s.position === 3);
      if (!third) return null;
      return {
        group: g.group,
        teamId: third.teamId,
        team: third.team,
        points: third.points,
        goalDifference: third.goalDifference,
        goalsFor: third.goalsFor,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });

  return thirds.map((t, i) => ({ ...t, seed: i + 1 }));
}

export type SlotRef =
  | { type: "winner"; group: string }
  | { type: "runnerUp"; group: string }
  | { type: "thirdSeed"; seed: number };

export interface BracketRule {
  matchNumber: number;
  home: SlotRef;
  away: SlotRef;
}

const winner = (group: string): SlotRef => ({ type: "winner", group });
const runnerUp = (group: string): SlotRef => ({ type: "runnerUp", group });
const thirdSeed = (seed: number): SlotRef => ({ type: "thirdSeed", seed });

export const BRACKET_RULES_2026: BracketRule[] = [
  { matchNumber: 73, home: winner("A"), away: thirdSeed(1) },
  { matchNumber: 74, home: winner("B"), away: runnerUp("I") },
  { matchNumber: 75, home: winner("C"), away: thirdSeed(2) },
  { matchNumber: 76, home: winner("D"), away: runnerUp("J") },
  { matchNumber: 77, home: winner("E"), away: thirdSeed(3) },
  { matchNumber: 78, home: winner("F"), away: runnerUp("K") },
  { matchNumber: 79, home: winner("G"), away: thirdSeed(4) },
  { matchNumber: 80, home: winner("H"), away: runnerUp("L") },
  { matchNumber: 81, home: winner("I"), away: thirdSeed(5) },
  { matchNumber: 82, home: winner("J"), away: thirdSeed(6) },
  { matchNumber: 83, home: winner("K"), away: thirdSeed(7) },
  { matchNumber: 84, home: winner("L"), away: thirdSeed(8) },
  { matchNumber: 85, home: runnerUp("A"), away: runnerUp("H") },
  { matchNumber: 86, home: runnerUp("B"), away: runnerUp("G") },
  { matchNumber: 87, home: runnerUp("C"), away: runnerUp("F") },
  { matchNumber: 88, home: runnerUp("D"), away: runnerUp("E") },
];

export interface ResolvedSlot {
  homeTeamId: string | null;
  awayTeamId: string | null;
}

function resolveSlot(
  slot: SlotRef,
  groups: GroupStanding[],
  bestThirds: ThirdPlacedRanking[]
): string | null {
  if (slot.type === "thirdSeed") {
    return bestThirds.find((t) => t.seed === slot.seed)?.teamId ?? null;
  }
  const group = groups.find((g) => g.group === slot.group);
  if (!group) return null;
  const targetPosition = slot.type === "winner" ? 1 : 2;
  return group.standings.find((s) => s.position === targetPosition)?.teamId ?? null;
}

export function resolveBracket(
  groups: GroupStanding[],
  bestThirds: ThirdPlacedRanking[]
): Map<number, ResolvedSlot> {
  const out = new Map<number, ResolvedSlot>();
  for (const rule of BRACKET_RULES_2026) {
    out.set(rule.matchNumber, {
      homeTeamId: resolveSlot(rule.home, groups, bestThirds),
      awayTeamId: resolveSlot(rule.away, groups, bestThirds),
    });
  }
  return out;
}
