import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    ""
  )
}

export async function GET() {
  try {
    const sql = neon(getDatabaseUrl())
    const settings = await sql`
      SELECT setting_key, setting_value 
      FROM admin_settings 
      WHERE setting_key IN ('results_visible', 'turnstile_enabled')
    `

    let resultsVisible = "false"
    let turnstileEnabled = "true"

    settings.forEach((s: any) => {
      if (s.setting_key === "results_visible") {
        resultsVisible = s.setting_value
      } else if (s.setting_key === "turnstile_enabled") {
        turnstileEnabled = s.setting_value
      }
    })

    return Response.json({
      results_visible: resultsVisible,
      turnstile_enabled: turnstileEnabled,
    })
  } catch (error) {
    console.error("[v0] Error fetching public settings:", error)
    return Response.json({
      results_visible: "false",
      turnstile_enabled: "true",
    })
  }
}
