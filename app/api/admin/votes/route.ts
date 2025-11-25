import { neon } from "@neondatabase/serverless"

const sql = neon(
  process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    "",
)

// Helper to verify admin password
function verifyAdminPassword(password: string | null | undefined): boolean {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD
  return !!password && !!adminPassword && password === adminPassword
}

// GET - Fetch all votes (admin only)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const password = authHeader?.replace("Bearer ", "")

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const votes = await sql`
      SELECT 
        v.id,
        v.created_at,
        v.user_session_id,
        vp.name as vote_party_name,
        vp.abbreviation as vote_party_abbr,
        cp.name as counter_party_name,
        cp.abbreviation as counter_party_abbr,
        vc.name as vote_candidate_name,
        cc.name as counter_candidate_name
      FROM votes v
      LEFT JOIN parties vp ON v.vote_party_id = vp.id
      LEFT JOIN parties cp ON v.counter_party_id = cp.id
      LEFT JOIN candidates vc ON v.vote_candidate_id = vc.id
      LEFT JOIN candidates cc ON v.counter_candidate_id = cc.id
      ORDER BY v.created_at DESC
    `

    return Response.json({ votes })
  } catch (error) {
    console.error("Error fetching votes:", error)
    return Response.json({ error: "Failed to fetch votes", details: String(error) }, { status: 500 })
  }
}

// POST - Add a manual vote (admin only)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const password = authHeader?.replace("Bearer ", "")

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { votePartyId, counterPartyId, voteCandidateId, counterCandidateId } = await request.json()

    if (!votePartyId || !counterPartyId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO votes (
        user_session_id, 
        vote_party_id, 
        counter_party_id,
        vote_candidate_id,
        counter_candidate_id
      ) VALUES (
        ${sessionId}, 
        ${votePartyId}, 
        ${counterPartyId},
        ${voteCandidateId || null},
        ${counterCandidateId || null}
      )
    `

    return Response.json({ success: true, message: "Vote added successfully" })
  } catch (error) {
    console.error("Error adding vote:", error)
    return Response.json({ error: "Failed to add vote", details: String(error) }, { status: 500 })
  }
}

// DELETE - Delete a specific vote or reset all votes (admin only)
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const password = authHeader?.replace("Bearer ", "")

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const voteId = searchParams.get("id")
    const resetAll = searchParams.get("resetAll")

    if (resetAll === "true") {
      await sql`DELETE FROM votes`
      return Response.json({ success: true, message: "All votes reset successfully" })
    } else if (voteId) {
      await sql`DELETE FROM votes WHERE id = ${voteId}`
      return Response.json({ success: true, message: "Vote deleted successfully" })
    } else {
      return Response.json({ error: "Missing voteId or resetAll parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting votes:", error)
    return Response.json({ error: "Failed to delete votes", details: String(error) }, { status: 500 })
  }
}
