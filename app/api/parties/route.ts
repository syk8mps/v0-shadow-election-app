import { neon } from "@neondatabase/serverless"
import { getAdminConnection, verifyAdminPassword } from "@/lib/admin-db-auth"

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
    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      return Response.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)
    const parties = await sql`
      SELECT id, name, abbreviation, color, logo_url
      FROM parties 
      ORDER BY display_order ASC
    `

    return Response.json(parties)
  } catch (error) {
    console.error("Error fetching parties:", error)
    return Response.json(
      { error: "Failed to fetch parties", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { partyId, logoUrl, adminPassword } = await request.json()

    if (!adminPassword) {
      return Response.json({ error: "Admin password is required" }, { status: 401 })
    }

    if (!verifyAdminPassword(adminPassword)) {
      return Response.json({ error: "Invalid admin password" }, { status: 403 })
    }

    if (!partyId) {
      return Response.json({ error: "Party ID is required" }, { status: 400 })
    }

    // Get admin connection with RLS bypass
    const sql = await getAdminConnection(adminPassword)

    await sql`
      UPDATE parties 
      SET logo_url = ${logoUrl || null}
      WHERE id = ${partyId}
    `

    return Response.json({ success: true, message: "Logo updated successfully" })
  } catch (error) {
    console.error("Error updating party logo:", error)

    if (error instanceof Error && error.message === "Admin authentication failed") {
      return Response.json({ error: "Authentication failed" }, { status: 403 })
    }

    return Response.json(
      { error: "Failed to update logo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
