-- Add delete policy for threads
CREATE POLICY "Users can delete their own threads"
  ON threads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add delete policy for replies
CREATE POLICY "Users can delete their own replies"
  ON replies
  FOR DELETE
  USING (auth.uid() = user_id); 