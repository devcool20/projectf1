-- Create reply_likes table for likes on regular thread replies
-- This table handles likes for replies to threads (not repost replies)

-- Create the reply_likes table
CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Enable RLS on reply_likes table
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for reply_likes
CREATE POLICY "Users can view all reply likes" ON reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reply likes" ON reply_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reply likes" ON reply_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_user_id ON reply_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_created_at ON reply_likes(created_at); 