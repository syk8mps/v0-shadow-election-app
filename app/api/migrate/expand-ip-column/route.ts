import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL
  )
}

export async function POST() {
  try {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    // Expand client_ip column to handle device fingerprints
    await sql`
      ALTER TABLE votes 
      ALTER COLUMN client_ip TYPE VARCHAR(255)
    `

    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_votes_client_ip ON votes(client_ip)
    `

    return Response.json({
      success: true,
      message: "Client IP column expanded successfully",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return Response.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
