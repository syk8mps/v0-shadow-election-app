# RLS Security for Parties Table

This document explains the Row Level Security (RLS) implementation for the `parties` table.

## Overview

The `parties` table now has RLS enabled with the following access rules:
- **Public Read Access**: Anyone can view party data (needed for voting and results display)
- **Admin-Only Write Access**: Only authenticated admins can create, update, or delete parties

## Implementation Details

### Database Policies

Four RLS policies are active on the `parties` table:

1. **Public read access**: Allows all SELECT queries without authentication
2. **Admin insert access**: Requires `app.admin_authenticated` session variable = true
3. **Admin update access**: Requires `app.admin_authenticated` session variable = true  
4. **Admin delete access**: Requires `app.admin_authenticated` session variable = true

### Helper Functions

Two SQL functions assist with admin authentication:

\`\`\`sql
-- Set admin session (must be called before admin operations)
SELECT set_admin_session(true);

-- Check if current session is authenticated as admin
SELECT is_admin_authenticated();
\`\`\`

### API Authentication Flow

1. Admin provides password in request body
2. Server verifies password against `ADMIN_PASSWORD` environment variable
3. Server calls `set_admin_session(true)` to enable admin privileges
4. Database RLS policies now allow write operations
5. Operation completes and response is returned

## Usage in Code

### Reading Parties (Public)

\`\`\`typescript
// No authentication needed
const sql = neon(dbUrl)
const parties = await sql`SELECT * FROM parties`
\`\`\`

### Updating Parties (Admin)

\`\`\`typescript
import { getAdminConnection } from "@/lib/admin-db-auth"

// Requires admin password
const sql = await getAdminConnection(adminPassword)
await sql`UPDATE parties SET logo_url = ${url} WHERE id = ${id}`
\`\`\`

## Security Benefits

1. **Defense in Depth**: Even if application code has vulnerabilities, RLS provides database-level protection
2. **Audit Trail**: All admin operations are tied to authenticated sessions
3. **Principle of Least Privilege**: Public users only get read access, admins get full access
4. **SQL Injection Protection**: RLS policies prevent unauthorized data access even if queries are compromised

## Testing

To verify RLS is working:

\`\`\`sql
-- Should succeed (public read)
SELECT * FROM parties;

-- Should fail without admin session (no write access)
UPDATE parties SET name = 'test' WHERE id = 1;

-- Should succeed after admin authentication
SELECT set_admin_session(true);
UPDATE parties SET name = 'test' WHERE id = 1;
\`\`\`

## Migration

Run the migration script to enable RLS:

\`\`\`bash
# Execute the SQL script in your Neon database
psql $DATABASE_URL -f scripts/09-enable-rls-parties.sql
\`\`\`

## Troubleshooting

**Error: "permission denied for table parties"**
- Make sure you've run the migration script
- Verify admin password is correct
- Check that `app.admin_authenticated` session variable is set

**Updates fail even with correct password**
- Ensure `getAdminConnection()` is used, not regular `neon()`
- Verify `set_admin_session(true)` is called before the query
- Check database logs for RLS policy violations
