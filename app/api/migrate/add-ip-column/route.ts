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

    // Check if column already exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND column_name = 'client_ip'
    `

    if (columnCheck.length > 0) {
      return Response.json({
        message: "Column client_ip already exists",
        alreadyExists: true,
      })
    }

    // Add the client_ip column
    await sql`
      ALTER TABLE votes 
      ADD COLUMN client_ip VARCHAR(45)
    `

    // Create index for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_votes_client_ip ON votes(client_ip)
    `

    return Response.json({
      success: true,
      message: "Successfully added client_ip column to votes table",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return Response.json(
      {
        error: "Failed to run migration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
