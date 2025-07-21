-- Create repost_bookmarks table
CREATE TABLE IF NOT EXISTS repost_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repost_id UUID NOT NULL REFERENCES reposts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, repost_id)
);

-- Enable RLS
ALTER TABLE repost_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for repost_bookmarks
CREATE POLICY "Users can view their own repost bookmarks" ON repost_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own repost bookmarks" ON repost_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repost bookmarks" ON repost_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repost_bookmarks_user_id ON repost_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_repost_bookmarks_repost_id ON repost_bookmarks(repost_id); 