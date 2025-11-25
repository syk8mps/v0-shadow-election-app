import { neon } from "@neondatabase/serverless"
import { calculateSeats } from "@/lib/seat-calculator"

const getDatabaseUrl = () => {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL
  )
}

export async function GET() {
  try {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    // Fetch party results with vote counts
    const partyResults = await sql`
      SELECT 
        p.id,
        p.name,
        p.abbreviation,
        p.color,
        p.logo_url,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) as voorstemmen,
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 1 ELSE 0 END), 0) as tegenstemmen,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 0.5 ELSE 0 END), 0) as netto
      FROM parties p
      LEFT JOIN votes v ON (v.vote_party_id = p.id OR v.counter_party_id = p.id)
      GROUP BY p.id, p.name, p.abbreviation, p.color, p.logo_url
      ORDER BY netto DESC
    `

    // Fetch candidate results
    const candidateResults = await sql`
      SELECT 
        c.id,
        c.name,
        c.party_id,
        COALESCE(SUM(CASE WHEN v.vote_candidate_id = c.id THEN 1 ELSE 0 END), 0) as voorstemmen,
        COALESCE(SUM(CASE WHEN v.counter_candidate_id = c.id THEN 1 ELSE 0 END), 0) as tegenstemmen
      FROM candidates c
      LEFT JOIN votes v ON (v.vote_candidate_id = c.id OR v.counter_candidate_id = c.id)
      GROUP BY c.id, c.name, c.party_id
      ORDER BY c.party_id, c.position
    `

    // Get total number of votes
    const totalVotesResult = await sql`
      SELECT COUNT(DISTINCT user_session_id) as total FROM votes
    `
    const totalVoters = Number(totalVotesResult[0]?.total || 0)

    // Transform results for seat calculation
    const transformedResults = partyResults.map((r: any) => ({
      id: r.id,
      name: r.name,
      abbreviation: r.abbreviation,
      color: r.color,
      logoUrl: r.logo_url,
      votes: Number(r.voorstemmen),
      counterVotes: Number(r.tegenstemmen),
      netVotes: Number(r.netto),
    }))

    // Calculate seats using D'Hondt method
    const seatMap = calculateSeats(
      transformedResults.map((r: any) => ({
        abbreviation: r.abbreviation,
        netVotes: r.netVotes,
      })),
      150,
    )

    // Add candidates to each party
    const results = transformedResults.map((party: any) => {
      const partyCandidates = candidateResults.filter((c: any) => c.party_id === party.id)

      return {
        ...party,
        seats: seatMap.get(party.abbreviation) || 0,
        candidates: partyCandidates.map((c: any) => ({
          id: Number(c.id),
          name: String(c.name),
          voorstemmen: Number(c.voorstemmen),
          tegenstemmen: Number(c.tegenstemmen),
        })),
      }
    })

    return Response.json({
      results,
      totalVoters,
      totalSeats: 150,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Results API Error:", errorMessage)

    return Response.json(
      {
        error: "Failed to fetch results",
        details: errorMessage,
        results: [],
        totalVoters: 0,
        totalSeats: 150,
      },
      { status: 500 },
    )
  }
}
