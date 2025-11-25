import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL
  )
}

export async function GET() {
  try {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ candidates: [] }, { status: 200 })
    }

    const sql = neon(databaseUrl)
    const candidates = await sql`
      SELECT c.id, c.name, c.position, c.party_id, p.name as party_name
      FROM candidates c
      JOIN parties p ON c.party_id = p.id
      ORDER BY p.display_order, c.position ASC
    `

    return Response.json({ candidates: candidates || [] })
  } catch (error) {
    console.error("Error fetching all candidates:", error)
    return Response.json(
      { candidates: [], error: "Failed to fetch candidates" },
      { status: 500 }
    )
  }
}
