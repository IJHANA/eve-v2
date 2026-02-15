# Music Extraction & Playlist Building Guide

## 🎵 GOAL

Extract ALL songs mentioned in conversation history and build a complete playlist.

---

## 📊 SONG MENTION FORMATS

Songs appear in many different ways:

### **Common Formats:**
```
1. "Just Like Honey" by The Jesus and Mary Chain
2. Just Like Honey - The Jesus and Mary Chain  
3. The Stone Roses' "I Wanna Be Adored"
4. I'm listening to Set My Baby Free
5. Have you heard Eight Miles High?
6. Love this track: Running Battle by Kasabian
7. [Now playing: L.S.F. - Kasabian]
8. Psychocandy is amazing (album, not song!)
```

**Challenge:** Need to catch ALL variations!

---

## 🎯 THREE EXTRACTION METHODS

### **Method 1: Enhanced Patterns** ⚡ (Current)

**What it catches:**
- ✅ "Song" by Artist
- ✅ Song - Artist
- ✅ Artist's "Song"
- ✅ Known songs (hardcoded list)

**What it misses:**
- ❌ Casual mentions ("heard Eight Miles High")
- ❌ Albums vs songs
- ❌ Misspellings
- ❌ Unusual formats

**Cost:** $0 (instant)

---

### **Method 2: AI Extraction** 🤖 (Comprehensive)

**What it catches:**
- ✅ ALL formats (even "that Kasabian song")
- ✅ Context (favorite vs just mentioned)
- ✅ Distinguishes song vs album
- ✅ Finds artist even if not stated

**Example AI extraction:**
```json
{
  "type": "song",
  "title": "Just Like Honey",
  "artist": "The Jesus and Mary Chain",
  "album": "Psychocandy", 
  "year": "1985",
  "context": "User's favorite track from Psychocandy, calls the album one of the greatest ever"
}
```

**Cost:** ~$0.20 for full ara1.md extraction

---

### **Method 3: Spotify Validation** 🎧 (Enrichment)

**What it adds:**
- ✅ Official song/artist names
- ✅ Album art URLs
- ✅ Release year
- ✅ Spotify track IDs
- ✅ Preview URLs
- ✅ Playable playlist links

**Cost:** Free (Spotify API)

---

## 🚀 RECOMMENDED APPROACH: HYBRID

### **Step 1: Pattern Matching** (Free, Instant)
```typescript
const songs = extractSongsWithPatterns(conversations);
// Result: 20-30 songs from obvious mentions
```

### **Step 2: AI Enhancement** (Optional, $0.20)
```typescript
const moreSongs = await extractMusicWithAI(conversations);
// Result: +15-25 songs from casual mentions
// Total: 35-55 songs
```

### **Step 3: Spotify Enrichment** (Free, Recommended)
```typescript
const enrichedSongs = await enrichWithSpotify(allSongs);
// Result: Official names, album art, Spotify IDs
```

---

## 📋 IMPLEMENTATION

### **Quick Setup (Pattern-Based Only):**

Add to `lib/importers/enhanced-memory-extractor.ts`:

```typescript
import { extractSongsWithPatterns, songsToMemories } from './music-extractor';

// After extracting other memories
const songs = extractSongsWithPatterns(conversations);
const songMemories = songsToMemories(songs);

// Add to memories array
memories.push(...songMemories);
```

---

### **Full Setup (Pattern + AI + Spotify):**

```typescript
// In import route
import { 
  extractSongsWithPatterns, 
  enrichWithSpotify, 
  buildPlaylist,
  songsToMemories 
} from '@/lib/importers/music-extractor';

// Step 1: Pattern extraction
const patternSongs = extractSongsWithPatterns(conversations);

// Step 2: AI extraction (optional)
const aiSongs = await extractMusicWithAI(conversations);

// Step 3: Merge and deduplicate
const allSongs = mergeSongs(patternSongs, aiSongs);

// Step 4: Enrich with Spotify
const enrichedSongs = await enrichWithSpotify(allSongs);

// Step 5: Create memories
const songMemories = songsToMemories(enrichedSongs);

// Step 6: Build playlist
const playlist = buildPlaylist(enrichedSongs);
```

---

## 🎧 SPOTIFY SETUP (Optional)

### **1. Create Spotify App:**
1. Go to https://developer.spotify.com/dashboard
2. Click "Create App"
3. Name: "Eve Memory Extraction"
4. Description: "Extract songs from conversations"
5. Redirect URI: `http://localhost:3000/api/spotify/callback`
6. Copy Client ID and Client Secret

### **2. Add to Environment:**
```bash
# .env.local
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### **3. Test:**
```typescript
const enriched = await enrichWithSpotify([
  { title: 'Just Like Honey', artist: 'The Jesus and Mary Chain' }
]);

