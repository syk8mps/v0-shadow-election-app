-- Enable Row Level Security on admin_settings table
-- This script adds comprehensive RLS policies to protect admin settings

-- Step 1: Enable RLS on admin_settings table
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Step 2: Create a database role for admin access
-- This role will be used by authenticated admin users
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END
$$;

-- Step 3: Grant necessary permissions to admin_role
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_settings TO admin_role;
GRANT USAGE, SELECT ON SEQUENCE admin_settings_id_seq TO admin_role;

-- Step 4: Create a function to verify admin authentication
-- This function checks if the current session has admin privileges
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current role is admin_role or has admin privileges
  RETURN current_setting('app.admin_authenticated', true) = 'true'
    OR current_user = 'admin_role'
    OR pg_has_role(current_user, 'admin_role', 'member');
EXCEPTION
  WHEN undefined_object THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create RLS policies for admin_settings

-- Policy 1: Only authenticated admins can SELECT from admin_settings
CREATE POLICY admin_settings_select_policy ON admin_settings
  FOR SELECT
  USING (is_admin());

-- Policy 2: Only authenticated admins can INSERT into admin_settings
CREATE POLICY admin_settings_insert_policy ON admin_settings
  FOR INSERT
  WITH CHECK (is_admin());

-- Policy 3: Only authenticated admins can UPDATE admin_settings
CREATE POLICY admin_settings_update_policy ON admin_settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 4: Only authenticated admins can DELETE from admin_settings
CREATE POLICY admin_settings_delete_policy ON admin_settings
  FOR DELETE
  USING (is_admin());

-- Step 6: Create a function to set admin session
-- This should be called after successful admin authentication
CREATE OR REPLACE FUNCTION set_admin_session(authenticated BOOLEAN)
RETURNS void AS $$
BEGIN
  IF authenticated THEN
    PERFORM set_config('app.admin_authenticated', 'true', false);
  ELSE
    PERFORM set_config('app.admin_authenticated', 'false', false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create a bypass policy for the database owner/superuser
-- This ensures the database owner can always access the table
CREATE POLICY admin_settings_owner_policy ON admin_settings
  FOR ALL
  USING (current_user = current_database()::regrole::name OR pg_has_role(current_user, 'rds_superuser', 'member'));

-- Verification query (uncomment to test)
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'admin_settings';

-- Grant public read access to the helper function
GRANT EXECUTE ON FUNCTION is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION set_admin_session(BOOLEAN) TO PUBLIC;

-- Add comments for documentation
COMMENT ON TABLE admin_settings IS 'Admin settings table with RLS enabled. Only authenticated admins can access.';
COMMENT ON FUNCTION is_admin() IS 'Checks if the current session is authenticated as admin';
COMMENT ON FUNCTION set_admin_session(BOOLEAN) IS 'Sets the admin authentication status for the current session';
