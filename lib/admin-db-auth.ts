import { neon } from "@neondatabase/serverless"

/**
 * Authenticates an admin session with the database
 * This sets a session variable that RLS policies use to grant admin privileges
 * Works with or without RLS enabled
 */
export async function authenticateAdminSession(dbUrl: string, password: string): Promise<boolean> {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    if (!adminPassword) {
      console.error("Admin password not configured")
      return false
    }

    if (password !== adminPassword) {
      return false
    }

    const sql = neon(dbUrl)

    try {
      await sql`SELECT set_admin_session(true)`
    } catch (error: any) {
      // RLS functions don't exist yet - this is OK, queries will work without RLS
      if (!error?.message?.includes("does not exist")) {
        throw error
      }
    }

    return true
  } catch (error) {
    console.error("Admin authentication failed:", error)
    return false
  }
}

/**
 * Creates a database connection with admin privileges
 * Use this for all admin operations that modify data
 */
export async function getAdminConnection(password: string) {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL

  if (!dbUrl) {
    throw new Error("Database not configured")
  }

  const isAuthenticated = await authenticateAdminSession(dbUrl, password)

  if (!isAuthenticated) {
    throw new Error("Admin authentication failed")
  }

  return neon(dbUrl)
}

/**
 * Verifies admin password without setting session
 * Use for read-only admin verification
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  if (!adminPassword) {
    console.error("Admin password not configured")
    return false
  }

  return password === adminPassword
}
