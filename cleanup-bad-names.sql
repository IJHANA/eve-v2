-- Clean up false positive name memories
-- Run this in Supabase SQL Editor

-- Delete bad name extractions
DELETE FROM memories 
WHERE content IN (
  'Name: here',
  'Name: ready',
  'Name: drawn',
  'Name: Here',
  'Name: Ready',
  'Name: Drawn'
);

-- Verify they're gone
SELECT content 
FROM memories 
WHERE content LIKE 'Name:%'
ORDER BY created_at DESC;
