export interface MatchScores {
  homeScore: number;
  awayScore: number;
  extraTimeHomeScore?: number | null;
  extraTimeAwayScore?: number | null;
}

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
