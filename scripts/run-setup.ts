import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function setupDatabase() {
  try {
    console.log("Creating tables...")

    // Create parties table
    await sql(`
      CREATE TABLE IF NOT EXISTS parties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        abbreviation VARCHAR(20) NOT NULL UNIQUE,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create votes table
    await sql(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_session_id VARCHAR(255) NOT NULL,
        vote_party_id INTEGER NOT NULL,
        counter_party_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vote_party_id) REFERENCES parties(id),
        FOREIGN KEY (counter_party_id) REFERENCES parties(id),
        UNIQUE(user_session_id)
      )
    `)

    // Create indices
    await sql(`CREATE INDEX IF NOT EXISTS idx_votes_user_session ON votes(user_session_id)`)
    await sql(`CREATE INDEX IF NOT EXISTS idx_votes_parties ON votes(vote_party_id, counter_party_id)`)

    console.log("Tables created successfully!")

    console.log("Seeding parties...")

    const parties = [
      { name: "PVV", abbreviation: "PVV", color: "#FF0000" },
      { name: "GROENLINKS / PvdA", abbreviation: "GL-PvdA", color: "#00AA00" },
      { name: "VVD", abbreviation: "VVD", color: "#0066CC" },
      { name: "Nieuw Sociaal Contract", abbreviation: "NSC", color: "#FF9900" },
      { name: "D66", abbreviation: "D66", color: "#00CCFF" },
      { name: "BoerBurgerBeweging", abbreviation: "BBB", color: "#00AA00" },
      { name: "CDA", abbreviation: "CDA", color: "#00AA00" },
      { name: "Socialistische Partij", abbreviation: "SP", color: "#FF0000" },
      { name: "DENK", abbreviation: "DENK", color: "#00AA00" },
      { name: "Partij voor de Dieren", abbreviation: "PvdD", color: "#00CC00" },
      { name: "Forum voor Democratie", abbreviation: "FvD", color: "#003399" },
      { name: "Staatkundig Gereformeerde Partij", abbreviation: "SGP", color: "#0066CC" },
      { name: "ChristenUnie", abbreviation: "CU", color: "#FF6600" },
      { name: "Volt", abbreviation: "Volt", color: "#FFCC00" },
      { name: "JA21", abbreviation: "JA21", color: "#FF3333" },
      { name: "Vrede voor Dieren", abbreviation: "VvD", color: "#00FF00" },
      { name: "Belang Van Nederland", abbreviation: "BVNL", color: "#FF0000" },
      { name: "BIJ1", abbreviation: "BIJ1", color: "#000000" },
      { name: "Libertaire Partij", abbreviation: "LP", color: "#FFFF00" },
      { name: "50PLUS", abbreviation: "50PLUS", color: "#0099CC" },
      { name: "Piratenpartij", abbreviation: "PP", color: "#333333" },
      { name: "Fryske Nasjonale Partij", abbreviation: "FNP", color: "#0066CC" },
      { name: "Vrij Verbond", abbreviation: "VV", color: "#FF6600" },
      { name: "DE LINIE", abbreviation: "DL", color: "#0066CC" },
      { name: "NL PLAN", abbreviation: "NLP", color: "#999999" },
      { name: "ELLECT", abbreviation: "ELLECT", color: "#FF0000" },
      { name: "Partij voor de Rechtsstaat", abbreviation: "PvdR", color: "#0066CC" },
    ]

    // Insert parties
    for (const party of parties) {
      try {
        await sql("INSERT INTO parties (name, abbreviation, color) VALUES ($1, $2, $3)", [
          party.name,
          party.abbreviation,
          party.color,
        ])
      } catch (err: any) {
        // Party already exists, skip
        if (!err.message.includes("duplicate")) {
          throw err
        }
      }
    }

    console.log("Database setup complete!")
    process.exit(0)
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
