# EVE Memory & Search Architecture
**Date:** February 14, 2026  
**Version:** 2.0  
**Status:** Technical Specification  
**Owner:** CTO + Product Team

---

## Vision Statement

**"Your AI companion who actually remembers you—from your favorite music to your dreams, from your work projects to your personal relationships."**

This document specifies exactly HOW we accomplish this promise and make all data searchable.

---

## Memory Categories & Data Sources

### **What EVE Remembers:**

```
┌─────────────────────────────────────────────────────┐
│                    EVE'S MEMORY                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  PREFERENCES                    FACTS               │
│  • Music (favorite songs/       • Name, age, job   │
│    albums/artists)              • Location, home    │
│  • Art preferences              • Equipment/tools   │
│  • Movies & books               • Important dates   │
│  • Food & restaurants           • Contact info      │
│  • Activities & hobbies         • Family members    │
│                                                     │
│  EXPERIENCES                    CONTEXT             │
│  • Life stories                 • Relationships     │
│  • Travel & events              • Work dynamics     │
│  • Achievements                 • Personal history  │
│  • Challenges overcome          • Emotional patterns│
│  • Dreams & aspirations         • Values & beliefs  │
│                                                     │
│  WORK & PROJECTS                RELATIONSHIPS       │
│  • Current projects             • Spouse/partner    │
│  • Past work                    • Children          │
│  • Career milestones            • Friends           │
│  • Skills & expertise           • Family dynamics   │
│  • Business context             • Relationship history│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Collection Methods

### **1. Conversation Import (Initial Bootstrap)**

**Source:** Grok, ChatGPT, Claude exports  
**Volume:** 3,000-10,000 messages  
**Extraction Rate:** 1-3% become memories

**Example from ara1.md (3,061 messages):**
```
Input: 3,061 messages
↓
Pattern extraction: 35 memories
Enhanced patterns: +35 memories
Tagged songs: +15 memories
AI extraction (optional): +40 memories
↓
Output: 87-125 high-quality memories
```

**Data extracted:**
- Preferences (music, art, food)
- Facts (name, home, equipment)
- Locations (Seminole Park, Manchester venues)
- Events (Oasis concert, trips)
- Relationships (Ara, family)

---

### **2. Ongoing Conversations (Continuous Learning)**

**Frequency:** Every 10 messages  
**Method:** Pattern + AI extraction

```typescript
// After user sends 10 messages
if (messageCount % 10 === 0) {
  const recentMessages = messages.slice(-10);
  
  // Pattern-based extraction (instant, free)
  const patternMemories = extractPatterns(recentMessages);
  
  // AI extraction (optional, if enabled)
  const aiMemories = await extractWithAI(recentMessages);
  
  // Combine and deduplicate
  const newMemories = deduplicate([...patternMemories, ...aiMemories]);
  
  // Generate embeddings
  for (const memory of newMemories) {
    memory.embedding = await generateEmbedding(memory.content);
  }
  
  // Save to database
  await saveMemories(newMemories);
}
```

**What gets extracted:**
- New preferences mentioned
- Updated information
- Recent events
- Emotional patterns
- New relationships

---

### **3. Life Stories (Manual Entry)**

**Source:** User manually documents significant events  
**Quality:** 100% accurate (user-created)

**Example:**
```
User creates life story:
Title: "Oasis Concert at Heaton Park"
Date: July 11, 2025
Story: "Saw Oasis reunion concert. Incredible night..."
People: Ara
Emotions: Joy, Excitement
Photos: 3 uploaded
Tags: music, oasis, manchester, concert

↓ Automatically creates memory:
"Event: Oasis Concert at Heaton Park (July 11, 2025)
 Attended with Ara. Described as 'incredible night'.
 Tagged: music, oasis, manchester, concert"
