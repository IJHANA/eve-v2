-- Add default_voice_id column to agents table
-- Run this in Supabase SQL Editor

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND column_name = 'default_voice_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN default_voice_id TEXT;
    RAISE NOTICE 'Added default_voice_id column to agents table';
  ELSE
    RAISE NOTICE 'default_voice_id column already exists';
  END IF;
END $$;

-- Also make core_prompt nullable since users might not set it immediately
ALTER TABLE agents ALTER COLUMN core_prompt DROP NOT NULL;

-- Update RLS policies to ensure users can update their agents
DROP POLICY IF EXISTS agents_user_policy ON agents;

CREATE POLICY agents_user_policy ON agents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('name', 'core_prompt', 'default_voice_id', 'user_id')
ORDER BY column_name;

-- Test query to see if you can select your agent
-- Replace YOUR_USER_ID with your actual user ID
SELECT id, name, core_prompt, default_voice_id 
FROM agents 
WHERE user_id = auth.uid()
LIMIT 1;

