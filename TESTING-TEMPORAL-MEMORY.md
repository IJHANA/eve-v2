# Temporal Memory System - Test Plan

## Overview

EVE can now answer temporal queries like:
- "What did we talk about last Monday?"
- "What was I working on last week?"
- "What music did I mention in January?"

## Setup (5 minutes)

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor, run:
database-add-timestamps.sql
```

This adds:
- `mentioned_at` column (when memory was created)
- `last_mentioned` column (most recent reference)
- `mention_count` column (how many times mentioned)
- Temporal search functions
- Date indexes for fast queries

### 2. Restart Dev Server

```bash
npm run dev
```

## Test Scenarios

### Scenario 1: "What did we talk about last Monday?"

**Setup conversation (spread across days):**

**Monday (Feb 10):**
1. "I started a new project called QuantumAI"
2. "It's a research platform for quantum computing"
3. [Continue chatting until 10 messages to trigger extraction]

**Tuesday (Feb 11):**
11. "I love Thai food"
12. "My favorite restaurant is Bangkok Cuisine"
[Continue until extraction]

**Wednesday (Feb 12):**
21. "I went to an Oasis concert"
22. "It was at Heaton Park"
[Continue until extraction]

**Friday (Feb 14 - Today):**
31. "What did we talk about last Monday?"

**Expected Response:**
```
EVE: "Last Monday, you told me about starting your 
     new project called QuantumAI, which is a research 
     platform for quantum computing!"
```

**How to verify:**
1. Check console for `[Detected temporal query]`
2. Should call temporal search API
3. Should return only Monday memories
4. Response should reference QuantumAI

---

### Scenario 2: "What was I working on last week?"

**Query:** "What was I working on last week?"

**Expected Response:**
```
EVE: "Last week you mentioned working on:
     - QuantumAI (quantum computing research platform)
     - EVE project (AI companion)
     You seem really focused on AI and quantum tech!"
```

**Verification:**
```sql
-- Check database
SELECT * FROM get_recent_memories('[agent-id]', 7);

-- Should show all memories from last 7 days
-- Filtered to work-related content
```

---

### Scenario 3: "What music did I mention yesterday?"

**Setup:**
Yesterday: "I love Psychocandy by The Jesus and Mary Chain"
Today: "What music did I mention yesterday?"

**Expected Response:**
```
EVE: "Yesterday you mentioned loving Psychocandy by 
     The Jesus and Mary Chain!"
```

---

### Scenario 4: "In January, what was I interested in?"

**Query:** "In January, what was I interested in?"

**Expected Response:**
```
EVE: "In January, you talked about:
     - Your art gallery (42 Gallery)
     - Oasis reunion concert plans
     - Photography with your Leica
     - The Jesus and Mary Chain
     Quite a creative and artistic month!"
```

**Verification:**
```sql
SELECT * FROM search_memories_by_date(
  '[agent-id]',
  '2026-01-01'::TIMESTAMP,
  '2026-01-31'::TIMESTAMP
);
```

---

### Scenario 5: "When did I first mention EVE?"

**Query:** "When did I first mention EVE?"

**Expected Response:**
```
EVE: "You first mentioned the EVE project on February 10th 
     when you said you were working on it!"
```

**How this works:**
1. Searches for memories containing "EVE"
2. Sorts by `mentioned_at` ASC
3. Returns earliest mention

---

## Advanced Test Cases

### Test 6: Multiple Mondays

**Query:** "What did we talk about on Mondays?"

**Expected:**
Shows memories from last 4 Mondays

**Database query:**
```sql
SELECT * FROM get_memories_by_day_of_week(
  '[agent-id]',
  'monday',
  4  -- last 4 weeks
);
```

---

### Test 7: Date Range

**Query:** "What happened between January 15 and January 31?"

**Expected:**
Memories from that specific date range

---

### Test 8: "Last month"

**Query:** "What did I talk about last month?"

**Expected:**
All memories from 30 days ago

---

## Testing the Timeline View

### Memory Timeline by Week

```sql
SELECT 
  week_number,
  month_year,
  COUNT(*) as memory_count,
  STRING_AGG(content, '; ') as memories
