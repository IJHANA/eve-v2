-- EVE V2 - Specialized Memory Tables Migration
-- Date: February 14, 2026
-- Purpose: Add specialized tables for music, work, relationships, and dreams

-- ============================================================================
-- 1. MUSIC MEMORIES
-- ============================================================================

CREATE TABLE music_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Core music data
  song_title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INTEGER,
  
  -- User context
  first_mentioned TIMESTAMP DEFAULT NOW(),
  last_mentioned TIMESTAMP DEFAULT NOW(),
  mention_count INTEGER DEFAULT 1,
  listen_frequency TEXT CHECK (listen_frequency IN ('daily', 'weekly', 'monthly', 'occasional', 'rare')),
  emotional_connection TEXT CHECK (emotional_connection IN ('nostalgic', 'energizing', 'calming', 'romantic', 'motivational', 'sad', 'neutral')),
  
  -- Spotify integration (future)
  spotify_track_id TEXT,
  spotify_preview_url TEXT,
  spotify_album_art_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for music_memories
CREATE INDEX music_memories_memory_id_idx ON music_memories(memory_id);
CREATE INDEX music_memories_user_id_idx ON music_memories(user_id);
CREATE INDEX music_memories_agent_id_idx ON music_memories(agent_id);
CREATE INDEX music_memories_artist_idx ON music_memories(artist);
CREATE INDEX music_memories_genre_idx ON music_memories(genre);
CREATE INDEX music_memories_emotional_idx ON music_memories(emotional_connection);

-- RLS policies for music_memories
ALTER TABLE music_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY music_memories_select_policy ON music_memories
  FOR SELECT USING (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY music_memories_insert_policy ON music_memories
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY music_memories_update_policy ON music_memories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY music_memories_delete_policy ON music_memories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 2. WORK MEMORIES
-- ============================================================================

CREATE TABLE work_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Project details
  project_name TEXT,
  project_description TEXT,
  project_status TEXT CHECK (project_status IN ('active', 'completed', 'on-hold', 'cancelled', 'archived')),
  
  -- Company/role
  company TEXT,
  role TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'self-employed')),
  
  -- Skills
  skills TEXT[], -- ['design', 'management', 'sales']
  technologies TEXT[], -- ['Figma', 'React', 'PostgreSQL']
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  
  -- Context
  achievements TEXT[],
  challenges TEXT[],
  lessons_learned TEXT[],
  
  -- Collaborators (JSONB)
  collaborators JSONB,
  /* Example:
  [
    {"name": "Sarah Johnson", "role": "Designer", "relationship": "close"},
    {"name": "Mike Chen", "role": "Developer", "relationship": "professional"}
  ]
  */
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for work_memories
CREATE INDEX work_memories_memory_id_idx ON work_memories(memory_id);
CREATE INDEX work_memories_user_id_idx ON work_memories(user_id);
CREATE INDEX work_memories_agent_id_idx ON work_memories(agent_id);
CREATE INDEX work_memories_company_idx ON work_memories(company);
CREATE INDEX work_memories_status_idx ON work_memories(project_status);
CREATE INDEX work_memories_skills_idx ON work_memories USING GIN(skills);

