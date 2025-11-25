import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { getClientIP, combineIPAndFingerprint } from "@/lib/device-fingerprint"
import { verifyTurnstileToken } from "@/lib/turnstile"

const getDatabaseUrl = () => {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
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

export async function POST(request: Request) {
  try {
    const { votePartyId, counterPartyId, voteCandidateId, counterCandidateId, turnstileToken, deviceFingerprint } =
      await request.json()

    if (!votePartyId || !counterPartyId) {
      return Response.json({ error: "Missing vote data" }, { status: 400 })
    }

    if (turnstileToken) {
      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return Response.json({ error: "Security verification failed" }, { status: 400 })
      }
    }

    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return Response.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    const testMode = await isTestModeEnabled(sql)

    const cookieStore = await cookies()
    const clientIP = getClientIP(request)

    const uniqueIdentifier = deviceFingerprint ? combineIPAndFingerprint(clientIP, deviceFingerprint) : clientIP

    console.log("[v0] Generated unique identifier:", uniqueIdentifier)
    console.log("[v0] Identifier length:", uniqueIdentifier.length)

    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'votes' 
      AND column_name = 'client_ip'
    `
    const hasIPColumn = columnCheck.length > 0

    if (!testMode) {
      if (hasIPColumn) {
        const existingVoteByIP = await sql`
          SELECT id FROM votes WHERE client_ip = ${uniqueIdentifier} LIMIT 1
        `

        if (existingVoteByIP.length > 0) {
          return Response.json(
            {
              error: "Je hebt al gestemd vanaf dit apparaat",
              alreadyVoted: true,
            },
            { status: 400 },
          )
        }
      }

      const sessionId = cookieStore.get("election-session-id")?.value

      if (sessionId) {
        const existingVoteBySession = await sql`
          SELECT id FROM votes WHERE user_session_id = ${sessionId} LIMIT 1
        `

        if (existingVoteBySession.length > 0) {
          return Response.json(
            {
              error: "Je hebt al gestemd",
              alreadyVoted: true,
            },
            { status: 400 },
          )
        }
      }
    }

    let sessionId = cookieStore.get("election-session-id")?.value
    if (!sessionId || testMode) {
      sessionId = `${uniqueIdentifier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const response = Response.json({ success: true })

    if (!testMode) {
      response.headers.set(
        "Set-Cookie",
        `election-session-id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${365 * 24 * 60 * 60}; Path=/`,
      )
    }

    if (hasIPColumn) {
      await sql`
        INSERT INTO votes (
          user_session_id, 
          vote_party_id, 
          counter_party_id,
          vote_candidate_id,
          counter_candidate_id,
          client_ip
        ) VALUES (
          ${sessionId},
          ${votePartyId}, 
          ${counterPartyId},
          ${voteCandidateId || null},
          ${counterCandidateId || null},
          ${uniqueIdentifier}
        )
      `
    } else {
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
    }

    return response
  } catch (error) {
    console.error("Error submitting vote:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message)
    }
    return Response.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
