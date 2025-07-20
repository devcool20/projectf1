-- Remove the entire views system
-- This migration removes the thread_views table and view_count column from threads table

-- Drop the thread_views table
DROP TABLE IF EXISTS thread_views CASCADE;

-- Remove the view_count column from threads table
ALTER TABLE threads DROP COLUMN IF EXISTS view_count;

-- Drop any related triggers or functions that might reference thread_views
-- (These would have been created in the original views migration)
DROP TRIGGER IF EXISTS update_thread_view_count ON thread_views;
DROP FUNCTION IF EXISTS update_thread_view_count() CASCADE; 