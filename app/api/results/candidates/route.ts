import { neon } from "@neondatabase/serverless"

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

    const results = await sql`
      SELECT 
        p.id,
        p.name,
        p.abbreviation,
        p.color,
        p.display_order,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) as votes,
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 1 ELSE 0 END), 0) as counter_votes,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 0.5 ELSE 0 END), 0) as net_votes,
        COALESCE(SUM(CASE WHEN v.vote_candidate_id = c.id THEN 1 ELSE 0 END), 0) as voorstemmen_candidate,
        COALESCE(SUM(CASE WHEN v.counter_candidate_id = c.id THEN 1 ELSE 0 END), 0) as tegenstemmen_candidate,
        c.id as candidate_id,
        c.name as candidate_name
      FROM parties p
      LEFT JOIN votes v ON (v.vote_party_id = p.id OR v.counter_party_id = p.id)
      LEFT JOIN candidates c ON c.party_id = p.id
      GROUP BY p.id, p.name, p.abbreviation, p.color, p.display_order, c.id, c.name
      ORDER BY p.display_order ASC, c.name
    `

    const groupedResults = results.reduce((acc: any, row: any) => {
      const party = acc.find((p: any) => p.id === row.id)
      if (party) {
        if (row.candidate_id && row.candidate_name) {
          party.candidates.push({
            id: row.candidate_id,
            name: row.candidate_name,
            voorstemmen: row.voorstemmen_candidate,
            tegenstemmen: row.tegenstemmen_candidate,
          })
        }
      } else {
        acc.push({
          id: row.id,
          name: row.name,
          abbreviation: row.abbreviation,
          color: row.color,
          votes: row.votes,
          counterVotes: row.counter_votes,
          netVotes: Number.parseFloat(row.net_votes) || 0,
          candidates: row.candidate_id ? [{
            id: row.candidate_id,
            name: row.candidate_name,
            voorstemmen: row.voorstemmen_candidate,
            tegenstemmen: row.tegenstemmen_candidate,
          }] : [],
        })
      }
      return acc
    }, [])

    return Response.json({ results: groupedResults })
  } catch (error) {
    console.error("[v0] Error fetching candidate results:", error)
    return Response.json({ error: "Failed to fetch results", details: String(error) }, { status: 500 })
  }
}
