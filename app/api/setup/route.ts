import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
      console.error("[v0] No database URL found in environment variables")
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database connection string not configured. Please check your Neon integration.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("[v0] Using database URL:", dbUrl.substring(0, 20) + "...")
    const sql = neon(dbUrl)

    try {
      const tableCheck = await sql`SELECT to_regclass('public.parties')`
      const candidatesCheck = await sql`SELECT to_regclass('public.candidates')`

      if (tableCheck && tableCheck[0]?.to_regclass && candidatesCheck && candidatesCheck[0]?.to_regclass) {
        console.log("[v0] All tables already exist")
        return Response.json({ success: true, message: "Database already initialized!" })
      }

      console.log("[v0] Some tables missing, recreating all...")
    } catch (e) {
      console.log("[v0] Checking for existing tables...")
    }

    console.log("[v0] Creating parties table...")
    await sql`
      CREATE TABLE IF NOT EXISTS parties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        abbreviation VARCHAR(20) NOT NULL UNIQUE,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logo_url VARCHAR(500),
        display_order INTEGER DEFAULT 999
      )
    `

    console.log("[v0] Creating votes table...")
    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_session_id VARCHAR(255) NOT NULL,
        vote_party_id INTEGER NOT NULL,
        counter_party_id INTEGER NOT NULL,
        vote_candidate_id INTEGER,
        counter_candidate_id INTEGER,
        client_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vote_party_id) REFERENCES parties(id),
        FOREIGN KEY (counter_party_id) REFERENCES parties(id),
        UNIQUE(user_session_id)
      )
    `

    console.log("[v0] Creating indices...")
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_user_session ON votes(user_session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_parties ON votes(vote_party_id, counter_party_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_client_ip ON votes(client_ip)`

    console.log("[v0] Creating candidates table...")
    await sql`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        party_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id),
        UNIQUE(party_id, name)
      )
    `

    console.log("[v0] Creating admin_settings table...")
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("[v0] Initializing admin settings...")
    try {
      await sql`
        INSERT INTO admin_settings (setting_key, setting_value) 
        VALUES ('results_visible', 'false'), ('admin_password', 'changeme')
        ON CONFLICT (setting_key) DO NOTHING
      `
    } catch (e) {
      console.log("[v0] Admin settings already initialized")
    }

    console.log("[v0] Seeding 27 parties...")
    const parties = [
      ["Partij voor de Vrijheid", "PVV", "#2E4053"],
      ["GROENLINKS / Partij van de Arbeid", "GL/PvdA", "#27AE60"],
      ["Volkspartij voor Vrijheid en Democratie", "VVD", "#0066CC"],
      ["Nieuw Sociaal Contract", "NSC", "#FF6B35"],
      ["Democraten 66", "D66", "#FFD700"],
      ["BoerBurgerBeweging", "BBB", "#8B4513"],
      ["Christen-Democratisch Appel", "CDA", "#FF8800"],
      ["Socialistische Partij", "SP", "#E74C3C"],
      ["DENK", "DENK", "#00A86B"],
      ["Partij voor de Dieren", "PvdD", "#2ECC71"],
      ["Forum voor Democratie", "FvD", "#7B3FF2"],
      ["Staatkundig Gereformeerde Partij", "SGP", "#8B0000"],
      ["ChristenUnie", "CU", "#DC143C"],
      ["Volt", "Volt", "#FD2E38"],
      ["JA21", "JA21", "#FF1493"],
      ["Vrede voor Dieren", "VvD", "#98D8C8"],
      ["Belang Van Nederland", "BVNL", "#F97316"],
      ["BIJ1", "BIJ1", "#000000"],
      ["Libertaire Partij", "LP", "#FFB81C"],
      ["50PLUS", "50PLUS", "#00BFFF"],
      ["Piratenpartij", "PP", "#333333"],
      ["Fryske Nasjonale Partij", "FNP", "#003366"],
      ["Vrij Verbond", "VV", "#87CEEB"],
      ["DE LINIE", "DL", "#B22222"],
      ["NL PLAN", "NLP", "#4169E1"],
      ["ELLECT", "ELLECT", "#A9A9A9"],
      ["Partij voor de Rechtsstaat", "PvdR", "#191970"],
    ]

    await sql`TRUNCATE parties CASCADE`

    for (const [name, abbr, color] of parties) {
      try {
        await sql`INSERT INTO parties (name, abbreviation, color) VALUES (${name}, ${abbr}, ${color})`
      } catch (e) {
        console.log(`[v0] Party already exists: ${abbr}`)
      }
    }

    console.log("[v0] Creating sample candidates...")
    const candidateData = [
      ["D66", "D66 Kandidaat 1"],
      ["PVV", "PVV Kandidaat 1"],
      ["VVD", "VVD Kandidaat 1"],
      ["GL-PvdA", "PvdA/GL Kandidaat 1"],
      ["CDA", "CDA Kandidaat 1"],
      ["JA21", "JA21 Kandidaat 1"],
      ["FvD", "FvD Kandidaat 1"],
      ["BBB", "BBB Kandidaat 1"],
      ["DENK", "DENK Kandidaat 1"],
      ["SGP", "SGP Kandidaat 1"],
      ["PvdD", "PvdD Kandidaat 1"],
      ["CU", "CU Kandidaat 1"],
      ["SP", "SP Kandidaat 1"],
      ["50PLUS", "50PLUS Kandidaat 1"],
      ["Volt", "Volt Kandidaat 1"],
      ["BIJ1", "BIJ1 Kandidaat 1"],
      ["NSC", "NSC Kandidaat 1"],
      ["BVNL", "BVNL Kandidaat 1"],
      ["VvD", "VvD Kandidaat 1"],
      ["PP", "PP Kandidaat 1"],
      ["FNP", "FNP Kandidaat 1"],
      ["LP", "LP Kandidaat 1"],
      ["DL", "DE LINIE Kandidaat 1"],
      ["NLP", "NL PLAN Kandidaat 1"],
      ["VV", "VV Kandidaat 1"],
      ["ELLECT", "ELLECT Kandidaat 1"],
      ["PvdR", "PvdR Kandidaat 1"],
    ]

    for (const [abbr, name] of candidateData) {
      try {
        // Look up the party ID by abbreviation
        const partyResult = await sql`SELECT id FROM parties WHERE abbreviation = ${abbr}`
        if (partyResult && partyResult.length > 0) {
          const partyId = partyResult[0].id
          await sql`INSERT INTO candidates (party_id, name, position) VALUES (${partyId}, ${name}, 1)`
        }
      } catch (e) {
        console.log(`[v0] Candidate already exists or party not found: ${name}`)
      }
    }

    console.log("[v0] Database setup completed successfully!")
    return new Response(
      JSON.stringify({ success: true, message: "Database initialized with all tables and 27 parties!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] Setup error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Full error details:", errorMessage)
    return new Response(JSON.stringify({ success: false, error: `Setup failed: ${errorMessage}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
