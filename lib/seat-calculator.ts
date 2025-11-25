export function calculateSeats(
  parties: Array<{ abbreviation: string; netVotes: number }>,
  totalSeats = 150,
): Map<string, number> {
  // Filter out parties with zero or negative votes
  const validParties = parties.filter((p) => p.netVotes > 0)

  if (validParties.length === 0) {
    return new Map()
  }

  // Initialize seat distribution
  const seats = new Map<string, number>()
  validParties.forEach((p) => seats.set(p.abbreviation, 0))

  // D'Hondt method: distribute seats one by one
  for (let i = 0; i < totalSeats; i++) {
    let maxRatio = 0
    let winningParty = ""

    // Find party with highest ratio (votes / (seats + 1))
    for (const party of validParties) {
      const currentSeats = seats.get(party.abbreviation) || 0
      const ratio = party.netVotes / (currentSeats + 1)

      if (ratio > maxRatio) {
        maxRatio = ratio
        winningParty = party.abbreviation
      }
    }

    // Award seat to winning party
    if (winningParty) {
      seats.set(winningParty, (seats.get(winningParty) || 0) + 1)
    }
  }

  return seats
}
