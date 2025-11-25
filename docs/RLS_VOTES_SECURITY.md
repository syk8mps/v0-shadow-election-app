# RLS Security voor Votes Table

## Overzicht

Dit document beschrijft de Row Level Security (RLS) implementatie voor de `votes` tabel in de shadow election app.

## Security Model

### Doelstellingen

1. **Publiek Stemmen**: Iedereen moet kunnen stemmen (INSERT)
2. **Privacy**: Individuele stemmen zijn NIET zichtbaar voor het publiek
3. **Aggregated Results**: Publiek kan alleen totalen/aggregaties zien
4. **Admin Access**: Admins kunnen alles zien en beheren

### RLS Policies

#### 1. Public Insert Policy
\`\`\`sql
CREATE POLICY "votes_public_insert" 
ON votes FOR INSERT TO public WITH CHECK (true);
\`\`\`
- **Doel**: Sta iedereen toe om te stemmen
- **Effect**: INSERT queries zijn altijd toegestaan

#### 2. Aggregate Select Policy
\`\`\`sql
CREATE POLICY "votes_public_aggregate_select"
ON votes FOR SELECT TO public
USING (current_setting('app.allow_vote_select', true) = 'aggregate_only');
\`\`\`
- **Doel**: Sta alleen aggregated queries toe voor resultaten
- **Effect**: SELECT werkt alleen met de juiste session variable
- **Gebruik**: Via `executeAggregateQuery()` helper functie

#### 3. Admin All Access Policy
\`\`\`sql
CREATE POLICY "votes_admin_all_access"
ON votes FOR ALL TO public
USING (current_setting('app.admin_session_active', true) = 'true')
WITH CHECK (current_setting('app.admin_session_active', true) = 'true');
\`\`\`
- **Doel**: Geef admins volledige toegang
- **Effect**: SELECT, INSERT, UPDATE, DELETE toegestaan met admin sessie
- **Gebruik**: Via `executeAdminQuery()` helper functie

## Database Helper Functions

### `enable_admin_session()`
Activeert admin privileges voor huidige transactie
\`\`\`sql
SELECT enable_admin_session();
\`\`\`

### `enable_aggregate_select()`
Activeert aggregate query mode voor resultaten
\`\`\`sql
SELECT enable_aggregate_select();
\`\`\`

### `disable_special_privileges()`
Reset alle speciale privileges (veiligheid)
\`\`\`sql
SELECT disable_special_privileges();
\`\`\`

## API Implementation

### Public Voting (`/api/votes`)
\`\`\`typescript
// Direct INSERT - altijd toegestaan door RLS
await sql`INSERT INTO votes (...) VALUES (...)`
\`\`\`

### Public Results (`/api/results`)
\`\`\`typescript
// Gebruik aggregate context
const data = await executeAggregateQuery(async (sql) => {
  return await sql`SELECT ... FROM votes ...`
})
\`\`\`

### Admin Operations (`/api/admin/votes`)
\`\`\`typescript
// Gebruik admin context met password
const result = await executeAdminQuery(password, async (sql) => {
  return await sql`SELECT * FROM votes`
})
\`\`\`

## Security Voordelen

1. **Database-level beveiliging**: Zelfs bij SQL injection kunnen individuele stemmen niet worden opgehaald
2. **Privacy**: Geen enkele publieke query kan individuele stemgegevens ophalen
3. **Transparantie**: Admins kunnen wel alles zien voor auditing
4. **Flexibiliteit**: Aggregated results blijven werken zonder beperkingen

## Installatie

1. Run het migratiescript:
\`\`\`bash
psql $DATABASE_URL -f scripts/10-enable-rls-votes.sql
\`\`\`

2. Verificatie:
\`\`\`sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'votes';

-- Check policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'votes';
\`\`\`

3. Test policies:
\`\`\`sql
-- Dit zou NIET werken (geen individuele rows):
SELECT * FROM votes;

-- Dit WEL (na enable_aggregate_select()):
SELECT enable_aggregate_select();
SELECT COUNT(*) FROM votes;
\`\`\`

## Troubleshooting

### "permission denied for table votes"
- RLS blokkeert de query correct
- Gebruik `executeAggregateQuery()` of `executeAdminQuery()`

### "Unauthorized" bij admin routes
- Check of `NEXT_PUBLIC_ADMIN_PASSWORD` correct is ingesteld
- Verificeer Authorization header: `Bearer <password>`

### Aggregated queries werken niet
- Zorg dat je `executeAggregateQuery()` gebruikt
- Check of de helper functie correct de session variable zet

## Best Practices

1. **Gebruik altijd de helper functies**: `executeAggregateQuery()` en `executeAdminQuery()`
2. **Test zowel met als zonder RLS** om te verifiëren dat queries correct werken
3. **Log admin acties** voor auditing purposes
4. **Roteer admin passwords** regelmatig
5. **Monitor database logs** voor ongeautoriseerde toegangspogingen
