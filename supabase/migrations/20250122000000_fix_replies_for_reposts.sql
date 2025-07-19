-- Fix replies table to properly handle replies to reposts
-- This migration ensures that replies can be made to both threads and reposts

-- Add a repost_id column to the replies table for repost replies
ALTER TABLE replies 
ADD COLUMN IF NOT EXISTS repost_id UUID REFERENCES reposts(id) ON DELETE CASCADE;

-- Add a check constraint to ensure either thread_id or repost_id is set, but not both
ALTER TABLE replies 
ADD CONSTRAINT replies_thread_or_repost_check 
CHECK (
    (thread_id IS NOT NULL AND repost_id IS NULL) OR 
    (thread_id IS NULL AND repost_id IS NOT NULL)
);

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
CREATE INDEX IF NOT EXISTS idx_replies_repost_id ON replies(repost_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at);

-- Add a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_replies_updated_at ON replies;
CREATE TRIGGER update_replies_updated_at
    BEFORE UPDATE ON replies
    FOR EACH ROW
    EXECUTE FUNCTION update_replies_updated_at(); 