```

---

### **4. File Uploads (Document Processing)**

**Planned feature (v2.3):**
- Upload PDFs, Word docs, notes
- Automatic memory extraction
- Structured data parsing

**Use cases:**
```
Upload Resume → Extract:
- Work history (2010-2024: Adobe, 42 Gallery, Consulting)
- Skills (Design, Management, Entrepreneurship)
- Education (BFA from RISD, 2005)

Upload Journal Entries → Extract:
- Daily experiences
- Emotional patterns
- Recurring themes
- Personal growth journey

Upload Recipe Collection → Extract:
- Favorite dishes
- Cooking preferences
- Family recipes
```

---

### **5. Integration Sync (Future)**

**Google Calendar → Extract:**
- Upcoming appointments
- Recurring events
- Meeting patterns

**Email (Gmail/Outlook) → Extract:**
- Important contacts
- Project context
- Commitments

**Photos (Google Photos/iCloud) → Extract:**
- Life events from photo metadata
- People in photos
- Location data

---

## Memory Storage Architecture

### **Database Schema**

**memories table (Core):**
```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  
  -- Content
  type TEXT NOT NULL, -- 'fact', 'preference', 'experience', 'context'
  content TEXT NOT NULL, -- "Favorite album: Psychocandy by JAMC"
  
  -- Semantic Search
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002
  
  -- Metadata
  importance_score FLOAT DEFAULT 0.5, -- 0.0 (low) to 1.0 (critical)
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP, -- For recency boost
  access_count INTEGER DEFAULT 0, -- Popularity metric
  
  -- Categorization
  category TEXT, -- 'music', 'work', 'family', 'travel', etc.
  tags TEXT[], -- ['oasis', 'concert', 'manchester']
  
  -- Source tracking
  source_type TEXT, -- 'conversation', 'life_story', 'file_upload'
  source_id UUID, -- Link to original source
  
  -- Privacy
  privacy TEXT DEFAULT 'private', -- 'private', 'shared'
  
  -- Rich metadata (JSONB)
  metadata JSONB
  /* Example:
  {
    "people": ["Ara", "Emma"],
    "location": "Heaton Park, Manchester",
    "date": "2025-07-11",
    "emotions": ["joy", "excitement"],
    "entities": {
      "artist": "Oasis",
      "album": "Definitely Maybe",
      "venue": "Heaton Park"
    }
  }
  */
);

-- Indexes for fast retrieval
CREATE INDEX memories_agent_id_idx ON memories(agent_id);
CREATE INDEX memories_type_idx ON memories(type);
CREATE INDEX memories_category_idx ON memories(category);
CREATE INDEX memories_tags_idx ON memories USING GIN(tags);
CREATE INDEX memories_importance_idx ON memories(importance_score DESC);
CREATE INDEX memories_embedding_idx ON memories 
  USING ivfflat (embedding vector_cosine_ops);
