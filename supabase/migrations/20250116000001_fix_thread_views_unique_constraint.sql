-- Remove unique constraint from thread_views to allow multiple views per user
ALTER TABLE thread_views DROP CONSTRAINT IF EXISTS thread_views_thread_id_user_id_key;

-- Drop the unique index if it exists
DROP INDEX IF EXISTS thread_views_thread_id_user_id_key;
 
-- Create a new index without unique constraint for better performance
CREATE INDEX IF NOT EXISTS idx_thread_views_thread_user ON thread_views(thread_id, user_id); 