-- RLS policies for work_memories
ALTER TABLE work_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY work_memories_select_policy ON work_memories
  FOR SELECT USING (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY work_memories_insert_policy ON work_memories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY work_memories_update_policy ON work_memories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY work_memories_delete_policy ON work_memories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 3. RELATIONSHIP MEMORIES
-- ============================================================================

CREATE TABLE relationship_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Person details
  person_name TEXT NOT NULL,
  relationship TEXT, -- 'spouse', 'partner', 'child', 'parent', 'sibling', 'friend', 'colleague'
  
  -- Context
  how_met TEXT,
  met_date DATE,
  
  -- Important dates (JSONB)
  important_dates JSONB,
  /* Example:
  {
    "birthday": "1990-05-15",
    "anniversary": "2020-06-20",
    "first_met": "2019-03-15"
  }
  */
  
  -- Shared interests
  shared_interests TEXT[], -- ['music', 'art', 'travel']
  
  -- Preferences (JSONB)
  preferences JSONB,
  /* Example:
  {
    "favorite_food": "Thai cuisine",
    "favorite_color": "blue",
    "loves": ["dogs", "hiking", "jazz"],
    "dislikes": ["spicy food", "crowds"]
  }
  */
  
  -- Dynamics
  communication_style TEXT, -- 'direct', 'indirect', 'formal', 'casual', 'intimate'
  current_status TEXT, -- 'close', 'distant', 'estranged', 'reconnecting'
  
  -- Contact info
  email TEXT,
  phone TEXT,
  
  -- Metadata
  first_mentioned TIMESTAMP DEFAULT NOW(),
  last_mentioned TIMESTAMP DEFAULT NOW(),
  mention_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for relationship_memories
CREATE INDEX relationship_memories_memory_id_idx ON relationship_memories(memory_id);
CREATE INDEX relationship_memories_user_id_idx ON relationship_memories(user_id);
CREATE INDEX relationship_memories_agent_id_idx ON relationship_memories(agent_id);
CREATE INDEX relationship_memories_person_idx ON relationship_memories(person_name);
CREATE INDEX relationship_memories_relationship_idx ON relationship_memories(relationship);

-- RLS policies for relationship_memories
ALTER TABLE relationship_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY relationship_memories_select_policy ON relationship_memories
  FOR SELECT USING (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY relationship_memories_insert_policy ON relationship_memories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY relationship_memories_update_policy ON relationship_memories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY relationship_memories_delete_policy ON relationship_memories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 4. DREAM MEMORIES
-- ============================================================================

CREATE TABLE dream_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Dream details
  dream_date DATE NOT NULL,
  dream_content TEXT NOT NULL,
  
  -- Analysis
  themes TEXT[], -- ['flying', 'water', 'family', 'chase', 'falling']
  emotions TEXT[], -- ['fear', 'joy', 'confusion', 'peace', 'anxiety']
  symbols TEXT[], -- ['ocean', 'bird', 'house', 'car']
  
  -- Patterns
  recurring BOOLEAN DEFAULT false,
  pattern_id UUID, -- Links related recurring dreams
  recurrence_count INTEGER DEFAULT 1,
  
  -- Lucidity
  lucid BOOLEAN DEFAULT false,
  lucidity_level INTEGER CHECK (lucidity_level >= 1 AND lucidity_level <= 5),
  
  -- Interpretation
  personal_meaning TEXT,
  ai_analysis TEXT, -- GPT-4 generated analysis
  
  -- Context
  sleep_quality TEXT CHECK (sleep_quality IN ('excellent', 'good', 'fair', 'poor')),
  woke_up_feeling TEXT CHECK (woke_up_feeling IN ('refreshed', 'tired', 'anxious', 'peaceful', 'confused')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for dream_memories
CREATE INDEX dream_memories_memory_id_idx ON dream_memories(memory_id);
CREATE INDEX dream_memories_user_id_idx ON dream_memories(user_id);
CREATE INDEX dream_memories_agent_id_idx ON dream_memories(agent_id);
CREATE INDEX dream_memories_date_idx ON dream_memories(dream_date DESC);
CREATE INDEX dream_memories_recurring_idx ON dream_memories(recurring);
CREATE INDEX dream_memories_pattern_idx ON dream_memories(pattern_id);
CREATE INDEX dream_memories_themes_idx ON dream_memories USING GIN(themes);

-- RLS policies for dream_memories
ALTER TABLE dream_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY dream_memories_select_policy ON dream_memories
  FOR SELECT USING (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY dream_memories_insert_policy ON dream_memories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY dream_memories_update_policy ON dream_memories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY dream_memories_delete_policy ON dream_memories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 5. ENHANCE EXISTING MEMORIES TABLE
-- ============================================================================

-- Add category column if not exists
ALTER TABLE memories ADD COLUMN IF NOT EXISTS category TEXT;

-- Add tags column if not exists
ALTER TABLE memories ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add last_accessed tracking
ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Create index for tags
CREATE INDEX IF NOT EXISTS memories_tags_idx ON memories USING GIN(tags);

-- Create index for category
CREATE INDEX IF NOT EXISTS memories_category_idx ON memories(category);

-- Create index for access tracking
CREATE INDEX IF NOT EXISTS memories_last_accessed_idx ON memories(last_accessed DESC);
CREATE INDEX IF NOT EXISTS memories_access_count_idx ON memories(access_count DESC);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update last_mentioned timestamps
CREATE OR REPLACE FUNCTION update_music_last_mentioned()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_mentioned = NOW();
  NEW.mention_count = COALESCE(OLD.mention_count, 0) + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER music_memories_last_mentioned_trigger
BEFORE UPDATE ON music_memories
FOR EACH ROW
EXECUTE FUNCTION update_music_last_mentioned();

-- Function to update relationship last_mentioned
CREATE OR REPLACE FUNCTION update_relationship_last_mentioned()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_mentioned = NOW();
  NEW.mention_count = COALESCE(OLD.mention_count, 0) + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER relationship_memories_last_mentioned_trigger
BEFORE UPDATE ON relationship_memories
FOR EACH ROW
EXECUTE FUNCTION update_relationship_last_mentioned();

-- Function to track memory access
CREATE OR REPLACE FUNCTION track_memory_access(memory_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE memories
  SET 
    last_accessed = NOW(),
    access_count = COALESCE(access_count, 0) + 1
  WHERE id = memory_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: All memories with their specialized data
CREATE OR REPLACE VIEW memories_enriched AS
SELECT 
  m.*,
  mu.song_title,
  mu.artist,
  mu.album,
  mu.genre,
  mu.emotional_connection,
  w.project_name,
  w.company,
  w.role,
  w.project_status,
  r.person_name,
  r.relationship as person_relationship,
  r.communication_style,
  d.dream_date,
  d.recurring as is_recurring_dream,
  d.themes as dream_themes
FROM memories m
LEFT JOIN music_memories mu ON m.id = mu.memory_id
LEFT JOIN work_memories w ON m.id = w.memory_id
LEFT JOIN relationship_memories r ON m.id = r.memory_id
LEFT JOIN dream_memories d ON m.id = d.memory_id;

-- ============================================================================
-- 8. SAMPLE DATA FOR TESTING
-- ============================================================================

-- This would be populated by the import process
-- Example shown in comments:

/*
-- Sample music memory
INSERT INTO memories (agent_id, type, content, category, tags, importance_score)
VALUES (
  '...agent-uuid...',
  'preference',
  'Song: "Champagne Supernova" by Oasis',
  'music',
  ARRAY['oasis', 'britpop', '90s', 'nostalgic'],
  0.9
) RETURNING id;

-- Then create specialized music record
INSERT INTO music_memories (
  memory_id, user_id, agent_id,
  song_title, artist, album, genre, year,
  emotional_connection, listen_frequency
) VALUES (
  '...memory-id...',
  '...user-id...',
  '...agent-id...',
  'Champagne Supernova',
  'Oasis',
  '(What''s the Story) Morning Glory?',
  'Britpop',
  1995,
  'nostalgic',
  'weekly'
);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- To rollback this migration:
/*
DROP VIEW IF EXISTS memories_enriched;
DROP FUNCTION IF EXISTS track_memory_access;
DROP TRIGGER IF EXISTS relationship_memories_last_mentioned_trigger ON relationship_memories;
DROP TRIGGER IF EXISTS music_memories_last_mentioned_trigger ON music_memories;
DROP FUNCTION IF EXISTS update_relationship_last_mentioned;
DROP FUNCTION IF EXISTS update_music_last_mentioned;
DROP TABLE IF EXISTS dream_memories;
DROP TABLE IF EXISTS relationship_memories;
DROP TABLE IF EXISTS work_memories;
DROP TABLE IF EXISTS music_memories;
*/
