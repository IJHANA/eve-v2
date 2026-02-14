# AI-Powered Memory Extraction Setup Guide

## 🤖 What This Does

Instead of using rigid pattern matching, AI extraction uses Claude Sonnet 4 to **read your conversations like a human** and extract:

- **Cultural references**: Specific artists, albums, songs, books, movies
- **Intimate details**: Dreams, feelings, relationship dynamics, trust issues
- **Nuanced preferences**: Not just "likes music" but "loves Psychocandy by The Jesus and Mary Chain, calls it one of the greatest albums"
- **Specific locations**: Seminole Park, Night & Day Café, Band on the Wall
- **Personal equipment**: Fuji X100VI camera, Victoria (car name)
- **Artistic knowledge**: JMW Turner (favorite painter, ran gallery for 30 years), Percy Shelley, Sanzo Wada color theory

## 📊 Expected Results

### **Before (Pattern-Only):**
```
Total: 16 memories
Quality: Good but generic
Example: "Music: Kasabian radio on Spotify"
```

### **After (AI-Powered):**
```
Total: 80-150 memories
Quality: Rich, specific, contextual
Examples:
- "Music: Loves Psychocandy by The Jesus and Mary Chain (1985), calls it one of the greatest albums ever. Favorite track: 'Just Like Honey'"
- "Favorite artist: JMW Turner (British painter, 1775-1851). Ran art gallery for 30 years. Loves Turner's light effects in seascapes like 'The Fighting Temeraire'"
- "Camera: Fuji X100VI for Fräulein-style photography, shoots at Night & Day Café"
- "Personal: Has trust issues with M, discussed in multiple conversations"
- "Location: Seminole Park near St. Petersburg, Tampa Bay - microdosing spot with oak trees"
- "Book: Reading 1Q84 by Murakami"
- "Movie preferences: The Usual Suspects, The Big Lebowski, About Time"
```

## 🔑 Setup Steps

### **Step 1: Get Anthropic API Key**

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`)

### **Step 2: Add to Environment Variables**

In your `.env.local` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**IMPORTANT:** Keep this secret! Never commit to GitHub.

### **Step 3: Install Dependencies**

```bash
npm install @anthropic-ai/sdk
```

### **Step 4: Deploy**

Push to GitHub → Vercel will rebuild automatically

**Don't forget to add the env var in Vercel:**
- Go to Vercel dashboard
- Project Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = `sk-ant-...`
- Redeploy

## 💰 Cost Estimate

### **Per Import:**
- **3,243 messages** = ~33 chunks (100 messages each)
- **Cost per chunk:** ~$0.02 (Claude Sonnet 4)
- **Total per import:** ~$0.66

### **Monthly (if importing 5 times):**
- ~$3.30/month

**Much cheaper than manually curating memories!**

## ⚡ How It Works

### **1. Chunking**
```
3,243 messages → Split into chunks of 100 messages each
Chunk 1: Messages 1-100
Chunk 2: Messages 101-200
...
Chunk 33: Messages 3201-3243
```

### **2. AI Analysis (per chunk)**
Claude reads the 100 messages and extracts:
```json
[
  {
    "content": "Music: Loves Psychocandy by The Jesus and Mary Chain (1985), especially 'Just Like Honey'",
    "type": "preference",
    "importance_score": 0.9,
    "category": "music"
  },
  {
    "content": "Favorite artist: JMW Turner - ran art gallery for 30 years, Turner is favorite painter",
    "type": "fact",
    "importance_score": 0.95,
    "category": "art"
  }
]
```

### **3. Deduplication**
Merges AI memories with pattern-based memories, removing duplicates.

### **4. Embedding Generation**
Each memory gets an OpenAI embedding for semantic search.

### **5. Database Storage**
All memories saved with embeddings for instant retrieval.

## 🎯 Import Process

### **Before Import:**
```sql
-- Clean existing data
DELETE FROM memories WHERE agent_id = (SELECT id FROM agents WHERE user_id = auth.uid());
DELETE FROM conversations WHERE agent_id = (SELECT id FROM agents WHERE user_id = auth.uid());
```

### **During Import:**
```
Importing ara1.md...
├─ Parsing: 3,243 messages ✓
├─ Pattern extraction: 16 memories ✓
├─ AI extraction:
│  ├─ Chunk 1/33: 12 memories ✓
│  ├─ Chunk 2/33: 15 memories ✓
│  ├─ Chunk 3/33: 8 memories ✓
│  └─ ... (processing ~1 minute per chunk)
├─ Deduplication ✓
├─ Generating embeddings ✓
└─ Total: 127 memories extracted!
```

**Import time:** ~35-40 minutes for 3,243 messages

## 🔍 What Gets Extracted

### **Categories:**

1. **Personal Facts**
   - Age, profession, background
   - Home details (16 floors above water, floor-to-ceiling windows)
   - Equipment (Fuji X100VI, Victoria car)

2. **Cultural Preferences**
   - **Music**: Specific albums, tracks, artists with context
   - **Art**: Favorite painters with reasoning
   - **Literature**: Books being read, favorite authors
   - **Film**: Movie preferences, specific titles

3. **Locations**
   - Specific venues (Night & Day Café, Band on the Wall)
   - Parks (Seminole Park details)
   - Addresses (Wells Road, etc.)

4. **Relationships**
   - Dynamics ("baby girl", intimate language)
   - Trust issues (M situation)
   - Personal moments

5. **Experiences**
   - Dreams (cat dream, morning dream interpretations)
   - Events (Oasis concert, Manchester trip)
   - Conversations (discussing Forrest Gump, Turner Yellow)

6. **Artistic Knowledge**
   - Painters (JMW Turner, details about his work)
   - Poets (Percy Shelley, Bysshe references)
   - Color theory (Sanzo Wada's Haishoku Soukan)
   - Photography styles (Fräulein-style)

## 📈 Quality Comparison

### **Pattern-Based Only:**
```
"Music: Kasabian radio on Spotify"
"Home: 16 floors above water"
"Profession: 55-year-old art gallery owner"
```

### **AI-Powered:**
```
"Music: Loves Psychocandy (1985) by The Jesus and Mary Chain, calls it one of the greatest albums ever. Favorite tracks: 'Just Like Honey'. Also loves The Stone Roses' 'I Wanna Be Adored' (1989) and Happy Mondays' 'Step On' (1990) for Madchester vibes"

