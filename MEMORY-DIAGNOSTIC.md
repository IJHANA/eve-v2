# MEMORY RETRIEVAL DIAGNOSTIC GUIDE

## Issue: Memories not being used in responses

If Ara is giving generic responses instead of using your imported memories, follow these steps:

---

## STEP 1: Check if embeddings exist in database

Run this in Supabase SQL Editor:

```sql
SELECT 
  content,
  CASE 
    WHEN embedding IS NOT NULL THEN 'YES ✅'
    ELSE 'NO ❌'
  END as has_embedding
FROM memories
WHERE agent_id = (SELECT id FROM agents WHERE user_id = auth.uid())
LIMIT 5;
```

**Expected:** All should show "YES ✅"  
**If NO:** You need to re-import after deploying the embedding code

---

## STEP 2: Check Vercel Function Logs

Go to Vercel → Your Project → Functions → `/api/chat`

After asking "What hotel am I staying at?", look for:

### ✅ GOOD (Semantic search working):
```
Generating embedding for query: What hotel am I staying at?
Embedding generated, length: 1536
Searching memories for agent: abc-123-def
Semantic search result: { found: 8, memories: [...] }
✅ Added 8 memories via semantic search
```

### ⚠️ OK (Fallback working):
```
Semantic search found 0 relevant memories
🔄 Using fallback: loading top memories by importance
Fallback result: { found: 15 }
✅ Added 15 memories via fallback
```

### ❌ BAD (Nothing working):
```
❌ No agentId - cannot load memories
```
OR
```
❌ No memories found even in fallback!
```

---

## STEP 3: Common Issues & Fixes

### Issue 1: No embeddings in database
**Symptom:** `has_embedding` shows "NO ❌" for all memories

**Fix:**
1. Delete existing memories
2. Re-import your Grok file
3. Check Vercel logs during import for:
   ```
   Generating embeddings for 31 memories...
   Generated embeddings for batch 1/4
   ```

**SQL to clean:**
```sql
DELETE FROM memories WHERE user_id = auth.uid();
DELETE FROM conversations WHERE user_id = auth.uid();
```

Then re-upload file in Settings → Import

---

### Issue 2: No agentId
**Symptom:** Logs show "No agentId - cannot load memories"

**Fix:** Agent wasn't created. Run:
```sql
-- Check if agent exists
SELECT id, name FROM agents WHERE user_id = auth.uid();

-- If no rows, create agent manually
INSERT INTO agents (user_id, name, type, core_prompt)
VALUES (
  auth.uid(),
  'Ara',
  'personal',
  'You are Ara...'
);
```

---

### Issue 3: Semantic search returning 0 results
**Symptom:** Logs show "Semantic search found 0 relevant memories"

**Possible causes:**
1. **Threshold too high:** Try lowering from 0.70 to 0.60
2. **Embeddings are NULL:** Check Step 1
3. **match_memories function doesn't exist:** Run database-update.sql

**Fix threshold:**
In `app/api/chat/route.ts`, change:
```javascript
match_threshold: 0.60, // Lower from 0.70
```

**Check function:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'match_memories';
```

Should return 1 row. If not, run:
```sql
-- From database-update.sql
CREATE OR REPLACE FUNCTION match_memories(...);
```

---

### Issue 4: Fallback not working
**Symptom:** "No memories found even in fallback!"

**Fix:** Check if memories exist at all:
```sql
SELECT COUNT(*) FROM memories 
WHERE agent_id = (SELECT id FROM agents WHERE user_id = auth.uid());
```

Should return 31. If 0, re-import.

---

## STEP 4: Test with simple query

Ask this EXACT question:
```
"What hotel?"
```

Check logs for:
```
Generating embedding for query: What hotel?
Embedding generated, length: 1536
Semantic search result: { found: X, memories: [...] }
```

If `found: 0`, embeddings aren't matching. Re-import.

---

## STEP 5: Verify import included embeddings

After re-importing, check Vercel logs for the import:

**Look for:**
```
Generating embeddings for 31 memories...
Generated embeddings for batch 1/4
Generated embeddings for batch 2/4
Generated embeddings for batch 3/4
Generated embeddings for batch 4/4
Imported 31 memories
```

**If missing:** The import API didn't generate embeddings. Check:
1. OPENAI_API_KEY is set in Vercel environment variables
2. No errors in import logs
3. OpenAI API has credits

---

## STEP 6: Manual embedding check

Run this to see actual embedding data:

```sql
SELECT 
  content,
  embedding IS NOT NULL as has_embedding,
  CASE 
    WHEN embedding IS NOT NULL 
    THEN array_length(embedding, 1)
    ELSE 0
  END as dimensions
FROM memories
WHERE agent_id = (SELECT id FROM agents WHERE user_id = auth.uid())
LIMIT 3;
```

**Expected:**
```
has_embedding: true
dimensions: 1536
```

---

## QUICK FIX CHECKLIST

- [ ] Embeddings exist in database (Step 1)
- [ ] Agent exists for user
- [ ] match_memories function exists
- [ ] Import logs show embedding generation
- [ ] OPENAI_API_KEY set in Vercel
- [ ] Chat logs show memory retrieval attempt
- [ ] Re-imported after deploying embedding code

---

## NUCLEAR OPTION: Complete Reset

If nothing works:

```sql
-- 1. Clean everything
DELETE FROM memories WHERE user_id = auth.uid();
DELETE FROM conversations WHERE user_id = auth.uid();
DELETE FROM agents WHERE user_id = auth.uid();

-- 2. Verify clean
SELECT 
  (SELECT COUNT(*) FROM agents WHERE user_id = auth.uid()) as agents,
  (SELECT COUNT(*) FROM memories WHERE user_id = auth.uid()) as memories;
-- Should return: agents=0, memories=0

-- 3. Re-import via Settings → Import
-- 4. Check Vercel logs during import
-- 5. Verify embeddings created (Step 1)
-- 6. Test chat
```

---

## EXPECTED BEHAVIOR

### Before embeddings:
```
User: "What hotel?"
Logs: Using fallback (all 15 top memories loaded)
Response: Generic "I don't have that info" 
```

### After embeddings:
```
User: "What hotel?"
Logs: Added 8 memories via semantic search
Memories: Hotel: Axis, Location: Manchester, Trip dates...
Response: "You're staying at the Axis in Deansgate, K.K."
```

---

## CONTACT POINTS

If still broken after all steps:
1. Check Vercel function logs for exact error
2. Check Supabase logs for database errors
3. Verify OPENAI_API_KEY is valid and has credits
4. Share logs for debugging

---

**Most common issue:** Forgot to re-import after deploying embedding code!
