-- Create a separate repost_replies table for replies to reposts
-- This keeps the original replies table clean for thread replies only

-- Create the repost_replies table
CREATE TABLE IF NOT EXISTS repost_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    repost_id UUID NOT NULL REFERENCES reposts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on repost_replies table
ALTER TABLE repost_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for repost_replies
CREATE POLICY "Users can view all repost replies" ON repost_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own repost replies" ON repost_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete repost replies" ON repost_replies
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repost_replies_repost_id ON repost_replies(repost_id);
CREATE INDEX IF NOT EXISTS idx_repost_replies_user_id ON repost_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_repost_replies_created_at ON repost_replies(created_at);

-- Add a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_repost_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_repost_replies_updated_at
    BEFORE UPDATE ON repost_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_repost_replies_updated_at(); 