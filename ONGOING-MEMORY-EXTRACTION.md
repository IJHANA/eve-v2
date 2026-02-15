# Ongoing Memory Extraction Strategy

## 🎯 THE PROBLEM

**Current state:**
- ✅ Import extracts 35 memories from uploaded files
- ❌ New conversations create NO new memories
- ❌ User mentions new pet → Not remembered
- ❌ User gets new job → Not captured
- ❌ User moves to new city → Lost

**Result:** Memory becomes stale over time!

---

## 💡 THE SOLUTION

Extract memories from **ongoing conversations**, not just imports.

---

## 🏗️ ARCHITECTURE OPTIONS

### **Option 1: Real-Time Extraction** ⚡ (Simple)

Extract memories **during the chat** (same request).

**Pros:**
- ✅ Immediate memory creation
- ✅ No background jobs needed
- ✅ Simple to implement

**Cons:**
- ❌ Slower response time (+200ms)
- ❌ Only catches user messages
- ❌ Misses context from previous messages

**When to use:** 
- Small user base (<100)
- Simple pattern extraction only

---

### **Option 2: Batch Extraction** 📦 (Recommended)

Extract memories **every N messages** (e.g., every 10 messages).

**Pros:**
- ✅ No impact on chat speed
- ✅ Catches patterns across multiple messages
- ✅ More context = better extraction

**Cons:**
- ❌ Slight delay in memory creation
- ❌ Needs background job system

**When to use:**
- Growing user base (100-10,000)
- Pattern + AI extraction

---

### **Option 3: Periodic Extraction** 🕐 (Scale)

Extract memories **daily/weekly** from all new conversations.

**Pros:**
- ✅ Zero impact on chat
- ✅ Can use heavy AI extraction
- ✅ Optimized for cost

**Cons:**
- ❌ Memories lag by hours/days
- ❌ Requires cron jobs

**When to use:**
- Large user base (10,000+)
- AI-heavy extraction
- Cost optimization needed

---

## 🚀 IMPLEMENTATION: BATCH EXTRACTION (Recommended)

### **How It Works:**

```
User sends 10 messages
       ↓
Trigger: conversation.messages.length % 10 === 0
       ↓
Extract memories from last 10 messages
       ↓
Add to memories table
       ↓
Continue chat normally
```

### **Code:**

```typescript
// app/api/chat/route.ts

import { extractEnhancedMemories } from '@/lib/importers/enhanced-memory-extractor';

// After saving the conversation
const messageCount = conversation.messages.length;

// Extract memories every 10 messages
if (messageCount % 10 === 0) {
  console.log(`🧠 Extracting memories at ${messageCount} messages...`);
  
  // Get last 10 messages for context
  const recentMessages = conversation.messages.slice(-10);
  
  // Create mini-conversation for extraction
  const miniConv = {
    id: conversation.id,
    agent_id: agentId,
    user_id: userId,
    messages: recentMessages,
    privacy: 'heir_only',
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  
  // Extract memories
  const newMemories = extractEnhancedMemories([miniConv]);
  
  if (newMemories.length > 0) {
    console.log(`✅ Found ${newMemories.length} new memories`);
    
    // Generate embeddings
    const memoriesWithEmbeddings = await Promise.all(
      newMemories.map(async (mem) => {
        const embedding = await getEmbedding(mem.content);
        return {
          ...mem,
          agent_id: agentId,
          embedding,
        };
      })
    );
    
    // Save to database
    const { error } = await supabase
      .from('memories')
      .insert(memoriesWithEmbeddings);
    
    if (error) {
      console.error('Error saving new memories:', error);
    } else {
      console.log(`💾 Saved ${memoriesWithEmbeddings.length} new memories`);
    }
  }
}
```

---

## 📊 EXTRACTION TRIGGERS

### **Conservative (Every 20 messages):**
```typescript
if (messageCount % 20 === 0) {
  // Extract from last 20 messages
}
```
**Pros:** Low overhead, less duplication  
**Cons:** Misses details between extractions  
**Best for:** Large user base, cost-conscious

---

### **Balanced (Every 10 messages):** ⭐ Recommended
```typescript
if (messageCount % 10 === 0) {
  // Extract from last 10 messages
}
```
**Pros:** Good balance of coverage and cost  
**Cons:** Some duplication possible  
**Best for:** Most use cases

---

### **Aggressive (Every 5 messages):**
```typescript
if (messageCount % 5 === 0) {
  // Extract from last 5 messages
}
```
**Pros:** Maximum memory capture  
**Cons:** Higher cost, more duplicates  
**Best for:** Premium users, deep personalization

---

## 🛡️ DEDUPLICATION

Prevent extracting the same memory twice:

```typescript
// Before inserting new memories
const existingMemories = await supabase
  .from('memories')
  .select('content')
  .eq('agent_id', agentId);

const existingContents = new Set(
  existingMemories.data?.map(m => m.content.toLowerCase()) || []
);

const uniqueNewMemories = newMemories.filter(mem => 
  !existingContents.has(mem.content.toLowerCase())
);

// Only insert unique memories
await supabase.from('memories').insert(uniqueNewMemories);
```

---

