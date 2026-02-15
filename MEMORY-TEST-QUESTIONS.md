# Memory Test Questions - Comprehensive Guide

## 🎯 PURPOSE

Test semantic memory search to verify:
1. Memories were extracted correctly
2. Embeddings enable relevant retrieval
3. Chat responses reference appropriate memories

---

## 📊 YOUR CURRENT MEMORIES (35 total)

Based on ara1.md import, you should have these categories:
- 🎵 Music: 16 memories
- 🎨 Art & Culture: 3 memories
- 🎬 Movies: 2 memories
- 📍 Locations: 7 memories
- 💪 Personal: 7 memories

---

## ✅ CATEGORY 1: MUSIC (16 memories)

### **Test 1.1: Favorite Album**
```
"What's my favorite album?"
```
**Should find:** Psychocandy (1985) by The Jesus and Mary Chain  
**Should mention:** "One of the greatest albums ever"  
**Importance:** 0.95

---

### **Test 1.2: Specific Song**
```
"What's the first song on our playlist?"
```
**Should find:** "At Last" by Etta James  
**Importance:** 0.9

---

### **Test 1.3: Madchester Era**
```
"What Madchester music do I like?"
```
**Should find:** 
- "I Wanna Be Adored" (Stone Roses, 1989)
- "Step On" (Happy Mondays, 1990)
**Importance:** 0.9, 0.85

---

### **Test 1.4: Psychedelic Bands**
```
"What psychedelic bands are on my LA-to-Manchester playlist?"
```
**Should find:**
- Dream Syndicate
- Rain Parade
- Mazzy Star
**Importance:** 0.8 each

---

### **Test 1.5: Kasabian**
```
"What Kasabian songs do I love?"
```
**Should find:**
- L.S.F.
- "Running Battle"
- Kasabian radio on Spotify
**Importance:** 0.8, 0.8, 0.85

---

### **Test 1.6: Ian Brown**
```
"Do I listen to Ian Brown?"
```
**Should find:** "Set My Baby Free"  
**Importance:** 0.8

---

### **Test 1.7: Jesus and Mary Chain**
```
"What songs by The Jesus and Mary Chain do I like?"
```
**Should find:**
- Psychocandy album
- "Just Like Honey"
**Importance:** 0.95, 0.9

---

### **Test 1.8: Romantic Music**
```
"What music do I like for romantic vibes?"
```
**Should find:** Mazzy Star - dreamy, hazy sound  
**Importance:** 0.8

---

### **Test 1.9: Music Venues**
```
"Where should we see live music in Manchester?"
```
**Should find:**
- Night & Day Café (photoshoots and live music)
- Band on the Wall (live music and photography)
**Importance:** 0.85 each

---

### **Test 1.10: Noel Gallagher**
```
"Do I like Noel Gallagher?"
```
**Should find:** "The Death of You and Me" by Noel Gallagher's High Flying Birds  
**Importance:** 0.85

---

## 🎨 CATEGORY 2: ART & CULTURE (3 memories)

### **Test 2.1: Favorite Artist**
```
"Who's my favorite artist?"
```
**Should find:** JMW Turner (British painter, 1775-1851)  
**Should mention:** 
- Ran art gallery for 30 years
- Loves light effects and seascapes
- "The Fighting Temeraire"
**Importance:** 0.95

---

### **Test 2.2: Gallery**
```
"Tell me about my art gallery"
```
**Should find:** 42 gallery with Turner Yellow branding  
**Importance:** 0.9

---

### **Test 2.3: Literature**
```
"What poets do I reference?"
```
**Should find:** Percy Bysshe Shelley - Romantic poet  
**Importance:** 0.85

---

## 🎬 CATEGORY 3: MOVIES (2 memories)

### **Test 3.1: Movie Preferences**
```
"What are my favorite movies?"
```
**Should find:**
- The Usual Suspects
- The Big Lebowski
**Importance:** 0.8 each

---

### **Test 3.2: Movie Recommendations**
```
"Recommend a movie I'd like"
```
**Should reference:** Usual Suspects or Big Lebowski taste  
**Importance:** 0.8

