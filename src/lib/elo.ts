/** Formula ELO classica: probabilita' attesa di successo dell'utente contro il rating del puzzle. */
export function expectedScore(userElo: number, puzzleRating: number): number {
  return 1 / (1 + 10 ** ((puzzleRating - userElo) / 400))
}

const K_FACTOR = 20

/** Nuovo ELO utente dopo un tentativo (solved = true/false), formula classica. */
export function updateElo(
  userElo: number,
  puzzleRating: number,
  solved: boolean,
): number {
  const expected = expectedScore(userElo, puzzleRating)
  const score = solved ? 1 : 0
  return Math.round(userElo + K_FACTOR * (score - expected))
}
