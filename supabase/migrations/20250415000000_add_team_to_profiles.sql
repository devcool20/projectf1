-- Add favorite_team column to profiles table
ALTER TABLE "public"."profiles"
  ADD COLUMN "favorite_team" text;

-- Add a check constraint to ensure only valid F1 teams are stored
ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "valid_f1_team" CHECK (
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
      'RB'
    )
  );

-- Add default team for existing users (optional - can be removed if not desired)
UPDATE "public"."profiles" 
SET "favorite_team" = 'Red Bull Racing' 
WHERE "favorite_team" IS NULL; 