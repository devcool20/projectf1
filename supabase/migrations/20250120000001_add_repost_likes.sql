-- Add repost_id column to likes table
ALTER TABLE likes ADD COLUMN IF NOT EXISTS repost_id UUID REFERENCES reposts(id) ON DELETE CASCADE;

-- Create index for repost likes
CREATE INDEX IF NOT EXISTS idx_likes_repost_id ON likes(repost_id);

-- Update RLS policies to allow repost likes
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Add constraint to ensure either thread_id or repost_id is set, but not both
-- First, ensure all existing rows have thread_id set (since repost_id is new)
UPDATE likes SET thread_id = thread_id WHERE thread_id IS NOT NULL;

-- Now add the constraint
ALTER TABLE likes ADD CONSTRAINT check_thread_or_repost 
  CHECK ((thread_id IS NOT NULL AND repost_id IS NULL) OR (thread_id IS NULL AND repost_id IS NOT NULL)); 