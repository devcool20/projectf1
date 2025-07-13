-- Add username column to profiles table
ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "username" text;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS "profiles_username_idx" ON "public"."profiles" ("username");

-- Add unique constraint to prevent duplicate usernames
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "unique_username" UNIQUE ("username");

-- Update existing users to have a default username based on their email
UPDATE "public"."profiles" 
SET "username" = SPLIT_PART(
  (SELECT email FROM auth.users WHERE id = profiles.id), 
  '@', 
  1
)
WHERE "username" IS NULL; 