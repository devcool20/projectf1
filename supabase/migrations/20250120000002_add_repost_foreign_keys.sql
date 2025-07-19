-- Add foreign key constraints for reposts table
-- This migration adds the missing foreign key relationships

-- Add foreign key constraint for reposts.user_id -> profiles.id
ALTER TABLE reposts 
ADD CONSTRAINT fk_reposts_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for reposts.original_thread_id -> threads.id
ALTER TABLE reposts 
ADD CONSTRAINT fk_reposts_original_thread_id 
FOREIGN KEY (original_thread_id) REFERENCES threads(id) ON DELETE CASCADE;

-- Enable RLS on reposts table if not already enabled
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for reposts
CREATE POLICY "Users can view all reposts" ON reposts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reposts" ON reposts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts" ON reposts
    FOR DELETE USING (auth.uid() = user_id); 