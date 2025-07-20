-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "username" TEXT,
  "full_name" TEXT,
  "bio" TEXT,
  "avatar_url" TEXT,
  "favorite_team" TEXT,
  "is_admin" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "profiles_username_idx" ON "public"."profiles" ("username");
CREATE INDEX IF NOT EXISTS "profiles_created_at_idx" ON "public"."profiles" ("created_at");

-- Add unique constraint to prevent duplicate usernames
ALTER TABLE "public"."profiles" 
  ADD CONSTRAINT IF NOT EXISTS "unique_username" UNIQUE ("username");

-- Add a check constraint to ensure only valid F1 teams are stored
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT IF NOT EXISTS "valid_f1_team" CHECK (
    favorite_team IS NULL OR favorite_team IN (
      'Red Bull Racing',
      'Scuderia Ferrari', 
      'Mercedes-AMG',
      'McLaren',
      'Aston Martin',
      'Alpine',
      'Williams',
      'Haas',
      'Stake F1',
      'RB',
      'FIA'
    )
  );

-- Enable Row Level Security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON "public"."profiles"
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON "public"."profiles"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON "public"."profiles";
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON "public"."profiles"
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at(); 