## 🎯 WHAT GETS EXTRACTED

### **From Ongoing Conversations:**

#### **User mentions new pet:**
```
User: "I just got a new cat named Pixel!"
```
**Extracted:**
```
Pet: Has a cat named Pixel
```

#### **User changes job:**
```
User: "I started my new job at Google today!"
```
**Extracted:**
```
Profession: Works at Google (tech company)
```

#### **User moves:**
```
User: "Just moved to Seattle, loving the rain!"
```
**Extracted:**
```
Location: Lives in Seattle, Washington
```

#### **User discovers new music:**
```
User: "Have you heard of Khruangbin? They're amazing!"
```
**Extracted:**
```
Music: Loves Khruangbin
```

#### **User shares preference:**
```
User: "I hate mornings, I'm definitely a night person"
```
**Extracted:**
```
Preference: Night person, dislikes mornings
```

---

## 💰 COST ANALYSIS

### **Pattern-Based Extraction:**

**Per conversation (1,000 messages):**
- Extract every 10 messages = 100 extractions
- Cost per extraction = $0 (pattern-based)
- Total cost = **$0**

**Embedding generation:**
- New memories = ~5 per extraction × 100 = 500 memories
- Embedding cost = 500 × $0.00001 = **$0.005**

**Total per 1,000 messages: $0.005 (half a cent)**

---

### **AI-Based Extraction:**

**Per conversation (1,000 messages):**
- Extract every 10 messages = 100 extractions
- Cost per AI extraction = $0.02
- Total cost = **$2.00**

**Better approach:** AI extraction every 50 messages
- 1,000 messages / 50 = 20 extractions
- Cost = 20 × $0.02 = **$0.40**

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Pattern-Based** (Immediate)
- [ ] Add extraction trigger to chat route
- [ ] Extract every 10 messages
- [ ] Deduplicate before saving
- [ ] Test with real conversations

### **Phase 2: Optimization** (Week 2)
- [ ] Monitor duplicate rate
- [ ] Adjust trigger frequency
- [ ] Add extraction logging
- [ ] Create admin dashboard

### **Phase 3: AI Enhancement** (Month 1)
- [ ] Add AI extraction every 50 messages
- [ ] A/B test: pattern vs AI quality
- [ ] Optimize for cost/quality
- [ ] Premium tier with more frequent extraction

---

## 🧪 TESTING STRATEGY

### **Test Scenario 1: New Pet**
```
Day 1: Import history (35 memories)
Day 2: Chat 10 messages, mention new cat "Fluffy"
Expected: Memory "Pet: Has a cat named Fluffy" created
```

### **Test Scenario 2: Job Change**
```
Day 1: Memories show "Works at startup"
Day 20: Chat mentions "Got hired at Microsoft!"
Expected: New memory "Profession: Works at Microsoft"
```

### **Test Scenario 3: New Music**
```
Day 1: Has Psychocandy in memories
Day 30: Mentions "Loving the new Kendrick album"
Expected: Memory "Music: Loves Kendrick Lamar"
```

---

## 🎯 EXPECTED RESULTS

### **Without Ongoing Extraction:**
```
Month 1: 35 memories (from import)
Month 2: 35 memories (stale)
Month 3: 35 memories (very stale)
User satisfaction: ↓ (she forgets new things)
```

### **With Ongoing Extraction:**
```
Month 1: 35 memories (from import) + 10 (from chats) = 45
Month 2: 45 + 15 = 60 memories
Month 3: 60 + 20 = 80 memories
User satisfaction: ↑ (she remembers everything!)
```

---

## 🚀 QUICK START

Add this to `app/api/chat/route.ts` right after saving the conversation:

```typescript
// After this line:
await supabase.from('conversations').update({ messages }).eq('id', conversationId);

// Add this:
const messageCount = messages.length;
if (messageCount % 10 === 0 && messageCount > 10) {
  // Background extraction (don't await - let it run async)
  extractAndSaveMemories(agentId, messages.slice(-10)).catch(console.error);
}
```

Create helper function:

```typescript
async function extractAndSaveMemories(agentId: string, messages: any[]) {
  const miniConv = {
    id: crypto.randomUUID(),
    agent_id: agentId,
    user_id: '',
    messages,
    privacy: 'heir_only',
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  
  const newMemories = extractEnhancedMemories([miniConv]);
  
  if (newMemories.length > 0) {
    const memoriesWithEmbeddings = await Promise.all(
      newMemories.map(async (mem) => ({
        ...mem,
        agent_id: agentId,
        embedding: await getEmbedding(mem.content),
      }))
    );
    
    await supabase.from('memories').insert(memoriesWithEmbeddings);
    console.log(`✅ Extracted ${newMemories.length} new memories`);
  }
}
```

---

## 💡 FUTURE ENHANCEMENTS

1. **Smart Triggers**: Extract when important topics detected
2. **Memory Evolution**: Update existing memories with new context
3. **Memory Consolidation**: Merge related memories
4. **User Feedback**: "Remember this!" button
5. **Memory Expiry**: Fade old, unreferenced memories

---

**Start with Pattern-Based extraction every 10 messages. Simple, free, effective!** 🚀