```

---

### **Specialized Tables**

**music_memories:**
```sql
CREATE TABLE music_memories (
  id UUID PRIMARY KEY,
  memory_id UUID REFERENCES memories(id),
  
  -- Music-specific fields
  song_title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INTEGER,
  
  -- User context
  first_mentioned DATE,
  listen_frequency TEXT, -- 'daily', 'weekly', 'occasional'
  emotional_connection TEXT, -- 'nostalgic', 'energizing', 'calming'
  
  -- Spotify integration (future)
  spotify_track_id TEXT,
  spotify_preview_url TEXT
);
```

**work_memories:**
```sql
CREATE TABLE work_memories (
  id UUID PRIMARY KEY,
  memory_id UUID REFERENCES memories(id),
  
  -- Work-specific fields
  project_name TEXT,
  project_status TEXT, -- 'active', 'completed', 'archived'
  company TEXT,
  role TEXT,
  skills TEXT[],
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  
  -- Context
  achievements TEXT[],
  challenges TEXT[],
  collaborators JSONB -- [{name, role, relationship}]
);
```

**relationship_memories:**
```sql
CREATE TABLE relationship_memories (
  id UUID PRIMARY KEY,
  memory_id UUID REFERENCES memories(id),
  
  -- Person details
  person_name TEXT,
  relationship TEXT, -- 'spouse', 'child', 'friend', 'colleague'
  
  -- Context
  how_met TEXT,
  important_dates JSONB, -- {anniversary, birthday, etc.}
  shared_interests TEXT[],
  
  -- Dynamics
  communication_style TEXT,
  preferences JSONB, -- What they like/dislike
  current_status TEXT -- 'close', 'distant', 'estranged'
);
```

**dream_memories:**
```sql
CREATE TABLE dream_memories (
  id UUID PRIMARY KEY,
  memory_id UUID REFERENCES memories(id),
  
  -- Dream details
  dream_date DATE,
  dream_content TEXT,
  
  -- Analysis
  themes TEXT[], -- 'flying', 'water', 'family'
  emotions TEXT[], -- 'fear', 'joy', 'confusion'
  recurring BOOLEAN DEFAULT false,
  
  -- Patterns (detected over time)
  pattern_id UUID, -- Links recurring dream elements
  
  -- User interpretation
  personal_meaning TEXT,
  ai_analysis TEXT -- GPT-4 dream analysis
);
```

---

## Search Architecture

### **Multi-Modal Search System**

EVE uses **4 layers of search** to find relevant memories:

```
User Query: "What psychedelic music do I like?"
        ↓
┌───────────────────────────────────────────────┐
│  LAYER 1: Semantic Search (Primary)           │
│  Vector similarity using embeddings            │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│  LAYER 2: Keyword Search (Fallback)           │
│  PostgreSQL full-text search                  │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│  LAYER 3: Metadata Filters                    │
│  Category, tags, date range                   │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│  LAYER 4: Ranking & Relevance                 │
│  Importance, recency, access frequency        │
└───────────────────────────────────────────────┘
        ↓
    Top 5 Memories Returned
```

---

### **Layer 1: Semantic Search (Primary)**

**How it works:**
```typescript
async function semanticSearch(query: string, agentId: string) {
  // 1. Generate embedding for user's query
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  
  // 2. Search using cosine similarity
  const { data: memories } = await supabase.rpc('search_memories', {
    query_embedding: queryEmbedding.data[0].embedding,
    agent_id: agentId,
    match_threshold: 0.70, // 70% similarity minimum
    match_count: 20 // Get top 20 candidates
  });
  
  return memories;
}
```

**PostgreSQL function:**
```sql
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding VECTOR(1536),
  agent_id UUID,
  match_threshold FLOAT DEFAULT 0.70,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type TEXT,
  category TEXT,
  similarity FLOAT
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
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE 
    m.agent_id = search_memories.agent_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Example:**
```
Query: "What psychedelic music do I like?"

Query Embedding: [0.023, -0.145, 0.089, ...] (1536 dimensions)

Memories Found:
1. "Music: Dream Syndicate - LA psych-rock band" (0.89 similarity)
2. "Song: 'Eight Miles High' by The Byrds" (0.87 similarity)
3. "Music: Rain Parade - psychedelic band" (0.86 similarity)
4. "Song: 'Fade Into You' by Mazzy Star - dreamy" (0.84 similarity)
5. "Band: The Warlocks - psych-rock" (0.82 similarity)
```

---

### **Layer 2: Keyword Search (Fallback)**

**When semantic search fails or needs augmentation:**

```sql
-- Full-text search with ranking
SELECT
  id,
  content,
  ts_rank(search_vector, query) AS rank
FROM memories
WHERE
  agent_id = $1
  AND search_vector @@ to_tsquery('english', $2)
ORDER BY rank DESC
LIMIT 20;
```

**Search vector (auto-generated):**
```sql
-- Add tsvector column
ALTER TABLE memories ADD COLUMN search_vector tsvector;

-- Auto-update trigger
CREATE TRIGGER memories_search_vector_update
BEFORE INSERT OR UPDATE ON memories
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(
  search_vector, 'pg_catalog.english', 
  content, tags
);

-- Index for fast search
CREATE INDEX memories_search_idx 
ON memories USING GIN(search_vector);
```

