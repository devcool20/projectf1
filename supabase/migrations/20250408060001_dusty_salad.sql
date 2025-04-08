/*
  # Fix Profile RLS Policies

  1. Changes
    - Add INSERT policy for authenticated users to create their own profile
    - Add UPDATE policy for authenticated users to update their own profile
    - Add DELETE policy for authenticated users to delete their own profile
    - Modify SELECT policy to be more specific

  2. Security
    - Ensures users can only manage their own profiles
    - Maintains public read access for profiles
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create comprehensive policies for all operations
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);