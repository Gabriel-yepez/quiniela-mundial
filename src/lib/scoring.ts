export interface MatchScores {
  homeScore: number;
  awayScore: number;
  extraTimeHomeScore?: number | null;
  extraTimeAwayScore?: number | null;
  penaltyHomeScore?: number | null;
  penaltyAwayScore?: number | null;
}

type WinnerSide = 1 | -1 | 0;

/**
 * Final scoreline used to grade predictions. Extra-time goals are added on top
 * of the regulation score, so a knockout match decided in extra time is scored
 * by its true final result instead of the 90' draw. Penalty shootouts only
 * break ties and never change the scoreline, so they are intentionally ignored.
 */
export function resolveFinalScore(match: MatchScores): {
  homeScore: number;
  awayScore: number;
} {
  return {
    homeScore: match.homeScore + (match.extraTimeHomeScore ?? 0),
    awayScore: match.awayScore + (match.extraTimeAwayScore ?? 0),
  };
}

/**
 * Side that advanced in a knockout match. Goals (regulation + extra time)
 * decide it, and if still level the penalty shootout does. Returns 1 (home),
 * -1 (away), or 0 only when the match is level and no shootout was recorded.
 */
export function resolveWinnerSide(match: MatchScores): WinnerSide {
  const final = resolveFinalScore(match);
  const byGoals = Math.sign(final.homeScore - final.awayScore) as WinnerSide;
  if (byGoals !== 0) return byGoals;

  return Math.sign(
    (match.penaltyHomeScore ?? 0) - (match.penaltyAwayScore ?? 0)
  ) as WinnerSide;
}

/**
 * Scores a prediction for a knockout match. There is always a winner, so a
 * draw prediction can never be correct and earns nothing. Otherwise an exact
 * final scoreline (regulation + extra time) earns exactScore, and picking the
 * side that advanced — including via penalties — earns correctWinner.
 */
export function calculateKnockoutPoints(
  prediction: { homeScore: number; awayScore: number },
  match: MatchScores,
  config: { exactScore: number; correctWinner: number; correctDraw: number }
): number {
  if (prediction.homeScore === prediction.awayScore) {
    return 0;
  }

  const final = resolveFinalScore(match);
  if (
    prediction.homeScore === final.homeScore &&
    prediction.awayScore === final.awayScore
  ) {
    return config.exactScore;
  }

  const predSide = Math.sign(
    prediction.homeScore - prediction.awayScore
  ) as WinnerSide;
  return predSide === resolveWinnerSide(match) ? config.correctWinner : 0;
}

export function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  result: { homeScore: number; awayScore: number },
  config: { exactScore: number; correctWinner: number; correctDraw: number }
): number {
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return config.exactScore;
  }

  const predOutcome = Math.sign(prediction.homeScore - prediction.awayScore);
  const realOutcome = Math.sign(result.homeScore - result.awayScore);

  if (predOutcome === realOutcome) {
    return realOutcome === 0 ? config.correctDraw : config.correctWinner;
  }

  return 0;
}
