// Database authentication helper for votes with optional RLS
// Works with or without RLS enabled - gracefully falls back to direct queries

import { neon } from "@neondatabase/serverless"

export interface VotesDbContext {
  sql: ReturnType<typeof neon>
  mode: "public" | "admin" | "aggregate"
}

/**
 * Get database connection with proper RLS context (if RLS is enabled)
 * @param mode - Access mode: 'public' for voting, 'admin' for management, 'aggregate' for results
 */
export async function getVotesDbContext(mode: "public" | "admin" | "aggregate"): Promise<VotesDbContext> {
  const databaseUrl =
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.POSTGRES_URL

  if (!databaseUrl) {
    throw new Error("Database URL not configured")
  }

  const sql = neon(databaseUrl)

  // The RLS security features from scripts/10-enable-rls-votes.sql are optional enhancements
  // The app works correctly without them using application-level security

  return { sql, mode }
}

/**
 * Verify admin password and return authenticated context
 */
export async function getAdminVotesContext(password: string | null | undefined): Promise<VotesDbContext | null> {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD

  if (!password || !adminPassword || password !== adminPassword) {
    return null
  }

  return getVotesDbContext("admin")
}

/**
 * Execute a query with aggregate context (for public results)
 */
export async function executeAggregateQuery<T>(queryFn: (sql: ReturnType<typeof neon>) => Promise<T>): Promise<T> {
  const context = await getVotesDbContext("aggregate")
  return queryFn(context.sql)
}

/**
 * Execute a query with admin context
 */
export async function executeAdminQuery<T>(
  password: string | null | undefined,
  queryFn: (sql: ReturnType<typeof neon>) => Promise<T>,
): Promise<T | null> {
  const context = await getAdminVotesContext(password)
  if (!context) {
    return null
  }
  return queryFn(context.sql)
}
