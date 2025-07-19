-- Add FIA team to the valid_f1_team constraint for admin users
-- First, drop the existing constraint
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "valid_f1_team";

-- Recreate the constraint with FIA team included
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
      'RB',
      'FIA'
    )
  );

-- Add a comment to document that FIA is admin-only
COMMENT ON CONSTRAINT "valid_f1_team" ON "public"."profiles" IS 'FIA team is reserved for admin users only'; 