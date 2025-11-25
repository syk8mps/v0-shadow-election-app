import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { getClientIP, combineIPAndFingerprint } from "@/lib/device-fingerprint"

const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL
  )
}

async function isTestModeEnabled(sql: any): Promise<boolean> {
  try {
    const result = await sql`
      SELECT setting_value FROM admin_settings WHERE setting_key = 'test_mode_enabled'
    `
    return result[0]?.setting_value === "true"
  } catch (error) {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ hasVoted: false })
    }

    const sql = neon(databaseUrl)

    const testMode = await isTestModeEnabled(sql)
    if (testMode) {
      return Response.json({ hasVoted: false })
    }

    const cookieStore = await cookies()
    const clientIP = getClientIP(request)

    const url = new URL(request.url)
    const deviceFingerprint = url.searchParams.get("fingerprint")

    const uniqueIdentifier = deviceFingerprint ? combineIPAndFingerprint(clientIP, deviceFingerprint) : clientIP

    // Check if client_ip column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND column_name = 'client_ip'
    `
    const hasIPColumn = columnCheck.length > 0

    if (hasIPColumn) {
      const existingVoteByIP = await sql`
        SELECT id FROM votes WHERE client_ip = ${uniqueIdentifier} LIMIT 1
      `

      if (existingVoteByIP.length > 0) {
        return Response.json({ hasVoted: true })
      }
    }

    // Check by session
    const sessionId = cookieStore.get("election-session-id")?.value
    if (sessionId) {
      const existingVoteBySession = await sql`
        SELECT id FROM votes WHERE user_session_id = ${sessionId} LIMIT 1
      `

      if (existingVoteBySession.length > 0) {
        return Response.json({ hasVoted: true })
      }
    }

    return Response.json({ hasVoted: false })
  } catch (error) {
    console.error("Vote check error:", error)
    return Response.json({ hasVoted: false })
  }
}
