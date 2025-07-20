-- Add delete policy for profiles table
CREATE POLICY "Users can delete their own profile" ON "public"."profiles"
  FOR DELETE
  USING (auth.uid() = id); 