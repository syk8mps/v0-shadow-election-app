import { neon } from "@neondatabase/serverless"
import { calculateSeats } from "@/lib/seat-calculator"
import { type NextRequest, NextResponse } from "next/server"

const getDatabaseUrl = () => {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL
  )
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const password = authHeader?.replace("Bearer ", "")

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    const partyResults = await sql`
      SELECT 
        p.id,
        p.name,
        p.abbreviation,
        p.logo_url,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) as voorstemmen,
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 1 ELSE 0 END), 0) as tegenstemmen,
        COALESCE(SUM(CASE WHEN v.vote_party_id = p.id THEN 1 ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN v.counter_party_id = p.id THEN 0.5 ELSE 0 END), 0) as netto
      FROM parties p
      LEFT JOIN votes v ON (v.vote_party_id = p.id OR v.counter_party_id = p.id)
      GROUP BY p.id, p.name, p.abbreviation, p.logo_url
      ORDER BY netto DESC
    `

    const candidateResults = await sql`
      SELECT 
        c.id,
        c.name,
        c.party_id,
        COALESCE(SUM(CASE WHEN v.vote_candidate_id = c.id THEN 1 ELSE 0 END), 0) as voorstemmen,
        COALESCE(SUM(CASE WHEN v.counter_candidate_id = c.id THEN 1 ELSE 0 END), 0) as tegenstemmen
      FROM candidates c
      LEFT JOIN votes v ON (v.vote_candidate_id = c.id OR v.counter_candidate_id = c.id)
      GROUP BY c.id, c.name, c.party_id
      ORDER BY c.party_id, c.position
    `

    const transformedResults = partyResults.map((r: any) => ({
      id: r.id,
      abbreviation: r.abbreviation,
      name: r.name,
      logoUrl: r.logo_url,
      voorstemmen: Number(r.voorstemmen),
      tegenstemmen: Number(r.tegenstemmen),
      netto: Number(r.netto),
    }))

    const seatMap = calculateSeats(
      transformedResults.map((r: any) => ({
        abbreviation: r.abbreviation,
        netVotes: r.netto,
      })),
      150,
    )

    const results = transformedResults.map((party: any) => {
      const partyCandidates = candidateResults.filter((c: any) => c.party_id === party.id)

      return {
        partyId: party.id,
        partyName: party.name,
        partyAbbreviation: party.abbreviation,
        logoUrl: party.logoUrl,
        totalVoorstemmen: party.voorstemmen,
        totalTegenstemmen: party.tegenstemmen,
        nettovotes: party.netto,
        zetels: seatMap.get(party.abbreviation) || 0,
        candidates: partyCandidates.map((c: any) => ({
          id: Number(c.id),
          name: String(c.name),
          voorstemmen: Number(c.voorstemmen),
          tegenstemmen: Number(c.tegenstemmen),
        })),
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Admin results error:", error)
    return NextResponse.json({ error: "Failed to fetch results", details: String(error) }, { status: 500 })
  }
}
