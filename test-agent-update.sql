-- MANUAL TEST: Update agent directly in Supabase
-- Run this in Supabase SQL Editor to test if updates work

-- First, find your agent ID
SELECT id, user_id, name, core_prompt, default_voice_id 
FROM agents 
WHERE user_id = auth.uid();

-- Copy the ID from above, then try updating it directly
-- Replace 'YOUR_AGENT_ID_HERE' with the actual ID
UPDATE agents 
SET 
  name = 'Test Name',
  core_prompt = 'Test prompt',
  default_voice_id = '21m00Tcm4TlvDq8ikWAM'
WHERE id = 'YOUR_AGENT_ID_HERE'::uuid
AND user_id = auth.uid()
RETURNING *;

-- If this works, the issue is in the API
-- If this fails, the issue is in database permissions

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'agents';
