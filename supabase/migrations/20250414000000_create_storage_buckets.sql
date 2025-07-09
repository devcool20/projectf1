-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('thread-images', 'thread-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reply-images', 'reply-images', true);

-- Create storage policies for thread-images bucket
CREATE POLICY "Allow public uploads to thread-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'thread-images');

CREATE POLICY "Allow public access to thread-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'thread-images');

CREATE POLICY "Allow users to delete their own thread-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'thread-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for reply-images bucket
CREATE POLICY "Allow public uploads to reply-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'reply-images');

CREATE POLICY "Allow public access to reply-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'reply-images');

CREATE POLICY "Allow users to delete their own reply-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'reply-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to replies table if it doesn't exist
ALTER TABLE replies ADD COLUMN IF NOT EXISTS image_url text; 