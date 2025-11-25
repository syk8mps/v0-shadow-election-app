-- Enable Row Level Security on parties table
-- This script adds RLS policies to protect the parties table

-- Enable RLS on parties table
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to READ parties (needed for voting and results)
CREATE POLICY "Public read access for parties"
  ON parties
  FOR SELECT
  USING (true);

-- Policy 2: Allow authenticated admins to INSERT parties
CREATE POLICY "Admin insert access for parties"
  ON parties
  FOR INSERT
  WITH CHECK (
    current_setting('app.admin_authenticated', true)::boolean = true
  );

-- Policy 3: Allow authenticated admins to UPDATE parties
CREATE POLICY "Admin update access for parties"
  ON parties
  FOR UPDATE
  USING (
    current_setting('app.admin_authenticated', true)::boolean = true
  )
  WITH CHECK (
    current_setting('app.admin_authenticated', true)::boolean = true
  );

-- Policy 4: Allow authenticated admins to DELETE parties
CREATE POLICY "Admin delete access for parties"
  ON parties
  FOR DELETE
  USING (
    current_setting('app.admin_authenticated', true)::boolean = true
  );

-- Create helper function to set admin session
CREATE OR REPLACE FUNCTION set_admin_session(authenticated boolean)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.admin_authenticated', authenticated::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN coalesce(current_setting('app.admin_authenticated', true)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION set_admin_session(boolean) TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin_authenticated() TO PUBLIC;