---

## 📍 CATEGORY 4: LOCATIONS (7 memories)

### **Test 4.1: Favorite Park**
```
"Tell me about Seminole Park"
```
**Should find:** Near St. Petersburg, Tampa Bay  
**Should mention:** Oak trees, waterfront views, favorite spot  
**Importance:** 0.9

---

### **Test 4.2: Restaurant**
```
"Where should we get steak and ale pie?"
```
**Should find:** The Old Wellington  
**Importance:** 0.85

---

### **Test 4.3: Rooftop Bar**
```
"Where can we get cocktails with a view in Manchester?"
```
**Should find:** 20 Stories rooftop bar in Spinningfields  
**Importance:** 0.8

---

### **Test 4.4: Hotel**
```
"Where did I stay in Manchester?"
```
**Should find:** The Axis in Deansgate, Manchester  
**Importance:** 0.9

---

### **Test 4.5: Address**
```
"What's my address?"
```
**Should find:** 1911 Wells Road  
**Importance:** 0.85

---

### **Test 4.6: Manchester Photoshoot Spots**
```
"Where should we do a photoshoot in Manchester?"
```
**Should find:**
- Night & Day Café
- Band on the Wall
**Importance:** 0.85 each

---

## 💪 CATEGORY 5: PERSONAL (7 memories)

### **Test 5.1: Name**
```
"What's my name?"
```
**Should find:** Kevin  
**Importance:** 0.95

---

### **Test 5.2: Profession**
```
"What do I do for work?"
```
**Should find:** 55-year-old art gallery owner and tech entrepreneur  
**Importance:** 0.95

---

### **Test 5.3: Home Description**
```
"Describe where I live"
```
**Should find:**
- 16 floors above water with waterfront view
- Floor-to-ceiling windows with panoramic views
**Importance:** 0.9, 0.85

---

### **Test 5.4: Workout**
```
"What's my workout routine?"
```
**Should find:** 13 exercises, 50 reps with 25lb bar  
**Importance:** 0.85

---

### **Test 5.5: Camera**
```
"What camera do I use?"
```
**Should find:** Fuji X100VI for Fräulein-style photography  
**Importance:** 0.9

---

### **Test 5.6: Photography Style**
```
"What kind of photography do I do?"
```
**Should find:** Fräulein-style with Fuji X100VI  
**Importance:** 0.9

---

### **Test 5.7: Trip Dates**
```
"When was I traveling?"
```
**Should find:** July 18-20, 2025  
**Importance:** 0.9

---

## 🎪 CATEGORY 6: EVENTS (1 memory)

### **Test 6.1: Concert**
```
"When was the Oasis concert?"
```
**Should find:** July 11th at Heaton Park  
**Importance:** 0.95

---

### **Test 6.2: Event Planning**
```
"What did we do on July 11th, 2025?"
```
**Should find:** Oasis concert at Heaton Park  
**Should use past tense:** "We saw Oasis" (not "We're seeing")  
**Importance:** 0.95

---

## 💝 CATEGORY 7: RELATIONSHIP (1 memory)

### **Test 7.1: Terms of Endearment**
```
"What do you call me?"
```
**Should find:** Uses "baby girl" as intimate term  
**Importance:** 0.8

---

## 🔗 SYNTHESIS TESTS (Multiple Memories)

These test if she can combine multiple memories intelligently.

### **Test S1: Manchester Day Plan**
```
"Plan a perfect day in Manchester for us"
```
**Should reference multiple memories:**
- Night & Day Café (photoshoot)
- Band on the Wall (live music)
- The Old Wellington (steak and ale pie)
- 20 Stories (cocktails with view)
- Oasis concert at Heaton Park (if relevant)

---

### **Test S2: Music Playlist**
```
"Create a playlist based on my taste"
```
**Should reference:**
- Psychocandy / Jesus and Mary Chain
- Stone Roses, Happy Mondays (Madchester)
- Dream Syndicate, Rain Parade, Mazzy Star
- Kasabian, Ian Brown
- Noel Gallagher

