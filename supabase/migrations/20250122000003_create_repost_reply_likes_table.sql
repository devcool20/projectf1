-- Create a separate repost_reply_likes table for likes on repost replies
-- This keeps the likes system separate for repost replies

-- Create the repost_reply_likes table
CREATE TABLE IF NOT EXISTS repost_reply_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repost_reply_id UUID NOT NULL REFERENCES repost_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(repost_reply_id, user_id)
);

-- Enable RLS on repost_reply_likes table
ALTER TABLE repost_reply_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for repost_reply_likes
CREATE POLICY "Users can view all repost reply likes" ON repost_reply_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own repost reply likes" ON repost_reply_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repost reply likes" ON repost_reply_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repost_reply_likes_reply_id ON repost_reply_likes(repost_reply_id);
CREATE INDEX IF NOT EXISTS idx_repost_reply_likes_user_id ON repost_reply_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_repost_reply_likes_created_at ON repost_reply_likes(created_at); 