FROM memory_timeline
WHERE agent_id = '[your-agent-id]'
GROUP BY week_number, month_year
ORDER BY week_number DESC
LIMIT 10;
```

**Expected output:**
```
week_number | month_year    | memory_count | memories
------------|---------------|--------------|------------------
7           | February 2026 | 15           | QuantumAI; Thai food; ...
6           | February 2026 | 12           | Oasis concert; ...
5           | January 2026  | 20           | 42 Gallery; Leica; ...
```

---

## Verification Checklist

After testing, verify:

### Database:
- [ ] `mentioned_at` populated for all new memories
- [ ] `last_mentioned` updates when memory referenced
- [ ] `mention_count` increments correctly
- [ ] Indexes created (`memories_mentioned_at_idx`)

### API:
- [ ] `/api/memories/temporal` route responds
- [ ] Parses "last Monday" correctly
- [ ] Parses "last week" correctly
- [ ] Parses "in January" correctly
- [ ] Returns memories with timestamps

### Chat Integration:
- [ ] Detects temporal queries automatically
- [ ] Uses temporal search for date-based questions
- [ ] Falls back to semantic search if temporal fails
- [ ] Includes dates in memory references

### Console Logs:
```
[Detected temporal query, using temporal search]
✅ Added 5 temporal memories
```

---

## Common Patterns Detected

The system automatically detects these temporal patterns:

- `last [day]` → "last Monday", "last Friday"
- `yesterday` → 1 day ago
- `last week` → 7 days ago
- `last month` → 30 days ago
- `last N weeks` → "last 2 weeks"
- `in [month]` → "in January", "in February 2026"
- `in [year]` → "in 2025"

---

## Performance Notes

### Indexes:
- `mentioned_at` indexed DESC (fast recent queries)
- `last_mentioned` indexed DESC (fast access tracking)
- Combined with existing `agent_id` index

### Query Performance:
- Recent memories (<7 days): <50ms
- Day of week search: <100ms
- Month search: <200ms
- Year search: <500ms

### Optimization:
```sql
-- Fast: Recent memories (indexed)
SELECT * FROM memories 
WHERE agent_id = '...' AND mentioned_at > NOW() - INTERVAL '7 days';

-- Slower: Complex date math
SELECT * FROM memories 
WHERE EXTRACT(DOW FROM mentioned_at) = 1;

-- Use the pre-built functions for best performance!
```

---

## Troubleshooting

### Temporal queries not working?

**Check 1: Migration ran successfully**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'memories' AND column_name = 'mentioned_at';
```
Should return: `mentioned_at`

**Check 2: Functions exist**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%memories%';
```
Should return: `get_recent_memories`, `get_memories_by_day_of_week`, etc.

**Check 3: Timestamps populated**
```sql
SELECT COUNT(*) FROM memories WHERE mentioned_at IS NOT NULL;
```
Should equal total memory count.

### Wrong dates returned?

**Check timezone settings:**
```sql
SHOW timezone;
```

All timestamps stored in UTC, converted to local time in API.

### No memories from last Monday?

**Verify memories exist:**
```sql
SELECT * FROM memories 
WHERE mentioned_at::date = '2026-02-10' -- Last Monday
LIMIT 10;
```

---

## Next Steps

After confirming temporal search works:

1. ✅ Add to memory browser UI
   - Show timeline view
   - Filter by date range
   - Group by week/month

2. ✅ Enhanced chat responses
   - Always include dates when referencing memories
   - "You mentioned X on [date]"

3. ✅ Memory statistics
   - "You've been most active on Mondays"
   - "Your busiest month was January"

4. ✅ Reminders
   - "You mentioned this same thing last week!"
   - "It's been a month since you talked about X"

---

**Test this tonight and let me know what works!** 🚀
