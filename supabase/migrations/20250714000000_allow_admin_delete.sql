-- Allow admins to delete any thread or reply

-- Update threads delete policy
DROP POLICY IF EXISTS "Users can delete their own threads" ON threads;

CREATE POLICY "Users or admins can delete threads" ON threads
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- Update replies delete policy
DROP POLICY IF EXISTS "Users can delete their own replies" ON replies;

CREATE POLICY "Users or admins can delete replies" ON replies
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
); 