-- Add repost_id column to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS repost_id UUID REFERENCES reposts(id) ON DELETE CASCADE;

-- Create index for repost bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_repost_id ON bookmarks(repost_id);

-- Add constraint to ensure either thread_id or repost_id is set, but not both
ALTER TABLE bookmarks ADD CONSTRAINT check_thread_or_repost_bookmark 
  CHECK ((thread_id IS NOT NULL AND repost_id IS NULL) OR (thread_id IS NULL AND repost_id IS NOT NULL));

-- Update unique constraint to include repost_id
DROP INDEX IF EXISTS bookmarks_user_id_thread_id_key;
CREATE UNIQUE INDEX bookmarks_user_id_thread_id_key ON bookmarks(user_id, thread_id) WHERE thread_id IS NOT NULL;
CREATE UNIQUE INDEX bookmarks_user_id_repost_id_key ON bookmarks(user_id, repost_id) WHERE repost_id IS NOT NULL; 