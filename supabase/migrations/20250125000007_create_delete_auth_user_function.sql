-- Create a function to delete a user from auth.users table
-- This function requires admin privileges to run
CREATE OR REPLACE FUNCTION delete_auth_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users table
  DELETE FROM auth.users WHERE id = delete_auth_user.user_id;
  
  -- Return true if deletion was successful
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the function
    RAISE WARNING 'Error deleting auth user %: %', delete_auth_user.user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_auth_user(UUID) TO authenticated; 