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
