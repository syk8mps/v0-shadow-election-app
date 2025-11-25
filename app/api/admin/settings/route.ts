import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl, verifyAdminPassword } from "@/lib/admin-auth"

async function ensureAdminSettingsTable(sql: any) {
  try {
    const result = await sql`SELECT to_regclass('public.admin_settings')`
    if (!result || !result[0]?.to_regclass) {
      await sql`
        CREATE TABLE IF NOT EXISTS admin_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      await sql`
        INSERT INTO admin_settings (setting_key, setting_value) 
        VALUES ('results_visible', 'false'), ('admin_password', 'changeme'), ('turnstile_enabled', 'true')
        ON CONFLICT (setting_key) DO NOTHING
      `
    }
  } catch (e) {
    console.error("Error ensuring admin_settings table exists:", e)
  }
}

export async function GET(request: Request) {
  try {
    if (!verifyAdminPassword(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(getDatabaseUrl())

    await ensureAdminSettingsTable(sql)

    const settings = await sql`SELECT * FROM admin_settings`

    return Response.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminPassword(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { settingKey, settingValue } = await request.json()
    const sql = neon(getDatabaseUrl())

    await ensureAdminSettingsTable(sql)

    await sql`
      INSERT INTO admin_settings (setting_key, setting_value) 
      VALUES (${settingKey}, ${settingValue})
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${settingValue}, updated_at = CURRENT_TIMESTAMP
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return Response.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