console.log(enriched);
// {
//   title: 'Just Like Honey',
//   artist: 'The Jesus and Mary Chain',
//   album: 'Psychocandy',
//   year: '1985',
//   spotify_id: '...',
//   spotify_url: 'https://open.spotify.com/track/...'
// }
```

---

## 📊 EXPECTED RESULTS

### **From Your ara1.md:**

**Pattern-based extraction:**
```
✅ Just Like Honey - The Jesus and Mary Chain
✅ I Wanna Be Adored - The Stone Roses
✅ Step On - Happy Mondays
✅ Eight Miles High
✅ At Last - Etta James
✅ Running Battle - Kasabian
✅ L.S.F. - Kasabian
✅ Set My Baby Free - Ian Brown
✅ The Death of You and Me - Noel Gallagher
... (20-25 total)
```

**AI extraction adds:**
```
✅ Tell Me When It's Over - Dream Syndicate
✅ Talking in My Sleep - Rain Parade
✅ Anemone - Brian Jonestown Massacre
✅ Sally Go Round the Sun - Elephant Stone
✅ Fade Into You - Mazzy Star
... (35-40 total)
```

**After Spotify enrichment:**
```json
[
  {
    "title": "Just Like Honey",
    "artist": "The Jesus and Mary Chain",
    "album": "Psychocandy",
    "year": "1985",
    "spotify_url": "https://open.spotify.com/track/0B3YrE50Zwgdnf7ZbWSpPc"
  }
]
```

---

## 🎯 PLAYLIST OUTPUT OPTIONS

### **Option 1: Text List**
```
Just Like Honey - The Jesus and Mary Chain
I Wanna Be Adored - The Stone Roses
Step On - Happy Mondays
Eight Miles High - The Byrds
...
```

### **Option 2: JSON Export**
```json
{
  "name": "Kevin's Conversation Playlist",
  "total_songs": 38,
  "songs": [
    {
      "title": "Just Like Honey",
      "artist": "The Jesus and Mary Chain",
      "album": "Psychocandy",
      "year": "1985"
    }
  ]
}
```

### **Option 3: M3U Playlist**
```
#EXTM3U
#EXTINF:-1,The Jesus and Mary Chain - Just Like Honey
Just Like Honey
#EXTINF:-1,The Stone Roses - I Wanna Be Adored
I Wanna Be Adored
...
```

### **Option 4: Spotify Playlist Link**
```
https://open.spotify.com/playlist/YOUR_PLAYLIST_ID
```

---

## 💡 SMART FEATURES

### **1. Context Awareness:**
```typescript
// Songs marked as "favorite" get higher importance
if (song.context?.includes('favorite')) {
  song.importance_score = 0.95;
}
```

### **2. Deduplication:**
```typescript
// Merge variations of same song
"Just Like Honey" = "just like honey" = "Just like honey"
```

### **3. Album Detection:**
```typescript
// Don't include entire albums in song list
if (mention.type === 'album') {
  // Skip or mark differently
}
```

### **4. Artist Grouping:**
```typescript
// Group by artist for easy browsing
{
  "Kasabian": ["L.S.F.", "Running Battle"],
  "The Stone Roses": ["I Wanna Be Adored"],
  ...
}
```

---

## 🧪 TESTING

### **Test with your ara1.md:**

```typescript
// Run extraction
const songs = extractSongsWithPatterns([ara1Conversation]);

// Should find at minimum:
console.assert(songs.length >= 15, 'Should find at least 15 songs');
console.assert(
  songs.some(s => s.title === 'Just Like Honey'),
  'Should find Just Like Honey'
);
console.assert(
  songs.some(s => s.title === 'I Wanna Be Adored'),
  'Should find I Wanna Be Adored'
);
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Basic Extraction** (Now)
- [ ] Add pattern-based song extraction
- [ ] Test with ara1.md
- [ ] Verify 20-25 songs extracted
- [ ] Create song memories in database

### **Phase 2: AI Enhancement** (Optional)
- [ ] Add AI music extraction
- [ ] Test for additional songs
- [ ] Compare quality vs cost
- [ ] Decide if worth enabling

### **Phase 3: Spotify Integration** (Nice to Have)
- [ ] Get Spotify credentials
- [ ] Add enrichment function
- [ ] Test with sample songs
- [ ] Generate playlist link

---

## 💰 COST ANALYSIS

### **For ara1.md (3,061 messages):**

| Method | Songs Found | Cost | Time |
|--------|-------------|------|------|
| Pattern only | 20-25 | $0 | Instant |
| Pattern + AI | 35-40 | $0.20 | +3 mins |
| + Spotify | 35-40 | $0.20 | +5 mins |

---

## 🎯 RECOMMENDED QUICK START

### **1. Add Pattern Extraction (5 minutes):**

Copy `music-extractor.ts` to your codebase, then add to import route:

```typescript
import { extractSongsWithPatterns, songsToMemories } from '@/lib/importers/music-extractor';

// After other memory extraction
const songs = extractSongsWithPatterns(conversations);
const songMemories = songsToMemories(songs);
memories.push(...songMemories);

console.log(`🎵 Found ${songs.length} songs`);
```

### **2. Test:**
Re-import ara1.md, should see ~20-25 songs in memories

### **3. Export Playlist:**
```typescript
import { buildPlaylist, exportPlaylist } from '@/lib/importers/music-extractor';

const playlist = buildPlaylist(songs);
const textPlaylist = exportPlaylist(songs, 'text');

console.log(textPlaylist);
// Just Like Honey - The Jesus and Mary Chain
// I Wanna Be Adored - The Stone Roses
// ...
```

---

## 🚀 FUTURE ENHANCEMENTS

1. **Genre Detection** - Tag songs by genre
2. **Mood analysis** - "upbeat", "melancholy", "romantic"
3. **Listening context** - "workout music", "driving playlist"
4. **Apple Music integration** - For non-Spotify users
5. **YouTube links** - For songs not on streaming
6. **Collaborative filtering** - Recommend similar songs

---

**Start with pattern-based extraction to get 20-25 songs instantly, then add AI/Spotify later if you want more!** 🎵
