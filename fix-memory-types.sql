-- Fix memories table type constraint
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE memories DROP CONSTRAINT IF EXISTS memories_type_check;

-- Add new constraint with all types
ALTER TABLE memories ADD CONSTRAINT memories_type_check 
CHECK (type IN ('fact', 'preference', 'story', 'emotion', 'timeline_event', 'experience', 'context'));

-- Verify the change
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'memories'::regclass
AND conname = 'memories_type_check';
