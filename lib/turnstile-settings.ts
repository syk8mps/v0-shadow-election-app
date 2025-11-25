import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "@/lib/admin-auth"

export async function getTurnstileEnabled(): Promise<boolean> {
  try {
    const sql = neon(getDatabaseUrl())
    const result = await sql`SELECT setting_value FROM admin_settings WHERE setting_key = 'turnstile_enabled'`

    if (result && result.length > 0) {
      return result[0].setting_value !== "false"
    }
    return true // Default to enabled
  } catch (error) {
    console.error("Error fetching Turnstile setting:", error)
    return true // Default to enabled on error
  }
}