---

### **Layer 3: Metadata Filters**

**Enhance search with structured filters:**

```typescript
async function advancedSearch(params: {
  query: string,
  category?: string, // 'music', 'work', 'family'
  tags?: string[], // ['oasis', 'concert']
  dateRange?: { start: Date, end: Date },
  people?: string[], // ['Ara', 'Emma']
  minImportance?: number // 0.0 - 1.0
}) {
  // Start with semantic search
  let memories = await semanticSearch(params.query);
  
  // Apply filters
  if (params.category) {
    memories = memories.filter(m => m.category === params.category);
  }
  
  if (params.tags?.length > 0) {
    memories = memories.filter(m => 
      params.tags.some(tag => m.tags.includes(tag))
    );
  }
  
  if (params.dateRange) {
    memories = memories.filter(m =>
      m.created_at >= params.dateRange.start &&
      m.created_at <= params.dateRange.end
    );
  }
  
  if (params.people?.length > 0) {
    memories = memories.filter(m =>
      params.people.some(person => 
        m.metadata?.people?.includes(person)
      )
    );
  }
  
  if (params.minImportance) {
    memories = memories.filter(m => 
      m.importance_score >= params.minImportance
    );
  }
  
  return memories;
}
```

**Example advanced query:**
```javascript
advancedSearch({
  query: "concerts",
  category: "music",
  tags: ["oasis", "manchester"],
  dateRange: { start: "2025-01-01", end: "2025-12-31" },
  people: ["Ara"],
  minImportance: 0.8
})

// Returns: Oasis concert at Heaton Park (July 11, 2025)
```

---

### **Layer 4: Ranking & Relevance**

**Combine multiple signals to rank results:**

```typescript
function rankMemories(memories: Memory[], query: string) {
  return memories.map(memory => {
    // Base score from semantic similarity
    let score = memory.similarity;
    
    // Boost by importance (0-1)
    score *= (1 + memory.importance_score);
    
    // Boost recent memories
    const daysSinceCreation = daysBetween(memory.created_at, now());
    const recencyBoost = Math.max(0, 1 - (daysSinceCreation / 365));
    score *= (1 + recencyBoost * 0.3);
    
    // Boost frequently accessed memories
    const popularityBoost = Math.min(memory.access_count / 100, 0.5);
    score *= (1 + popularityBoost);
    
    // Boost recently accessed memories
    if (memory.last_accessed) {
      const daysSinceAccess = daysBetween(memory.last_accessed, now());
      const accessRecency = Math.max(0, 1 - (daysSinceAccess / 30));
      score *= (1 + accessRecency * 0.2);
    }
    
    // Exact keyword match bonus
    if (memory.content.toLowerCase().includes(query.toLowerCase())) {
      score *= 1.5;
    }
    
    return { ...memory, final_score: score };
  })
  .sort((a, b) => b.final_score - a.final_score);
}
```

**Ranking factors:**
- **Semantic similarity** (70% weight) - Vector similarity to query
- **Importance score** (15% weight) - User-set or AI-determined
- **Recency** (5% weight) - Newer memories weighted higher
- **Popularity** (5% weight) - Frequently accessed memories
- **Access recency** (3% weight) - Recently used memories
- **Keyword match** (2% weight) - Exact phrase bonus

---

## Context Assembly for Chat

**When user sends message, EVE assembles context:**

