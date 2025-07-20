-- Create a function to delete a user completely
-- This function will delete all user data and then delete the auth user
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all user data from all tables
  DELETE FROM repost_reply_likes WHERE user_id = delete_user_completely.user_id;
  DELETE FROM repost_replies WHERE user_id = delete_user_completely.user_id;
  DELETE FROM repost_likes WHERE user_id = delete_user_completely.user_id;
  DELETE FROM reposts WHERE user_id = delete_user_completely.user_id;
  DELETE FROM thread_views WHERE user_id = delete_user_completely.user_id;
  DELETE FROM bookmarks WHERE user_id = delete_user_completely.user_id;
  DELETE FROM likes WHERE user_id = delete_user_completely.user_id;
  DELETE FROM replies WHERE user_id = delete_user_completely.user_id;
  DELETE FROM threads WHERE user_id = delete_user_completely.user_id;
  DELETE FROM follows WHERE follower_id = delete_user_completely.user_id OR following_id = delete_user_completely.user_id;
  DELETE FROM profiles WHERE id = delete_user_completely.user_id;
  
  -- Delete the auth user (this requires admin privileges)
  -- Note: This will only work if the function is called with admin privileges
  DELETE FROM auth.users WHERE id = delete_user_completely.user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the function
    RAISE WARNING 'Error deleting user %: %', delete_user_completely.user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated; 