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
