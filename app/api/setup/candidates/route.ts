import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    ""
  )
}

export async function POST(request: Request) {
  try {
    const { candidates } = await request.json()
    
    if (!candidates || !Array.isArray(candidates)) {
      return Response.json({ error: "Invalid candidates format" }, { status: 400 })
    }

    const sql = neon(getDatabaseUrl())

    // Insert candidates one by one
    for (const candidate of candidates) {
      if (!candidate.name || !candidate.partyAbbreviation) continue

      await sql`
        INSERT INTO candidates (name, position, party_id)
        SELECT ${candidate.name}, ${candidate.position}, id 
        FROM parties 
        WHERE abbreviation = ${candidate.partyAbbreviation.toUpperCase()}
      `
    }

    return Response.json({ success: true, inserted: candidates.length })
  } catch (error) {
    console.error("[v0] Error inserting candidates:", error)
    return Response.json({ error: "Failed to insert candidates" }, { status: 500 })
  }
}
