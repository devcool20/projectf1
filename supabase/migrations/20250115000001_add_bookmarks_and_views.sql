-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

-- Create views table to track thread views
CREATE TABLE IF NOT EXISTS thread_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_thread_id ON bookmarks(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_views_thread_id ON thread_views(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_views_user_id ON thread_views(user_id);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_views ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for thread_views
CREATE POLICY "Users can view thread views" ON thread_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create thread views" ON thread_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add view count column to threads table
ALTER TABLE threads ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_thread_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads 
  SET view_count = view_count + 1 
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment view count
CREATE TRIGGER increment_thread_view_trigger
  AFTER INSERT ON thread_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_thread_view(); 