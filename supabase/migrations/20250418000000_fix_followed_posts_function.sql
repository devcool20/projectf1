-- Fix the get_followed_posts function to use threads table instead of posts table
CREATE OR REPLACE FUNCTION get_followed_posts(user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  profiles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.content,
    t.image_url,
    t.created_at,
    t.updated_at,
    jsonb_build_object(
      'id', pr.id,
      'username', pr.username,
      'favorite_team', pr.favorite_team,
      'avatar_url', pr.avatar_url
    ) as profiles
  FROM threads t
  JOIN profiles pr ON t.user_id = pr.id
  JOIN follows f ON t.user_id = f.following_id
  WHERE f.follower_id = user_id
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 