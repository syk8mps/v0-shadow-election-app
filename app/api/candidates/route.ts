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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partyId = searchParams.get("partyId")

    console.log("[v0] Fetching candidates for partyId:", partyId)

    if (!partyId) {
      return Response.json({ error: "partyId is required" }, { status: 400 })
    }

    const databaseUrl = getDatabaseUrl()
    console.log("[v0] Using database URL:", databaseUrl ? "configured" : "NOT configured")
    
    if (!databaseUrl) {
      return Response.json({ error: "Database URL not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)
    console.log("[v0] Executing candidates query...")
    const candidates = await sql`
      SELECT id, name, position, party_id 
      FROM candidates 
      WHERE party_id = ${parseInt(partyId)}
      ORDER BY position ASC
    `

    console.log("[v0] Candidates fetched:", candidates?.length)
    return Response.json(candidates || [])
  } catch (error) {
    console.error("[v0] Error fetching candidates:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error details:", errorMessage)
    return Response.json(
      { error: "Failed to fetch candidates", details: errorMessage },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { partyId, name, position } = await request.json()

    if (!partyId || !name) {
      return Response.json({ error: "partyId and name are required" }, { status: 400 })
    }

    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ error: "Database URL not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    // Get the next position if not provided
    let finalPosition = position
    if (!finalPosition) {
      const maxPosition = await sql`
        SELECT COALESCE(MAX(position), 0) as max_pos 
        FROM candidates 
        WHERE party_id = ${partyId}
      `
      finalPosition = (maxPosition[0]?.max_pos || 0) + 1
    }

    const result = await sql`
      INSERT INTO candidates (party_id, name, position)
      VALUES (${partyId}, ${name}, ${finalPosition})
      RETURNING id, name, position, party_id
    `

    console.log("[v0] Candidate created:", result[0])
    return Response.json(result[0])
  } catch (error) {
    console.error("[v0] Error creating candidate:", error)
    return Response.json(
      { error: "Failed to create candidate", details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get("id")

    if (!candidateId) {
      return Response.json({ error: "id is required" }, { status: 400 })
    }

    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ error: "Database URL not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)
    await sql`DELETE FROM candidates WHERE id = ${parseInt(candidateId)}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting candidate:", error)
    return Response.json(
      { error: "Failed to delete candidate", details: String(error) },
      { status: 500 }
    )
  }
}
