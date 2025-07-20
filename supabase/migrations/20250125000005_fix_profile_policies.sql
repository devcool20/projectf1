-- Fix RLS policies for profiles table to ensure proper access
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert their own profile" ON "public"."profiles";

-- Recreate policies with proper permissions
CREATE POLICY "Users can view all profiles" ON "public"."profiles"
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON "public"."profiles"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add a policy for users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON "public"."profiles"
  FOR DELETE USING (auth.uid() = id);

-- Ensure the table has RLS enabled
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY; 