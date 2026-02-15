# Testing Ongoing Memory Extraction

## Quick Test Plan

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Conversation Flow

Have a conversation that includes extractable information:

**Message 1:** "Hi EVE!"
**Message 2:** "My name is Kevin"
**Message 3:** "I'm 55 years old"
**Message 4:** "I live in Jacksonville, Florida"
**Message 5:** "I work as an art gallery owner"
**Message 6:** "I love the album Psychocandy by The Jesus and Mary Chain"
**Message 7:** "My favorite food is Thai cuisine"
**Message 8:** "I went to an Oasis concert last year"
**Message 9:** "My daughter's name is Emma"
**Message 10:** "I'm currently working on a project called EVE"

After message 10, check console for:
```
[Memory Extraction] Processing 10 messages for agent ...
[Memory] Saved: Name: Kevin
[Memory] Saved: Age: 55 years old
[Memory] Saved: Location: Jacksonville, Florida
[Memory] Saved: Profession: art gallery owner
[Memory] Saved: Favorite music: "Psychocandy" by The Jesus and Mary Chain
[Memory] Saved: Favorite food: Thai cuisine
[Memory] Saved: Attended: Oasis event
[Memory] Saved: Emma (daughter)
[Memory] Saved: Current project: EVE
[Memory Extraction] Extracted 9 new memories
```

### 3. Verify in Database

Check Supabase:
```sql
SELECT 
  content, 
  category, 
  tags, 
  importance_score,
  created_at
FROM memories
WHERE agent_id = 'your-agent-id'
ORDER BY created_at DESC
LIMIT 20;
```

Should see the 9 new memories created.

### 4. Test Memory Retrieval

**Message 11:** "What do you know about me?"

EVE should now reference the newly extracted memories:
- "Your name is Kevin"
- "You're 55 years old"
- "You live in Jacksonville, Florida"
- etc.

### 5. Test Deduplication

**Message 12-21:** Repeat the same information

After message 20, check that NO duplicate memories were created (deduplication working).

### 6. Test Different Patterns

Try other patterns:
- "I really enjoy hiking"
- "I visited Paris last summer"  
- "My wife's name is Sarah"
- "I'm building a new startup"

Check console to see if these get extracted.

## Expected Results

✅ Memories extracted every 10 messages
✅ No duplicate memories created
✅ Embeddings generated automatically
✅ Categories and tags assigned correctly
✅ Importance scores set appropriately
✅ Memories used in subsequent responses

## Troubleshooting

### No memories extracted?
- Check console for `[Memory Extraction]` logs
- Verify OPENAI_API_KEY is set
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check pattern matches in ongoing-memory-extractor.ts

### Duplicates created?
- Check deduplication threshold (currently 0.95)
- May need to lower threshold or improve logic

### Wrong categories?
- Update pattern matching in extractWithPatterns()
- Add more specific patterns

## Performance Notes

- Extraction runs asynchronously (doesn't block chat response)
- Each embedding costs ~$0.0001
- 10 messages = ~9 memories = ~$0.0009
- 1000 messages = ~900 memories = ~$0.09

## Next Steps After Testing

1. ✅ If working: Deploy to production
2. ⏳ Add memory management UI
3. ⏳ Add AI-powered extraction (optional, $)
4. ⏳ Fine-tune patterns based on real usage
