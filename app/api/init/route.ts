import { neon } from "@neondatabase/serverless"

let initializationInProgress = false

export async function GET() {
  // Prevent multiple concurrent initializations
  if (initializationInProgress) {
    return Response.json({ success: true, message: "Initialization in progress" })
  }

  try {
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
      return Response.json(
        { success: false, error: "Database connection not configured" },
        { status: 500 }
      )
    }

    const sql = neon(dbUrl)

    // Check if tables already exist
    try {
      const check = await sql`SELECT to_regclass('public.parties')`
      if (check && check[0]?.to_regclass) {
        return Response.json({ success: true, message: "Database already initialized" })
      }
    } catch {
      // Tables don't exist, proceed with initialization
    }

    initializationInProgress = true

    // Create all tables
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

    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_session_id VARCHAR(255) NOT NULL,
        vote_party_id INTEGER NOT NULL,
        counter_party_id INTEGER NOT NULL,
        vote_candidate_id INTEGER,
        counter_candidate_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vote_party_id) REFERENCES parties(id),
        FOREIGN KEY (counter_party_id) REFERENCES parties(id),
        UNIQUE(user_session_id)
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_votes_user_session ON votes(user_session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_votes_parties ON votes(vote_party_id, counter_party_id)`

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

    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Initialize admin settings
    try {
      await sql`
        INSERT INTO admin_settings (setting_key, setting_value) 
        VALUES ('results_visible', 'false'), ('admin_password', 'changeme')
        ON CONFLICT (setting_key) DO NOTHING
      `
    } catch {
      // Settings already exist
    }

    // Seed parties with corrected abbreviations
    const parties = [
      ["Democraten 66", "D66", "#FFD700"],
      ["Partij voor de Vrijheid", "PVV", "#2E4053"],
      ["Volkspartij voor Vrijheid en Democratie", "VVD", "#0066CC"],
      ["GROENLINKS / Partij van de Arbeid", "GL/PvdA", "#27AE60"],
      ["Christen-Democratisch Appel", "CDA", "#FF8800"],
      ["JA21", "JA21", "#FF1493"],
      ["Forum voor Democratie", "FvD", "#7B3FF2"],
      ["BoerBurgerBeweging", "BBB", "#8B4513"],
      ["DENK", "DENK", "#00A86B"],
      ["Staatkundig Gereformeerde Partij", "SGP", "#8B0000"],
      ["Partij voor de Dieren", "PvdD", "#2ECC71"],
      ["ChristenUnie", "CU", "#DC143C"],
      ["Socialistische Partij", "SP", "#E74C3C"],
      ["50PLUS", "50PLUS", "#00BFFF"],
      ["Volt", "Volt", "#FD2E38"],
      ["BIJ1", "BIJ1", "#000000"],
      ["Nieuw Sociaal Contract", "NSC", "#FF6B35"],
      ["Belang Van Nederland", "BVNL", "#F97316"],
      ["Vrede voor Dieren", "VvD", "#98D8C8"],
      ["Piratenpartij", "PP", "#333333"],
      ["Fryske Nasjonale Partij", "FNP", "#003366"],
      ["Libertaire Partij", "LP", "#FFB81C"],
      ["DE LINIE", "DL", "#B22222"],
      ["NL PLAN", "NLP", "#4169E1"],
      ["Vrij Verbond", "VV", "#87CEEB"],
      ["ELLECT", "ELLECT", "#A9A9A9"],
      ["Partij voor de Rechtsstaat", "PvdR", "#191970"],
    ]

    await sql`TRUNCATE parties CASCADE`

    for (let i = 0; i < parties.length; i++) {
      const [name, abbr, color] = parties[i]
      try {
        await sql`INSERT INTO parties (name, abbreviation, color, display_order) VALUES (${name}, ${abbr}, ${color}, ${i + 1})`
      } catch {
        // Party already exists
      }
    }

    // Seed candidates
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
        const partyResult = await sql`SELECT id FROM parties WHERE abbreviation = ${abbr}`
        if (partyResult && partyResult.length > 0) {
          const partyId = partyResult[0].id
          await sql`INSERT INTO candidates (party_id, name, position) VALUES (${partyId}, ${name}, 1)`
        }
      } catch {
        // Candidate already exists
      }
    }

    initializationInProgress = false
    return Response.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    initializationInProgress = false
    console.error("[v0] Init error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Initialization failed" },
      { status: 500 }
    )
  }
}