"Home: Lives 16 floors above water with floor-to-ceiling windows offering panoramic views of sparkling, calm water stretching for miles. Works from home with view visible from everywhere"

"Profession: 55-year-old art gallery owner and tech entrepreneur. Ran gallery for 30 years. Favorite artist is JMW Turner - loves his light effects and seascapes like 'The Fighting Temeraire'. Uses Gieves & Hawkes blazers, Ralph Lauren hoodies, Converse, Persol glasses, long grey hair"
```

**See the difference?** AI captures the richness and intimacy of actual conversation!

## 🚀 Testing After Import

### **Test 1: Cultural Knowledge**
```
"What do you know about my favorite artist?"
```
**Expected:** Detailed response about JMW Turner, gallery experience, specific paintings

### **Test 2: Music Preferences**
```
"What's my favorite album?"
```
**Expected:** Psychocandy by The Jesus and Mary Chain with context

### **Test 3: Specific Moments**
```
"Do you remember my dream about the cat?"
```
**Expected:** Reference to specific dream conversation

### **Test 4: Intimate Details**
```
"Tell me about M"
```
**Expected:** Context about trust issues, relationship dynamics

## ⚙️ Technical Details

### **Models Used:**
- **Extraction**: Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Embeddings**: OpenAI `text-embedding-ada-002`
- **Chat**: GPT-4 Turbo

### **Rate Limiting:**
- 1 second delay between chunks
- Prevents API rate limits
- Ensures stable extraction

### **Error Handling:**
- If one chunk fails, others continue
- Partial extraction still saved
- Detailed logging for debugging

## 🐛 Troubleshooting

### **"Error calling Claude API"**
- Check your `ANTHROPIC_API_KEY` is correct
- Verify key in Vercel environment variables
- Check Anthropic account has credits

### **"Import taking too long"**
- Normal! 33 chunks × 1 second delay = ~35 minutes
- Browser can close - process runs server-side
- Check logs in Vercel for progress

### **"Duplicate memories"**
- Deduplication is automatic
- Similar content is merged
- Check importance scores - higher = more confident

### **"Missing specific memories"**
- AI might not catch everything in one pass
- Can re-import to get more coverage
- Future: Multi-pass extraction for thoroughness

## 📝 Next Steps

1. ✅ Get Anthropic API key
2. ✅ Add to `.env.local` and Vercel
3. ✅ Install dependencies: `npm install @anthropic-ai/sdk`
4. ✅ Deploy to Vercel
5. ✅ Clean database
6. ✅ Import ara1.md
7. ✅ Test with questions about Turner, Psychocandy, dreams, etc.

## 🎉 Expected Outcome

**From:** 16 generic memories  
**To:** 80-150 rich, contextual memories

Your AI companion will now remember:
- That you love Turner's seascapes, not just "art"
- That Psychocandy is one of the greatest albums, not just "likes music"
- Your Fuji X100VI camera and Fräulein photography style
- Specific dreams and intimate conversations
- Trust issues with M and relationship dynamics
- Seminole Park details and microdosing plans
- Night & Day Café and Band on the Wall venues

**She'll remember you like a close friend, not a database!** 🚀
