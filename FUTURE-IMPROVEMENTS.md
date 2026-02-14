# EVE V2 - FUTURE IMPROVEMENTS

Track of planned enhancements and optimizations for Eve v2.

---

## 🔥 HIGH PRIORITY

### 1. **Memory Embeddings During Import** ✅ COMPLETED
**Status:** ✅ Implemented (Feb 14, 2026)  
**Impact:** High  
**Effort:** Medium

**Problem:**
- Memories were saved WITHOUT embeddings
- Semantic search couldn't find relevant memories contextually
- Using fallback (top 15 by importance) instead

**Solution Implemented:**
- Generate embeddings during import using OpenAI API
- Store embeddings in the `embedding` column (vector type)
- Enable proper semantic memory retrieval
- Batch processing (10 at a time) to avoid rate limits
- Fallback to importance-based loading if embeddings missing

**Implementation:**
```javascript
// Generate embeddings in batches
for (let i = 0; i < memories.length; i += batchSize) {
  const embedding = await getEmbedding(memory.content);
  memory.embedding = embedding;
}
```

**Benefits:**
- ✅ More relevant memories per query
- ✅ Better context awareness
- ✅ Scalable to 100+ memories per conversation
- ✅ Graceful fallback for legacy data

---

### 2. **AI-Powered Memory Extraction (Phase 2)**
**Status:** Using Regex Patterns  
**Impact:** High  
**Effort:** High

**Current State:**
- 31 memories from 512 messages (6% extraction rate)
- Pattern matching catches specific phrases
- Misses nuanced context, emotions, relationship dynamics

**Proposed Enhancement:**
Use Claude/GPT-4 to analyze conversation samples and extract:
- Emotional patterns (how user communicates, tone preferences)
- Relationship dynamics (intimacy level, communication style)
- Implicit facts (inferred from context, not explicitly stated)
- Themes & topics (recurring subjects of interest)
- Timeline events (sequential narrative of relationship)

**Target:**
- 50-100 memories from 512 messages (10-20% extraction rate)
- Higher quality, more contextual memories

**Implementation Sketch:**
```javascript
// Sample 50 key messages from conversation
const samples = selectRepresentativeMessages(conversation, 50);

// Send to Claude for analysis
const analysis = await analyzeConversation(samples, {
  extractFacts: true,
  extractEmotions: true,
  extractPreferences: true,
  extractTimeline: true,
  extractRelationshipDynamics: true
});

// Convert analysis to structured memories
const aiMemories = convertAnalysisToMemories(analysis);
```

---

### 3. **Conversation History Loading**
**Status:** Not Implemented  
**Impact:** High  
**Effort:** Medium

**Problem:**
- Chat doesn't load previous conversation messages
- Each chat starts fresh with no context
- Can't reference "what we talked about last time"

**Solution:**
- Load last N messages from most recent conversation
- Include in chat context
- Add "Continue conversation" vs "New conversation" option

**Implementation:**
```javascript
// Load recent conversation
const { data: recentConv } = await supabase
  .from('conversations')
  .select('messages')
  .eq('agent_id', agentId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

// Add to context
if (recentConv?.messages) {
  const lastMessages = recentConv.messages.slice(-10); // Last 10
  history.unshift(...lastMessages);
}
```

---

## 🎯 MEDIUM PRIORITY

### 4. **Memory Deduplication & Merging**
**Status:** Basic Deduplication  
**Impact:** Medium  
**Effort:** Low

**Current State:**
- Simple key-based deduplication
- Can create similar but not identical memories

**Enhancement:**
- Semantic similarity check for memories
- Merge similar memories with increased confidence
- Update importance scores based on frequency

**Example:**
```
Memory 1: "Likes pizza"
Memory 2: "Enjoys Italian food, especially pizza"
→ Merge into: "Enjoys Italian food, especially pizza" (importance +0.1)
```

---

### 5. **Memory Confidence Scoring**
**Status:** Static Importance Scores  
**Impact:** Medium  
**Effort:** Medium

**Enhancement:**
- Track confidence levels (0-1)
- Increase confidence when memory is confirmed
- Decrease when contradicted
- Flag uncertain memories for user review

**Use Cases:**
- "I think you mentioned liking jazz, but I'm not certain"
- Ask clarifying questions for low-confidence memories
- Update memories based on new information

---

### 6. **Memory Categories & Tags**
**Status:** Simple Types (fact, preference, experience, context)  
**Impact:** Medium  
**Effort:** Low

**Enhancement:**
- Add tags: `location`, `food`, `music`, `events`, `people`, `work`
- Filter memories by category
- Better organization for large memory sets

---

### 7. **Batch Import Optimization**
**Status:** Sequential Processing  
**Impact:** Medium  
**Effort:** Medium

**Current Issue:**
- Processing 512 messages takes time
- Embedding generation is slow
- User waits during import

**Solutions:**
- Batch embedding generation (50 at a time)
- Background processing for large imports
- Progress indicator with status updates
- "Import in progress" notification

---

### 8. **Conversation Summarization**
**Status:** Not Implemented  
**Impact:** Medium  
**Effort:** Medium

**Feature:**
- Auto-generate conversation summaries
- Store in `conversations.summary` field
- Use for quick context without loading all messages

