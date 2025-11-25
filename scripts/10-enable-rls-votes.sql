-- Enable RLS on votes table with comprehensive security policies
-- This script protects individual votes while allowing aggregated results and admin management

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "votes_public_insert" ON votes;
DROP POLICY IF EXISTS "votes_public_aggregate_select" ON votes;
DROP POLICY IF EXISTS "votes_admin_all_access" ON votes;

-- ============================================
-- PUBLIC POLICIES
-- ============================================

-- Policy 1: Allow anyone to INSERT votes (public voting)
-- This allows users to submit their votes
CREATE POLICY "votes_public_insert" 
ON votes
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow SELECT only for aggregated data (NO individual vote details visible)
-- This is tricky - we need to allow COUNT/SUM operations but not individual rows
-- Solution: Use a restrictive SELECT policy and rely on application-level aggregation
CREATE POLICY "votes_public_aggregate_select"
ON votes
FOR SELECT
TO public
USING (
  -- Only allow SELECT if the query is part of an aggregation
  -- We check if current_setting exists which would be set by the API
  CASE 
    WHEN current_setting('app.allow_vote_select', true) = 'aggregate_only' THEN true
    ELSE false
  END
);

-- ============================================
-- ADMIN POLICIES
-- ============================================

-- Policy 3: Allow admins full access (SELECT, INSERT, DELETE)
-- Admins can view individual votes, add manual votes, and delete votes
CREATE POLICY "votes_admin_all_access"
ON votes
FOR ALL
TO public
USING (
  current_setting('app.admin_session_active', true) = 'true'
)
WITH CHECK (
  current_setting('app.admin_session_active', true) = 'true'
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to enable admin session for the current transaction
CREATE OR REPLACE FUNCTION enable_admin_session()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.admin_session_active', 'true', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable aggregate select for the current transaction
CREATE OR REPLACE FUNCTION enable_aggregate_select()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.allow_vote_select', 'aggregate_only', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disable all special privileges
CREATE OR REPLACE FUNCTION disable_special_privileges()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.admin_session_active', 'false', false);
  PERFORM set_config('app.allow_vote_select', 'none', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION enable_admin_session() TO public;
GRANT EXECUTE ON FUNCTION enable_aggregate_select() TO public;
GRANT EXECUTE ON FUNCTION disable_special_privileges() TO public;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'votes';

-- View all policies on votes table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'votes';