```typescript
async function buildChatContext(userMessage: string, agentId: string) {
  // 1. Search memories
  const relevantMemories = await semanticSearch(userMessage, agentId);
  const topMemories = rankMemories(relevantMemories, userMessage).slice(0, 5);
  
  // 2. Get conversation history
  const recentMessages = await getConversationHistory(agentId, limit: 10);
  
  // 3. Get agent personality
  const agent = await getAgent(agentId);
  
  // 4. Assemble prompt
  const systemPrompt = `
    You are ${agent.name}, a personalized AI companion.
    
    PERSONALITY: ${agent.personality}
    WRITING STYLE: ${agent.writing_style}
    VOICE: ${agent.voice_id}
    
    WHAT YOU REMEMBER ABOUT THE USER:
    ${topMemories.map(m => `- ${m.content}`).join('\n')}
    
    Use these memories naturally in conversation. Reference them when relevant.
    If asked about something not in memories, say you don't know that yet.
  `;
  
  const conversationHistory = recentMessages.map(m => ({
    role: m.role,
    content: m.content
  }));
  
  // 5. Call GPT-4
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]
  });
  
  // 6. Update memory access stats
  for (const memory of topMemories) {
    await updateMemoryAccess(memory.id);
  }
  
  return response.choices[0].message.content;
}
```

---

## Specialized Search Examples

### **Music Search**

```typescript
// User: "What music do I listen to when I'm feeling nostalgic?"

async function searchMusic(query: string, emotion?: string) {
  // Semantic search
  let results = await semanticSearch(query);
  
  // Filter to music category
  results = results.filter(m => m.category === 'music');
  
  // If emotion specified, filter by metadata
  if (emotion) {
    results = results.filter(m => 
      m.metadata?.emotional_connection === emotion
    );
  }
  
  // Join with music_memories for rich data
  const enriched = await Promise.all(
    results.map(async (m) => {
      const musicData = await db.music_memories.findUnique({
        where: { memory_id: m.id }
      });
      return { ...m, music: musicData };
    })
  );
  
  return enriched;
}

// Results:
[
  {
    content: "Song: 'Champagne Supernova' by Oasis",
    music: {
      song_title: "Champagne Supernova",
      artist: "Oasis",
      album: "(What's the Story) Morning Glory?",
      year: 1995,
      emotional_connection: "nostalgic",
      listen_frequency: "weekly"
    }
  },
  {
    content: "Album: Psychocandy by The Jesus and Mary Chain",
    music: {
      artist: "The Jesus and Mary Chain",
      album: "Psychocandy",
      year: 1985,
      emotional_connection: "nostalgic",
      listen_frequency: "daily"
    }
  }
]
```

---

### **Work Project Search**

```typescript
// User: "Tell me about my gallery project"

async function searchWork(query: string) {
  // Semantic search with work filter
  let results = await advancedSearch({
    query: query,
    category: 'work'
  });
  
  // Enrich with work_memories
  const enriched = await Promise.all(
    results.map(async (m) => {
      const workData = await db.work_memories.findUnique({
        where: { memory_id: m.id }
      });
      return { ...m, work: workData };
    })
  );
  
  return enriched;
}

// Results:
[
  {
    content: "Business: 42 gallery - art gallery with Turner Yellow branding",
    work: {
      project_name: "42 Gallery",
      project_status: "completed",
      company: "Self-employed",
      role: "Founder & Owner",
      start_date: "2015-01-01",
      end_date: "2020-12-31",
      achievements: [
        "Grew to 10 employees",
        "30-year successful run",
        "Specialized in JMW Turner art"
      ],
      skills: ["Art curation", "Business management", "Client relations"]
    }
  }
]
```

---

### **Relationship Search**

```typescript
// User: "Tell me about Ara"

async function searchRelationship(personName: string) {
  // Search for person mentions
  let results = await advancedSearch({
    query: personName,
    people: [personName]
  });
  
  // Get dedicated relationship record
  const relationshipData = await db.relationship_memories.findFirst({
    where: { person_name: personName }
  });
  
  return {
    memories: results,
    relationship: relationshipData
  };
}

// Results:
{
  memories: [
    "Oasis concert with Ara on July 11, 2025",
    "Manchester trip with Ara (July 18-20)",
    "Ara loves intimate conversations"
  ],
  relationship: {
    person_name: "Ara",
    relationship: "romantic partner",
    communication_style: "intimate, playful",
    shared_interests: ["music", "art", "travel"],
    important_dates: {
      met: "2019-03-15",
      anniversary: "2020-06-20"
    }
  }
}
```

