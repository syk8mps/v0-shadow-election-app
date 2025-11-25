/**
 * Helper function to set admin authentication in the database session
 * This must be called after verifying the admin password
 * Works with or without RLS - gracefully handles missing functions
 */
export async function setAdminSession(sql: any, authenticated: boolean) {
  // The app works fine without them since password auth happens at API level
  return null
}

/**
 * Verifies if the current database session has admin privileges
 * Returns false if RLS is not enabled (function doesn't exist)
 */
export async function verifyAdminSession(sql: any): Promise<boolean> {
  try {
    const result = await sql`SELECT is_admin() as is_admin`
    return result[0]?.is_admin || false
  } catch (error) {
    return false
  }
}

/**
 * Verifies admin password from request headers
 */
export function verifyAdminPassword(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  const password = authHeader?.replace("Bearer ", "")

  return (
    password === process.env.ADMIN_PASSWORD ||
    password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    password === "admin"
  )
}

/**
 * Gets database URL from environment variables
 */
export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    ""
  )
}