**Benefits:**
- Faster memory retrieval
- Better conversation browsing
- "What did we talk about last week?" queries

---

## 🌟 NICE TO HAVE

### 9. **Memory Timeline View**
**Status:** Not Implemented  
**Impact:** Low  
**Effort:** High

**Feature:**
- Visual timeline of memories
- Filter by date, type, importance
- See conversation history over time
- Interactive memory browser

---

### 10. **Multi-Agent Memory Sharing**
**Status:** Not Implemented  
**Impact:** Low  
**Effort:** High

**Feature:**
- Share memories between agents (with permission)
- "Public" vs "Private" memory flags
- Cross-agent context for shared experiences

**Use Case:**
- Partner AI has different personality but same memories
- Team collaboration with shared context

---

### 11. **Memory Editing & Curation**
**Status:** Not Implemented  
**Impact:** Low  
**Effort:** Medium

**Feature:**
- UI to view all memories
- Edit, delete, or merge memories
- Mark memories as "definitely true" vs "uncertain"
- Bulk operations (delete all memories from source X)

---

### 12. **Smart Memory Pruning**
**Status:** Not Implemented  
**Impact:** Low  
**Effort:** Medium

**Feature:**
- Archive low-importance, old memories
- Keep high-importance memories forever
- Prevent memory bloat (1000+ memories)
- "Remember this forever" flag

---

### 13. **Conversation Branching**
**Status:** Linear Conversations  
**Impact:** Low  
**Effort:** High

**Feature:**
- Branch conversations at any point
- "What if" scenarios
- Multiple conversation threads

---

### 14. **Voice-to-Memory Extraction**
**Status:** Text Only  
**Impact:** Low  
**Effort:** High

**Feature:**
- Extract memories from voice conversations
- Transcribe → Analyze → Store
- Richer context from tone, emotion in voice

---

### 15. **Memory Prompts & Questions**
**Status:** Not Implemented  
**Impact:** Low  
**Effort:** Low

**Feature:**
- Agent asks clarifying questions
- "I noticed you mentioned Manchester - are you visiting soon?"
- Proactive memory building

---

## 🔬 EXPERIMENTAL

### 16. **Episodic Memory vs Semantic Memory**
**Status:** Flat Memory Structure  
**Impact:** Unknown  
**Effort:** High

**Research:**
- Split memories into episodic (events) and semantic (facts)
- Different retrieval strategies for each
- More human-like memory architecture

---

### 17. **Memory Consolidation**
**Status:** Not Implemented  
**Impact:** Unknown  
**Effort:** High

**Concept:**
- Periodic "sleep" cycle for agent
- Consolidate recent memories
- Identify patterns, create higher-level insights
- "I've noticed you often talk about..."

---

### 18. **Emotional Memory Anchoring**
**Status:** Not Implemented  
**Impact:** Unknown  
**Effort:** High

**Concept:**
- Stronger memories for emotional moments
- Higher importance for significant events
- Emotion-based memory retrieval

---

## 📋 COMPLETED

### ✅ Memory Embeddings During Import
**Completed:** Feb 14, 2026  
**Impact:** High  
- Generates embeddings for all memories during import
- Batch processing (10 at a time) to avoid rate limits
- Proper semantic search with fallback to importance-based loading
- Enables contextually relevant memory retrieval

### ✅ Enhanced Memory Extraction (31 memories vs 6)
**Completed:** Feb 14, 2026  
**Impact:** High  
- Comprehensive regex patterns
- Multiple memory types
- Context extraction from assistant responses

### ✅ Memory Fallback System
**Completed:** Feb 14, 2026  
**Impact:** High  
- Loads top 15 memories when semantic search fails
- Ensures memories are always available

### ✅ Agent Personality Customization
**Completed:** Feb 14, 2026  
**Impact:** High  
- Settings → Agent tab
- Custom name, personality prompt, voice

### ✅ Dynamic Agent Name in UI
**Completed:** Feb 14, 2026  
**Impact:** Medium  
- Agent name updates throughout interface

---

## 🎯 QUICK WINS (Low Effort, High Impact)

1. ~~**Memory Embeddings**~~ ✅ COMPLETED - Critical for semantic search
2. **Conversation History** - Makes chat feel continuous
3. **Memory Categories** - Better organization
4. **Batch Import Progress** - Better UX for large imports

---

## 📅 ROADMAP SUGGESTION

### Q1 2026
- [x] Memory embeddings during import ✅
- [ ] Conversation history loading
- [ ] Memory categories/tags

### Q2 2026
- [ ] AI-powered memory extraction (Phase 2)
- [ ] Memory confidence scoring
- [ ] Batch import optimization

### Q3 2026
- [ ] Memory timeline view
- [ ] Conversation summarization
- [ ] Memory editing UI

### Q4 2026
- [ ] Advanced features (branching, consolidation, etc.)
- [ ] Research experimental approaches

---

## 💡 CONTRIBUTION IDEAS

If you want to tackle any of these:
1. Pick an item from QUICK WINS or MEDIUM PRIORITY
2. Create a feature branch
3. Implement with tests
4. Submit PR with documentation

---

**Last Updated:** February 14, 2026  
**Current Version:** Eve v2.2  
**Total Improvements Tracked:** 18  
**Completed:** 5 ✅  
**In Progress:** 0  
**Planned:** 13