---

### **Dream Search**

```typescript
// User: "Have I had any recurring dreams?"

async function searchDreams(recurring: boolean = false) {
  let results = await advancedSearch({
    query: "dreams sleep",
    category: 'dreams'
  });
  
  // Filter recurring
  const enriched = await Promise.all(
    results.map(async (m) => {
      const dreamData = await db.dream_memories.findUnique({
        where: { memory_id: m.id }
      });
      return { ...m, dream: dreamData };
    })
  );
  
  if (recurring) {
    return enriched.filter(d => d.dream?.recurring);
  }
  
  return enriched;
}

// Results:
[
  {
    content: "Dream: Flying over water, feeling free",
    dream: {
      dream_date: "2025-02-10",
      themes: ["flying", "water", "freedom"],
      emotions: ["joy", "peace"],
      recurring: true,
      pattern_id: "flying-water-pattern-1",
      personal_meaning: "Represents desire for freedom",
      ai_analysis: "Common dream pattern indicating desire for liberation..."
    }
  }
]
```

---

## Memory Quality & Maintenance

### **Automatic Quality Control**

```typescript
// Deduplicate similar memories
async function deduplicateMemories() {
  const memories = await getAllMemories();
  
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const similarity = cosineSimilarity(
        memories[i].embedding,
        memories[j].embedding
      );
      
      // If >95% similar, keep the more important one
      if (similarity > 0.95) {
        const toKeep = memories[i].importance_score > memories[j].importance_score
          ? memories[i]
          : memories[j];
        const toDelete = toKeep === memories[i] ? memories[j] : memories[i];
        
        await db.memories.delete({ where: { id: toDelete.id } });
      }
    }
  }
}
```

---

### **Importance Decay**

```typescript
// Reduce importance of old, unused memories
async function decayImportance() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  await db.memories.updateMany({
    where: {
      created_at: { lt: oneYearAgo },
      last_accessed: { lt: oneYearAgo },
      importance_score: { gt: 0.5 }
    },
    data: {
      importance_score: db.raw('importance_score * 0.9')
    }
  });
}
```

---

## Performance Optimization

### **Caching Strategy**

```typescript
// Cache frequently accessed memories
const memoryCache = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 60 // 1 hour
});

async function getCachedMemory(memoryId: string) {
  const cached = memoryCache.get(memoryId);
  if (cached) return cached;
  
  const memory = await db.memories.findUnique({ where: { id: memoryId } });
  memoryCache.set(memoryId, memory);
  return memory;
}
```

---

### **Embedding Cache**

```typescript
// Don't regenerate embeddings for identical queries
const embeddingCache = new LRU({
  max: 10000,
  ttl: 1000 * 60 * 60 * 24 // 24 hours
});

async function getCachedEmbedding(text: string) {
  const hash = hashString(text);
  const cached = embeddingCache.get(hash);
  if (cached) return cached;
  
  const embedding = await generateEmbedding(text);
  embeddingCache.set(hash, embedding);
  return embedding;
}
```

---

### **Batch Processing**

```typescript
// Generate embeddings in batches (cheaper + faster)
async function batchGenerateEmbeddings(texts: string[]) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: texts // Up to 2048 texts per request
  });
  
  return response.data.map(d => d.embedding);
}
```

---

## Analytics & Insights

### **Memory Growth Tracking**

```sql
-- Track memory growth over time
SELECT
  DATE_TRUNC('month', created_at) as month,
  category,
  COUNT(*) as memory_count
FROM memories
WHERE agent_id = $1
GROUP BY month, category
ORDER BY month DESC;
```

---

### **Most Accessed Memories**

```sql
-- What memories does EVE reference most?
SELECT
  content,
  category,
  access_count,
  last_accessed
FROM memories
WHERE agent_id = $1
ORDER BY access_count DESC
LIMIT 20;
```

---

### **Memory Coverage Report**

