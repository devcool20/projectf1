-- Revert the replies table changes to restore original functionality
-- This migration undoes the changes that broke PostgREST compatibility

-- Drop the repost_id column if it exists
ALTER TABLE replies DROP COLUMN IF EXISTS repost_id;

-- Drop the check constraint if it exists
ALTER TABLE replies DROP CONSTRAINT IF EXISTS replies_thread_or_repost_check;

-- Ensure the foreign key constraint exists for thread_id -> threads.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'replies_thread_id_fkey' 
        AND table_name = 'replies'
    ) THEN
        ALTER TABLE replies 
        ADD CONSTRAINT replies_thread_id_fkey 
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop any indexes we added
DROP INDEX IF EXISTS idx_replies_repost_id;

-- Ensure RLS is enabled on replies table
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all replies" ON replies;
DROP POLICY IF EXISTS "Users can insert their own replies" ON replies;
DROP POLICY IF EXISTS "Users can delete their own replies" ON replies;
DROP POLICY IF EXISTS "Users or admins can delete replies" ON replies;

-- Create comprehensive policies for replies
CREATE POLICY "Users can view all replies" ON replies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own replies" ON replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete replies" ON replies
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at); 