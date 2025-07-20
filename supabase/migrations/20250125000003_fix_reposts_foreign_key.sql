-- Fix reposts table foreign key constraint
-- Remove the incorrect foreign key constraint that references profiles
ALTER TABLE reposts 
DROP CONSTRAINT IF EXISTS fk_reposts_user_id;

-- Add the correct foreign key constraint that references auth.users
ALTER TABLE reposts 
ADD CONSTRAINT fk_reposts_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; 