```typescript
async function getMemoryCoverage(agentId: string) {
  const memories = await db.memories.findMany({
    where: { agent_id: agentId }
  });
  
  const coverage = {
    total: memories.length,
    by_category: {},
    by_type: {},
    date_range: {
      oldest: null,
      newest: null
    },
    top_tags: [],
    people_mentioned: new Set(),
    completeness_score: 0
  };
  
  // Calculate coverage metrics
  for (const memory of memories) {
    // Category breakdown
    coverage.by_category[memory.category] = 
      (coverage.by_category[memory.category] || 0) + 1;
    
    // Type breakdown
    coverage.by_type[memory.type] = 
      (coverage.by_type[memory.type] || 0) + 1;
    
    // People mentioned
    if (memory.metadata?.people) {
      memory.metadata.people.forEach(p => coverage.people_mentioned.add(p));
    }
  }
  
  // Completeness score (0-100)
  const hasMusic = coverage.by_category['music'] > 5;
  const hasWork = coverage.by_category['work'] > 3;
  const hasFamily = coverage.by_category['family'] > 3;
  const hasPersonal = coverage.total > 20;
  
  coverage.completeness_score = [hasMusic, hasWork, hasFamily, hasPersonal]
    .filter(Boolean).length * 25;
  
  return coverage;
}

// Example output:
{
  total: 87,
  by_category: {
    music: 55,
    work: 8,
    family: 10,
    personal: 14
  },
  by_type: {
    preference: 60,
    fact: 15,
    experience: 10,
    context: 2
  },
  people_mentioned: ["Ara", "Emma", "Sarah", "Alex"],
  completeness_score: 100 // Has all categories
}
```

---

## User Interface for Search

### **Search Bar with Filters**

```
┌─────────────────────────────────────────────┐
│  🔍 Search memories...                      │
│                                             │
│  Filters: [All ▼] [Any Time ▼] [Any Tag ▼] │
│            │        │            │          │
│         Category  Date Range   Tags        │
└─────────────────────────────────────────────┘
```

---

### **Search Results**

```
┌─────────────────────────────────────────────┐
│  Search results for "oasis"                 │
│                                             │
│  🎵 Oasis Concert (July 11, 2025)           │
│     At Heaton Park with Ara. Incredible...  │
│     Tags: music, oasis, manchester          │
│     Importance: ⭐⭐⭐⭐⭐                    │
│                                             │
│  🎵 Song: "Champagne Supernova" by Oasis    │
│     Favorite 90s Britpop track              │
│     Tags: music, oasis, britpop             │
│     Importance: ⭐⭐⭐⭐                      │
│                                             │
│  🎵 Song: "Wonderwall" by Oasis             │
│     Mentioned as nostalgic favorite         │
│     Tags: music, oasis, 90s                 │
│     Importance: ⭐⭐⭐                        │
└─────────────────────────────────────────────┘
```

---

## Conclusion

**EVE's memory system enables the promise:**

> "Your AI companion who actually remembers you—from your favorite music to your dreams, from your work projects to your personal relationships."

**How we accomplish this:**

1. ✅ **Multi-source data collection** - Import, conversations, life stories, files
2. ✅ **Structured storage** - Specialized tables for music, work, relationships, dreams
3. ✅ **Semantic search** - Vector embeddings for intelligent retrieval
4. ✅ **Multi-layer ranking** - Importance, recency, popularity combined
5. ✅ **Rich metadata** - People, locations, emotions, tags
6. ✅ **Continuous learning** - Every 10 messages extracts new memories
7. ✅ **Quality control** - Deduplication, importance decay
8. ✅ **Performance optimization** - Caching, batching, indexing

**Result:** EVE truly remembers everything and can find it instantly when needed.

---

**Status:** Technical spec complete  
**Implementation:** Core system implemented, specialized tables planned for v2.2  
**Performance:** <100ms semantic search, <50ms cached queries  
**Scalability:** Linear growth to 100K+ memories per user
