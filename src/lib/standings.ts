export interface StandingTeam {
  name: string;
  code: string;
  flagUrl: string | null;
}

export interface TeamStanding {
  teamId: string;
  team: StandingTeam;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface GroupStanding {
  group: string;
  standings: TeamStanding[];
}

export interface StandingMatch {
  status: string;
  group: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface StandingTeamInput {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
  group: string;
}

function emptyStanding(team: StandingTeamInput): TeamStanding {
  return {
    teamId: team.id,
    team: { name: team.name, code: team.code, flagUrl: team.flagUrl },
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    position: 0,
  };
}

export function computeGroupStandings(
  teams: StandingTeamInput[],
  matches: StandingMatch[]
): GroupStanding[] {
  const byGroup = new Map<string, StandingTeamInput[]>();
  for (const team of teams) {
    const list = byGroup.get(team.group);
    if (list) list.push(team);
    else byGroup.set(team.group, [team]);
  }

  const groups: GroupStanding[] = [];

  const sortedGroups = [...byGroup.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [group, groupTeams] of sortedGroups) {
    const stats = new Map<string, TeamStanding>(
      groupTeams.map((t) => [t.id, emptyStanding(t)])
    );

    for (const m of matches) {
      if (m.status !== "finished") continue;
      if (m.group !== group) continue;
      if (
        m.homeTeamId == null ||
        m.awayTeamId == null ||
        m.homeScore == null ||
        m.awayScore == null
      ) {
        continue;
      }
      const home = stats.get(m.homeTeamId);
      const away = stats.get(m.awayTeamId);
      if (!home || !away) continue;

      home.matchesPlayed += 1;
      away.matchesPlayed += 1;
      home.goalsFor += m.homeScore;
      home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore;
      away.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (m.homeScore < m.awayScore) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    }

    const standings = [...stats.values()];
    for (const s of standings) {
      s.goalDifference = s.goalsFor - s.goalsAgainst;
    }

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

    standings.forEach((s, i) => {
      s.position = i + 1;
    });

    groups.push({ group, standings });
  }

  return groups;
}
