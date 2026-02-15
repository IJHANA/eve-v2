-- Add timestamp support to memories table
-- Run this migration in Supabase SQL Editor

-- Add mentioned_at column (when this memory was first mentioned)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS mentioned_at TIMESTAMP DEFAULT NOW();

-- Add last_mentioned column (most recent mention)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_mentioned TIMESTAMP DEFAULT NOW();

-- Add mention_count column (how many times referenced)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS mention_count INTEGER DEFAULT 1;

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS memories_mentioned_at_idx ON memories(mentioned_at DESC);
CREATE INDEX IF NOT EXISTS memories_last_mentioned_idx ON memories(last_mentioned DESC);

-- Update existing memories to have proper timestamps
UPDATE memories 
SET mentioned_at = created_at, 
    last_mentioned = created_at
WHERE mentioned_at IS NULL;

-- Create function for temporal memory search
CREATE OR REPLACE FUNCTION search_memories_by_date(
  agent_uuid UUID,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type TEXT,
  category TEXT,
  mentioned_at TIMESTAMP,
  importance_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.type,
    m.category,
    m.mentioned_at,
    m.importance_score
  FROM memories m
  WHERE 
    m.agent_id = agent_uuid
    AND m.mentioned_at >= start_date
    AND m.mentioned_at <= end_date
  ORDER BY m.mentioned_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function for "recent memories" query
CREATE OR REPLACE FUNCTION get_recent_memories(
  agent_uuid UUID,
  days_ago INTEGER DEFAULT 7,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type TEXT,
  category TEXT,
  mentioned_at TIMESTAMP,
  days_since_mention INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.type,
    m.category,
    m.mentioned_at,
    EXTRACT(DAY FROM (NOW() - m.mentioned_at))::INTEGER as days_since_mention
  FROM memories m
  WHERE 
    m.agent_id = agent_uuid
    AND m.mentioned_at >= NOW() - (days_ago || ' days')::INTERVAL
  ORDER BY m.mentioned_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function for "memories from specific day of week"
CREATE OR REPLACE FUNCTION get_memories_by_day_of_week(
  agent_uuid UUID,
  day_name TEXT, -- 'monday', 'tuesday', etc.
  weeks_back INTEGER DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  mentioned_at TIMESTAMP,
  week_number INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_dow INTEGER;
BEGIN
  -- Convert day name to PostgreSQL day of week (0=Sunday, 6=Saturday)
  target_dow := CASE LOWER(day_name)
    WHEN 'sunday' THEN 0
    WHEN 'monday' THEN 1
    WHEN 'tuesday' THEN 2
    WHEN 'wednesday' THEN 3
    WHEN 'thursday' THEN 4
    WHEN 'friday' THEN 5
    WHEN 'saturday' THEN 6
    ELSE 1 -- Default to Monday
  END;
  
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.mentioned_at,
    EXTRACT(WEEK FROM m.mentioned_at)::INTEGER as week_number
  FROM memories m
  WHERE 
    m.agent_id = agent_uuid
    AND EXTRACT(DOW FROM m.mentioned_at) = target_dow
    AND m.mentioned_at >= NOW() - (weeks_back * 7 || ' days')::INTERVAL
  ORDER BY m.mentioned_at DESC;
END;
$$;

-- Create view for memory timeline
CREATE OR REPLACE VIEW memory_timeline AS
SELECT 
  m.id,
  m.agent_id,
  m.content,
  m.type,
  m.category,
  m.mentioned_at,
  m.last_mentioned,
  m.mention_count,
  m.importance_score,
  DATE(m.mentioned_at) as mention_date,
  TO_CHAR(m.mentioned_at, 'Day') as day_of_week,
  TO_CHAR(m.mentioned_at, 'Month YYYY') as month_year,
  EXTRACT(WEEK FROM m.mentioned_at) as week_number,
  EXTRACT(YEAR FROM m.mentioned_at) as year
FROM memories m;

-- Example queries:

-- Get memories from last Monday:
-- SELECT * FROM get_memories_by_day_of_week('[agent-id]', 'monday', 1);

-- Get memories from last week:
-- SELECT * FROM get_recent_memories('[agent-id]', 7);

-- Get memories from January 2026:
-- SELECT * FROM search_memories_by_date(
--   '[agent-id]',
--   '2026-01-01'::TIMESTAMP,
--   '2026-01-31'::TIMESTAMP
-- );

-- Get memory timeline grouped by week:
-- SELECT 
--   week_number,
--   month_year,
--   COUNT(*) as memory_count,
--   STRING_AGG(content, '; ') as memories
-- FROM memory_timeline
-- WHERE agent_id = '[agent-id]'
-- GROUP BY week_number, month_year
-- ORDER BY week_number DESC;
