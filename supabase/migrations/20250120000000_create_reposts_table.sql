-- Create reposts table
CREATE TABLE IF NOT EXISTS reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_thread_id UUID REFERENCES threads(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original_thread_id ON reposts(original_thread_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON reposts(created_at);

-- Enable RLS
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reposts" ON reposts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reposts" ON reposts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reposts" ON reposts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts" ON reposts
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_reposts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_reposts_updated_at
  BEFORE UPDATE ON reposts
  FOR EACH ROW
  EXECUTE FUNCTION update_reposts_updated_at(); 