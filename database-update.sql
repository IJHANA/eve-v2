-- EVE V2 DATABASE UPDATE
-- Run this ONLY if you already ran the migration before
-- This adds any missing functions and policies

-- =============================================================================
-- PART 1: UPDATE/CREATE FUNCTIONS (safe to run multiple times)
-- =============================================================================

-- Function to search memories by semantic similarity
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  filter_agent_id uuid,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  agent_id uuid,
  content text,
  type text,
  importance_score float,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.agent_id,
    memories.content,
    memories.type,
    memories.importance_score,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.agent_id = filter_agent_id
    AND 1 - (memories.embedding <=> query_embedding) > match_threshold
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Admin check function (for INFJ domain access)
CREATE OR REPLACE FUNCTION has_infj_admin_access(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, allow everyone (change this to restrict)
  -- You can customize this logic to check specific emails or roles
  RETURN TRUE;
  
  -- Example restriction (uncomment and modify):
  -- RETURN EXISTS (
  --   SELECT 1 FROM auth.users
  --   WHERE id = check_user_id
  --   AND email IN ('admin@ijhana.com', 'youremail@example.com')
  -- );
END;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check that all tables exist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'memories', 'knowledge_domains', 'agent_members');

-- Should return 5 rows, all with rowsecurity = true

-- Check that functions exist
SELECT proname 
FROM pg_proc 
WHERE proname IN ('match_memories', 'has_infj_admin_access', 'match_infj_knowledge', 'match_touche_knowledge');

-- Should return at least 2 rows (match_memories, has_infj_admin_access)
-- The match_infj_knowledge and match_touche_knowledge might not exist yet - that's OK

-- =============================================================================
-- NOTES
-- =============================================================================

/*
This update SQL:
1. Creates/updates the match_memories function (used by the new import system)
2. Creates/updates the admin check function
3. Does NOT modify existing tables or data
4. Is safe to run multiple times

If you already have all tables working, this just ensures functions are up to date.
*/
