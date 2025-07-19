-- Allow admins to delete any repost

-- Update reposts delete policy
DROP POLICY IF EXISTS "Users can delete their own reposts" ON reposts;

CREATE POLICY "Users or admins can delete reposts" ON reposts
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
); 