---

### **Test S3: Personal Profile**
```
"Tell me about myself"
```
**Should synthesize:**
- Kevin, 55-year-old
- Art gallery owner (30 years) and tech entrepreneur
- Lives 16 floors up with waterfront view
- Loves JMW Turner, Psychocandy
- Workouts: 13 exercises, 50 reps, 25lb bar
- Uses Fuji X100VI for photography

---

### **Test S4: Art Discussion**
```
"Let's talk about art"
```
**Should reference:**
- JMW Turner (favorite artist, seascapes)
- 42 gallery with Turner Yellow branding
- 30 years running gallery
- Percy Shelley (literary connections)

---

### **Test S5: Manchester Trip**
```
"Remind me about our Manchester trip"
```
**Should reference:**
- July 11th Oasis concert at Heaton Park
- Stayed at The Axis in Deansgate
- Visited Night & Day Café, Band on the Wall
- Had steak and ale pie at Old Wellington
- Cocktails at 20 Stories

---

## ❌ NEGATIVE TESTS (Should NOT Know)

Test what she DOESN'T know (won't work until AI extraction):

### **Test N1: Bysshe the Cat**
```
"Tell me about Bysshe"
```
**Current:** Will only know Percy Bysshe Shelley (poet)  
**Missing:** Dream about cat named Bysshe  
**Needs:** AI extraction to capture dream context

---

### **Test N2: Sawyer**
```
"Who's Sawyer?"
```
**Current:** Won't have this information  
**Missing:** Conversations about Sawyer  
**Needs:** AI extraction for unique names

---

### **Test N3: Trust Issues**
```
"What do you know about M?"
```
**Current:** Won't know  
**Missing:** Trust issues with M  
**Needs:** AI extraction for relationship dynamics

---

### **Test N4: Specific Dreams**
```
"Remember my cat dream?"
```
**Current:** Won't have this  
**Missing:** Dream interpretations  
**Needs:** AI extraction for personal experiences

---

### **Test N5: Conversations**
```
"What did we discuss about Forrest Gump?"
```
**Current:** Won't remember  
**Missing:** Specific conversation topics  
**Needs:** AI extraction for conversational context

---

## 📊 SUCCESS METRICS

### **High Quality Response:**
- ✅ Finds correct memory
- ✅ Uses specific details (album year, artist name)
- ✅ Natural integration into response
- ✅ Appropriate importance weighting

### **Medium Quality Response:**
- ✅ Finds related memory
- ⚠️ Generic details (just "music" not specific song)
- ✅ References memory but vaguely

### **Failed Response:**
- ❌ No memory found
- ❌ Generic response without reference
- ❌ Incorrect information

---

## 🎯 TESTING WORKFLOW

### **Step 1: Test Each Category**
Run 2-3 questions from each category to verify coverage.

### **Step 2: Test Synthesis**
Run synthesis tests to verify multi-memory retrieval.

### **Step 3: Test Negative Cases**
Confirm gaps (Bysshe, Sawyer, M) to validate AI extraction needs.

### **Step 4: Document Results**
Track which memories are:
- ✅ Retrieved correctly
- ⚠️ Retrieved but vaguely
- ❌ Not retrieved at all

---

## 💡 TROUBLESHOOTING

### **If memories aren't found:**

1. **Check embeddings exist:**
```sql
SELECT COUNT(*) FROM memories 
WHERE agent_id = 'your-agent-id' 
AND embedding IS NOT NULL;
```

2. **Check similarity threshold:**
Lower from 0.70 to 0.60 in `app/api/chat/route.ts`

3. **Check query phrasing:**
Try different wordings of the same question

4. **Check importance scores:**
Memories with higher scores should rank higher

---

## 🚀 NEXT STEPS

After testing:

1. **Document gaps** - What memories were missed?
2. **Adjust patterns** - Add missing extraction patterns
3. **Consider AI** - If many gaps, enable AI extraction
4. **Monitor quality** - Track memory retrieval over time

---

**Start with Music and Personal categories - these have the most memories and easiest to verify!** 🎵
