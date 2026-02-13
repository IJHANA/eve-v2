-- EVE V2 DATABASE MIGRATION
-- Safe migration that doesn't touch existing tables
-- Run this in Supabase SQL Editor

-- =============================================================================
-- PART 1: NEW TABLES FOR EVE V2
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- 1. AGENTS TABLE (replaces old core_personalities pattern)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Eve',
  type TEXT NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'shared')),
  
  -- Personality configuration
  core_prompt TEXT NOT NULL,
  default_mood JSONB DEFAULT '{
    "empathy": 0.7,
    "directness": 0.5,
    "humor": 0.5,
    "formality": 0.3,
    "intensity": 0.5,
    "romanticism": 0.1
  }'::jsonb,
  
  -- Voice configuration
  voice_mode TEXT DEFAULT 'auto' CHECK (voice_mode IN ('auto', 'locked')),
  locked_voice_id TEXT,
  locked_voice_settings JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One agent per user for personal agents
  UNIQUE(user_id, type)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own agents
CREATE POLICY agents_user_policy ON agents
  FOR ALL
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. AGENT_MEMBERS TABLE (for shared agents - Phase 2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_members_agent_id ON agent_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_members_user_id ON agent_members(user_id);

ALTER TABLE agent_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_members_policy ON agent_members
  FOR ALL
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_members.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 3. CONVERSATIONS TABLE (new conversation storage)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conversation data
  messages JSONB NOT NULL,
  summary TEXT,
  themes TEXT[],
  
  -- Mood and voice settings during conversation
  mood_settings JSONB,
  voice_used JSONB,
  
  -- Privacy controls for inheritance
  privacy TEXT DEFAULT 'heir_only' CHECK (privacy IN (
    'private',
    'heir_only',
    'heir_age_18',
    'heir_age_25',
    'heir_date',
    'public'
  )),
  release_date DATE,
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_policy ON conversations
  FOR ALL
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = conversations.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4. MEMORIES TABLE (extracted from conversations with embeddings)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Memory data
  type TEXT CHECK (type IN ('fact', 'preference', 'story', 'emotion', 'timeline_event')),
  content TEXT NOT NULL,
  
  -- Semantic search
  importance_score FLOAT DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  embedding vector(1536),
  
  -- Privacy
  privacy TEXT DEFAULT 'heir_only' CHECK (privacy IN (
    'private',
    'heir_only',
    'heir_age_18',
    'heir_age_25',
    'heir_date',
    'public'
  )),
  release_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_agent_id ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance_score DESC);

-- Vector similarity search index (requires pgvector)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY memories_policy ON memories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = memories.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 5. KNOWLEDGE_DOMAINS TABLE (track which expertise domains are enabled)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  domain_name TEXT NOT NULL CHECK (domain_name IN (
    'infj_psychology',
    'touche_gallery',
    'custom'
  )),
  enabled BOOLEAN DEFAULT true,
  context_weight FLOAT DEFAULT 0.8 CHECK (context_weight >= 0 AND context_weight <= 1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, domain_name)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_agent_id ON knowledge_domains(agent_id);

ALTER TABLE knowledge_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY knowledge_domains_policy ON knowledge_domains
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = knowledge_domains.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- =============================================================================
-- PART 2: FUNCTIONS FOR SIMILARITY SEARCH
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

-- =============================================================================
-- PART 3: OPTIONAL DATA MIGRATION (Run if you want to migrate old data)
-- =============================================================================

-- Uncomment this section if you want to migrate existing users to new system
-- This is OPTIONAL and can be done later

/*
-- Migrate existing core_personalities to agents
INSERT INTO agents (user_id, name, core_prompt, created_at)
SELECT 
  user_id,
  COALESCE(name, 'Eve'),
  COALESCE(prompt, 'You are Eve, a thoughtful AI companion.'),
  created_at
FROM core_personalities
ON CONFLICT (user_id, type) DO NOTHING;

-- Migrate existing user_memories to memories
-- (This is more complex and might require custom logic)
-- Skipping for now - can be done in Phase 2
*/

-- =============================================================================
-- PART 4: ADMIN UTILITIES
-- =============================================================================

-- Function to check if user has admin access for INFJ domain
CREATE OR REPLACE FUNCTION has_infj_admin_access(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, hardcode admin user IDs or check a separate admin table
  -- You can customize this logic
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = check_user_id
    -- Add your admin check logic here
    -- For example: AND email = 'admin@ijhana.com'
  );
END;
$$;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these after migration to verify everything worked:

-- Check new tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'memories', 'knowledge_domains', 'agent_members');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'conversations', 'memories', 'knowledge_domains', 'agent_members');

-- =============================================================================
-- NOTES
-- =============================================================================

/*
This migration:
1. Creates all new tables for Eve v2
2. Does NOT modify or delete any existing tables
3. Enables RLS on all new tables
4. Creates indexes for performance
5. Sets up similarity search functions

Existing tables remain untouched:
- core_personalities (old system still works)
- user_personalities (old system still works)  
- user_memories (old system still works)
- infj_knowledge (shared between old and new)
- touche_knowledge (shared between old and new)

To complete migration:
1. Run this SQL in Supabase SQL Editor
2. Verify with the verification queries at the bottom
3. Deploy Eve v2 app
4. Both apps will work simultaneously
5. Gradually migrate users from old to new system
*/
