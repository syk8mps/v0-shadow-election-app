# Row Level Security (RLS) Implementation

## Overview
De admin_settings tabel is beveiligd met PostgreSQL Row Level Security (RLS) om ongeautoriseerde toegang te voorkomen.

## Hoe het werkt

### 1. RLS Policies
Er zijn 4 policies geïmplementeerd op de `admin_settings` tabel:
- **SELECT Policy**: Alleen admins kunnen settings lezen
- **INSERT Policy**: Alleen admins kunnen settings toevoegen
- **UPDATE Policy**: Alleen admins kunnen settings bijwerken
- **DELETE Policy**: Alleen admins kunnen settings verwijderen

### 2. Admin Authenticatie
Authenticatie werkt in twee stappen:

**Stap 1: Password verificatie**
- API endpoints checken het admin wachtwoord via `verifyAdminPassword()`
- Wachtwoord komt van `ADMIN_PASSWORD` of `NEXT_PUBLIC_ADMIN_PASSWORD` environment variabele
- Fallback naar "admin" voor development

**Stap 2: Database sessie**
- Na succesvolle verificatie wordt `setAdminSession(sql, true)` aangeroepen
- Dit stelt een session variable in: `app.admin_authenticated = 'true'`
- RLS policies checken deze variable via de `is_admin()` functie

### 3. Database Functies

**`is_admin()` - Controleert admin privileges**
\`\`\`sql
SELECT is_admin(); -- Returns true/false
\`\`\`

**`set_admin_session(authenticated)` - Zet admin sessie**
\`\`\`sql
SELECT set_admin_session(true);  -- Geeft admin toegang
SELECT set_admin_session(false); -- Verwijdert admin toegang
\`\`\`

## Gebruik in Code

### API Route Voorbeeld
\`\`\`typescript
import { verifyAdminPassword, setAdminSession, getDatabaseUrl } from "@/lib/admin-auth"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  // Stap 1: Verificeer wachtwoord
  if (!verifyAdminPassword(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = neon(getDatabaseUrl())
  
  // Stap 2: Activeer admin sessie voor RLS
  await setAdminSession(sql, true)
  
  // Stap 3: Query de database - RLS policies staan dit nu toe
  const settings = await sql`SELECT * FROM admin_settings`
  
  return Response.json(settings)
}
\`\`\`

## Installatie

Run het RLS script om beveiliging in te schakelen:
\`\`\`bash
# Via de v0 UI of direct in je database
psql -f scripts/08-enable-rls-admin-settings.sql
\`\`\`

## Testen

### Test 1: Zonder authenticatie (zou moeten falen)
\`\`\`typescript
const sql = neon(DATABASE_URL)
const result = await sql`SELECT * FROM admin_settings` // Error: RLS policy violated
\`\`\`

### Test 2: Met authenticatie (zou moeten werken)
\`\`\`typescript
const sql = neon(DATABASE_URL)
await sql`SELECT set_admin_session(true)`
const result = await sql`SELECT * FROM admin_settings` // Success!
\`\`\`

## Beveiliging Best Practices

1. **Environment Variables**: Zet altijd een sterk admin wachtwoord in productie
2. **HTTPS Only**: Admin endpoints alleen via HTTPS
3. **Session Management**: Implementeer token-based auth voor productie
4. **Audit Logging**: Overweeg logging toe te voegen voor admin acties
5. **Password Rotation**: Wijzig admin wachtwoord regelmatig

## Troubleshooting

**Error: "permission denied for table admin_settings"**
- Run het RLS script om policies toe te voegen
- Check of `is_admin()` correct is geïmplementeerd

**Error: "RLS policy violated"**
- Verificeer dat `setAdminSession(sql, true)` wordt aangeroepen
- Check of het admin wachtwoord correct is

**Settings zijn leeg na RLS**
- Database owner/superuser kan altijd alles zien
- Normale queries zonder admin sessie zien niets (dit is correct gedrag)
