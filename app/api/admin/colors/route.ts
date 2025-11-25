import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl, verifyAdminPassword } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    console.log("[v0] Color update request received")

    if (!verifyAdminPassword(request)) {
      console.log("[v0] Authentication failed")
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Authentication successful")

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { partyId, color } = body

    if (!partyId || !color) {
      console.log("[v0] Missing partyId or color")
      return Response.json({ error: "Missing partyId or color" }, { status: 400 })
    }

    console.log("[v0] Updating party", partyId, "with color", color)

    const sql = neon(getDatabaseUrl())

    const result = await sql`
      UPDATE parties 
      SET color = ${color}
      WHERE id = ${partyId}
      RETURNING *
    `

    console.log("[v0] Update result:", result)

    if (result.length === 0) {
      console.log("[v0] No party found with id", partyId)
      return Response.json({ error: "Party not found" }, { status: 404 })
    }

    console.log("[v0] Successfully updated party color")
    return Response.json({ success: true, party: result[0] })
  } catch (error) {
    console.error("[v0] Error updating party color:", error)
    return Response.json(
      {
        error: "Failed to update color",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
