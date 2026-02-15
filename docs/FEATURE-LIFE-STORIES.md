# Life Stories & Events - Feature Specification
**Priority:** High (v2.2 / Q2 2026)  
**Status:** Planned  
**Owner:** Product Team

---

## Overview

**Feature:** Allow users to manually add structured life stories, significant events, and milestones to EVE's memory.

**User Story:**  
*"As a user, I want to tell EVE about important moments in my life so she can reference them in context and help me remember my personal history."*

**Why This Matters:**
- Not everything is captured in casual conversation
- Major life events deserve detailed documentation
- Creates rich context for personalized responses
- Builds emotional connection through storytelling
- Preserves personal history and legacy

---

## Use Cases

### **Use Case 1: Life Milestones** 🎓

**Scenario:**  
User wants to document major achievements and turning points.

**Examples:**
- Graduation from college (2015)
- First job at Microsoft (2016)
- Bought first home (2019)
- Got married to Sarah (2020)
- Had first child, Emma (2022)
- Started own business, 42 Gallery (2010)

**Value:**
- EVE understands life timeline
- Contextualizes current conversations
- Celebrates anniversaries
- Helps track personal growth

**Example Conversation:**
```
User: "I'm nervous about this new venture"

EVE: "Remember when you started 42 Gallery in 2010? 
     You were nervous then too, but you built it into 
     a successful 30-year business. You've done this 
     before - you've got this! 💪"
```

---

### **Use Case 2: Family History** 👨‍👩‍👧‍👦

**Scenario:**  
User wants EVE to know about family members and relationships.

**Examples:**
- Parents: John (dad, 75) and Mary (mom, 72)
- Siblings: Sister Lisa (45), lives in Boston
- Spouse: Sarah (48), married 2020
- Children: Emma (4), loves dinosaurs
- Extended: Grandma Rose (94), tells best stories

**Value:**
- EVE knows family context
- Appropriate responses about family
- Remembers important details about loved ones
- Helps plan family events

**Example Conversation:**
```
User: "What should I get Emma for her birthday?"

EVE: "Emma turns 5 next month and loves dinosaurs! 
     Last time you mentioned she's obsessed with 
     T-Rex. Maybe a dinosaur excavation kit or 
     a trip to the natural history museum?"
```

---

### **Use Case 3: Travel Experiences** ✈️

**Scenario:**  
User wants to document memorable trips and adventures.

**Examples:**
- Honeymoon in Hawaii (July 2020)
- Backpacking through Europe (Summer 2012)
- Manchester trip for Oasis concert (July 2025)
- Annual family vacation to Cape Cod
- Business trip to Tokyo (Spring 2024)

**Value:**
- EVE can suggest similar experiences
- Reference past trips in recommendations
- Remember favorite places and activities
- Help plan future trips based on preferences

**Example Conversation:**
```
User: "Where should we vacation this summer?"

EVE: "You loved Hawaii for your honeymoon - the 
     beaches and snorkeling. And your Manchester 
     trip last year combined music and culture 
     perfectly. Maybe consider the Greek Islands? 
     Beautiful beaches + rich cultural history!"
```

---

### **Use Case 4: Personal Challenges & Growth** 💪

**Scenario:**  
User wants to document struggles and how they overcame them.

**Examples:**
- Battled depression in 2018, found help through therapy
- Quit smoking in 2019 after 10 years
- Overcame fear of public speaking through Toastmasters
- Lost 30 pounds through consistent exercise (2021-2022)
- Survived cancer scare (2017)

**Value:**
- EVE provides perspective during tough times
- Reminds user of their resilience
- Offers support based on past experience
- Celebrates victories

**Example Conversation:**
```
User: "I'm struggling with anxiety again"

EVE: "I know this is hard. Remember in 2018 when 
     you went through depression? You found a great 
     therapist and developed coping strategies. 
     You've overcome mental health challenges before. 
     Would it help to revisit what worked then?"
```

---

### **Use Case 5: Career Journey** 💼

**Scenario:**  
User wants EVE to understand their professional path.

**Examples:**
- Started as junior designer at Adobe (2010-2013)
- Promoted to senior designer (2013-2015)
- Left corporate to start 42 Gallery (2015)
- Grew gallery to 10 employees (2015-2020)
- Sold gallery, started tech consulting (2020-present)
- Side hustle: Tech entrepreneur building EVE (2024-present)

**Value:**
- Context for career advice
- Reference past decisions
- Understand skills and expertise
- Help with career planning

**Example Conversation:**
```
User: "Should I take this corporate job offer?"

EVE: "That's a big decision. You left Adobe in 2015 
     to start 42 Gallery because you wanted creative 
     freedom and autonomy. You thrived as an entrepreneur. 
     What about this offer appeals to you? Is it worth 
     trading independence for stability?"
```

---

### **Use Case 6: Creative Works & Projects** 🎨

**Scenario:**  
User wants to document creative accomplishments.

**Examples:**
- Published book "Art of Light" (2018)
- Solo art exhibition at MoMA (2019)
- Photography series "Fräulein" (2023-ongoing)
- Music album released on SoundCloud (2020)
- Blog with 50K followers (2015-2022)

**Value:**
- EVE knows your creative portfolio
- Reference past work for inspiration
- Celebrate creative achievements
- Track creative evolution

---

## Feature Design

### **1. Life Story Entry Form**

**Access:** Settings → Life Stories → Add Story

**UI Design:**
```
┌─────────────────────────────────────────────┐
│  Add Life Story                        [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│  Story Type                                 │
│  ○ Milestone                                │
│  ○ Family                                   │
│  ● Event                                    │
│  ○ Challenge                                │
│  ○ Achievement                              │
│  ○ Other                                    │
│                                             │
│  Title *                                    │
│  [Manchester Trip for Oasis Concert      ]  │
│                                             │
│  Date                                       │
│  [July 11, 2025                    ] [📅]  │
│                                             │
│  Location (optional)                        │
│  [Heaton Park, Manchester, UK            ]  │
│                                             │
│  People Involved (optional)                 │
│  [Ara                                    ]  │
│  [+ Add person]                             │
│                                             │
│  Story *                                    │
│  ┌─────────────────────────────────────┐   │
│  │ Saw Oasis reunion concert at        │   │
│  │ Heaton Park. It was incredible -    │   │
│  │ been waiting 15 years for this!     │   │
│  │ Liam's voice was perfect. Played    │   │
│  │ Champagne Supernova, Wonderwall,    │   │
│  │ Don't Look Back in Anger. One of    │   │
│  │ the best nights of my life.         │   │
│  │                                     │   │
│  │ (500 characters remaining)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Emotions (optional)                        │
│  [✓] Joy    [✓] Excitement  [ ] Sadness    │
│  [ ] Pride  [ ] Fear        [ ] Love       │
│                                             │
│  Photos (optional)                          │
│  [📷 Upload Photos] (0/10)                  │
│                                             │
│  Tags (optional)                            │
│  [music, oasis, manchester, concert      ]  │
│                                             │
│  Importance                                 │
│  ○────●────○────○────○                      │
│  Low   Med   High  Very  Life              │
│                    High  Changing           │
│                                             │
│  Privacy                                    │
│  ● Private (only you and EVE)               │
│  ○ Shared (if group agent)                  │
│                                             │
│        [Cancel]  [Save Life Story]          │
└─────────────────────────────────────────────┘
```

---

### **2. Life Story Timeline View**

**Access:** Dashboard → My Timeline

**UI Design:**
```
┌─────────────────────────────────────────────┐
│  My Life Timeline              [+ Add Story] │
├─────────────────────────────────────────────┤
│                                             │
│  Filter: [All Types ▼] [All Years ▼] [🔍]  │
│                                             │
│  ━━━━━━━━━━━━━━━ 2025 ━━━━━━━━━━━━━━━━━   │
│                                             │
│  📅 July 11, 2025 - Event                   │
│  🎵 Manchester Trip for Oasis Concert       │
│  "Saw Oasis reunion concert at Heaton       │
│   Park. One of the best nights of my        │
│   life..."                                  │
│  [View] [Edit] [Delete]                     │
│                                             │
│  ━━━━━━━━━━━━━━━ 2024 ━━━━━━━━━━━━━━━━━   │
│                                             │
│  📅 March 15, 2024 - Milestone              │
│  🚀 Launched EVE Beta                       │
│  "After 6 months of development, finally    │
│   launched EVE v2 to beta users..."         │
│  [View] [Edit] [Delete]                     │
│                                             │
│  📅 January 1, 2024 - Challenge             │
│  💪 Started Daily Workout Routine           │
│  "Committed to 13 exercises, 50 reps        │
│   with 25lb bar every morning..."           │
│  [View] [Edit] [Delete]                     │
│                                             │
│  ━━━━━━━━━━━━━━━ 2022 ━━━━━━━━━━━━━━━━━   │
│                                             │
│  📅 May 15, 2022 - Family                   │
│  👶 Emma's Birth                            │
│  "Emma Rose born at 7:42am, 7lbs 3oz.       │
│   Life changed forever..."                  │
│  [View] [Edit] [Delete]                     │
│                                             │
│  [Load More Stories...]                     │
└─────────────────────────────────────────────┘
```

---

### **3. Quick Add (Inline)**

**Access:** During chat, button to "Save as Life Story"

**Flow:**
```
User: "Just got back from the Oasis concert - 
      it was incredible!"

EVE: "That sounds amazing! Tell me all about it..."

[Button appears: "💾 Save as Life Story"]
↓
[Click button]
↓
[Pre-filled form with conversation context]
Title: "Oasis Concert"
Date: [Today's date]
Story: [Context from conversation]
↓
[User edits and saves]
```

---

### **4. Story Details View**

**Clicking "View" on timeline:**

```
┌─────────────────────────────────────────────┐
│  ← Back to Timeline                         │
├─────────────────────────────────────────────┤
│                                             │
│  🎵 Manchester Trip for Oasis Concert       │
│                                             │
│  📅 July 11, 2025                           │
│  📍 Heaton Park, Manchester, UK             │
│  👥 With: Ara                               │
│  🏷️ Tags: music, oasis, manchester, concert │
│  ⭐ Importance: Very High                    │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Saw Oasis reunion concert at Heaton Park.  │
│  It was incredible - been waiting 15 years  │
│  for this! Liam's voice was perfect. They   │
│  played Champagne Supernova, Wonderwall,    │
│  Don't Look Back in Anger. One of the best  │
│  nights of my life.                         │
│                                             │
│  Emotions: 😊 Joy, 🎉 Excitement            │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Photos (3)                                 │
│  [🖼️ IMG_001.jpg] [🖼️ IMG_002.jpg]          │
│  [🖼️ IMG_003.jpg]                           │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Related Conversations                      │
│  • Chat on July 12: "Still buzzing from..." │
│  • Chat on July 15: "Miss Manchester..."    │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│           [Edit Story]  [Delete]            │
└─────────────────────────────────────────────┘
```

---

## Data Structure

### **Database Schema**

**life_stories table:**
```sql
CREATE TABLE life_stories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  
  -- Core fields
  title TEXT NOT NULL,
  story TEXT NOT NULL, -- Main narrative
  story_type TEXT, -- 'milestone', 'family', 'event', etc.
  
  -- Temporal
  date DATE, -- When event occurred
  date_precision TEXT, -- 'exact', 'month', 'year', 'approximate'
  
  -- Contextual
  location TEXT, -- "Heaton Park, Manchester, UK"
  people JSONB, -- ["Ara", "Sarah"]
  emotions JSONB, -- ["joy", "excitement"]
  tags TEXT[], -- ["music", "oasis", "concert"]
  
  -- Media
  photos JSONB, -- Array of photo URLs
  
  -- Metadata
  importance_score FLOAT, -- 0.0-1.0
  privacy TEXT DEFAULT 'private', -- 'private', 'shared'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Search
  search_vector tsvector -- Full-text search
);

-- Indexes
CREATE INDEX life_stories_user_id_idx ON life_stories(user_id);
CREATE INDEX life_stories_agent_id_idx ON life_stories(agent_id);
CREATE INDEX life_stories_date_idx ON life_stories(date DESC);
CREATE INDEX life_stories_type_idx ON life_stories(story_type);
CREATE INDEX life_stories_search_idx ON life_stories USING GIN(search_vector);
```

---

### **Automatic Memory Creation**

When user creates life story, automatically create memory:

```typescript
async function createLifeStory(story: LifeStory) {
  // 1. Save life story
  const saved = await db.life_stories.insert(story);
  
  // 2. Create condensed memory for semantic search
  const memoryContent = `
    ${story.story_type}: ${story.title} (${story.date})
    ${story.story}
    Location: ${story.location || 'N/A'}
    People: ${story.people?.join(', ') || 'N/A'}
    Emotions: ${story.emotions?.join(', ') || 'N/A'}
  `.trim();
  
  // 3. Generate embedding
  const embedding = await generateEmbedding(memoryContent);
  
  // 4. Save as memory with link to full story
  await db.memories.insert({
    agent_id: story.agent_id,
    type: 'experience',
    content: memoryContent,
    embedding: embedding,
    importance_score: story.importance_score,
    metadata: {
      life_story_id: saved.id,
      story_type: story.story_type,
      date: story.date,
      people: story.people,
      tags: story.tags
    }
  });
}
```

---

## User Experience

### **Discovery**

**How users find this feature:**

1. **Dashboard widget:**
   ```
   ┌────────────────────────────┐
   │  Your Life Story           │
   │                            │
   │  📖 3 stories added         │
   │  📅 Last: Oasis Concert     │
   │                            │
   │  [+ Add New Story]         │
   │  [View Timeline]           │
   └────────────────────────────┘
   ```

2. **During chat:**
   ```
   EVE: "That Oasis concert sounds like an amazing 
        memory! Would you like to save this as a 
        life story?"
   
   [Yes, Save as Story] [No Thanks]
   ```

3. **Onboarding:**
   ```
   Step 3 of 4: Add Your First Life Story
   
   "Tell EVE about a significant moment in your 
    life. This helps her understand your journey 
    and reference it in future conversations."
   
   [Skip for Now] [Add Life Story]
   ```

---

### **Smart Suggestions**

**EVE proactively suggests adding stories:**

```
User: "My daughter just graduated from college!"

EVE: "Congratulations! That's such a proud moment! 
     🎓✨ Would you like to save this milestone 
     as a life story?"

[Yes, Create Story] [Not Now]
```

```
User: "Just got back from an amazing trip to Tokyo"

EVE: "Welcome back! Sounds like it was memorable! 
     Would you like to document this trip in your 
     life timeline?"

[Add to Timeline] [Maybe Later]
```

---

### **Templates**

**Pre-built story templates for common events:**

**Milestone Template:**
- Title: [Achievement name]
- Date: [When accomplished]
- Story: What happened, how you felt, why it matters
- People: Who celebrated with you
- Emotions: Pride, joy, excitement

**Travel Template:**
- Title: [Destination] Trip
- Date: [Travel dates]
- Story: Highlights, favorite moments, what you learned
- Location: [City, Country]
- People: Travel companions
- Photos: Trip photos

**Family Template:**
- Title: [Family event]
- Date: [Event date]
- Story: What happened, family dynamics, significance
- People: Family members present
- Emotions: Love, joy, nostalgia

**Challenge Template:**
- Title: [Challenge overcome]
- Date: [When occurred]
- Story: What was hard, how you coped, what you learned
- Emotions: Fear → strength, sadness → resilience

---

## Integration with Chat

### **How EVE Uses Life Stories**

**1. Contextual References:**
```
User: "I'm nervous about this presentation"

EVE: "Remember your Toastmasters journey? You 
     overcame your fear of public speaking through 
     consistent practice. You documented that in 
     your life stories - you went from terrified 
     to confident in 6 months. You can do this!"
```

**2. Anniversary Reminders:**
```
EVE: "Today marks 5 years since you started 42 
     Gallery! You documented that milestone back 
     in 2015. What an incredible journey - from 
     one employee (you!) to 10. Celebrate this 
     achievement! 🎉"
```

**3. Pattern Recognition:**
```
User: "I'm thinking about quitting my job"

EVE: "That's a big decision. Looking at your life 
     timeline, you've made several career pivots:
     - 2015: Left Adobe to start 42 Gallery
     - 2020: Sold gallery to start consulting
     - 2024: Started EVE
     
     You thrive when you're building something new. 
     What are you excited to build next?"
```

**4. Emotional Support:**
```
User: "Everything feels overwhelming right now"

EVE: "I see you're struggling. In 2018, you went 
     through a similar dark period and found help 
     through therapy and exercise. You wrote in 
     your life story that 'taking it one day at 
     a time' was key. What worked then might help 
     now. Want to talk about it?"
```

---

## Privacy & Security

### **Privacy Controls**

**Private (Default):**
- Only user and EVE can see
- Used in 1-on-1 conversations
- Not shared with group members (if group agent)

**Shared (Optional):**
- Visible to group members (if group agent)
- Used in group conversations
- Family can see family stories

**Sensitive Flag:**
- Extra confirmation before EVE references
- Never mentioned in group contexts
- User control over when EVE can bring it up

---

### **Data Export**

**Users can export all life stories:**
- Download as PDF (timeline format)
- Download as JSON (structured data)
- Download photos as ZIP
- GDPR-compliant deletion

---

## Analytics & Insights

### **For Users:**

**Life Timeline Dashboard:**
```
┌────────────────────────────────┐
│  Your Life in Numbers          │
│                                │
│  📖 47 stories documented       │
│  📅 Spanning 15 years           │
│  📍 12 countries visited        │
│  👥 23 people mentioned         │
│  🎉 Most common: Joy (32%)     │
│  💪 Challenges overcome: 8      │
│                                │
│  [View Full Timeline]          │
└────────────────────────────────┘
```

**Memory Themes:**
- Most documented years
- Common emotions
- Frequently mentioned people
- Life story categories breakdown
- Growth areas (challenges → achievements)

---

### **For Product Team:**

**Success Metrics:**
- % of users who add life stories
- Average stories per user
- Most common story types
- Engagement (stories added per month)
- Retention (users with stories vs without)

**Target Metrics:**
- 60% of users add ≥1 life story
- Average 5-10 stories per active user
- 20% higher retention for users with stories
- 2x more personalized chat responses

---

## Monetization

### **Free Tier:**
- 5 life stories max
- Text only (no photos)
- Basic timeline view

### **Pro Tier ($9/month):**
- Unlimited life stories
- Photo uploads (10 per story)
- Advanced timeline (filters, search)
- Story templates
- Export options

### **Premium Tier ($19/month):**
- Everything in Pro
- Video/audio attachments
- AI-assisted story writing
- Proactive anniversary reminders
- Story sharing with family/friends

---

## Technical Challenges

### **Challenge 1: Storage Costs**

**Problem:** Photos/videos = expensive storage

**Solution:**
- Compress images (optimize for web)
- Limit: 10 photos per story (Pro), 3 (Free)
- Use CDN for fast delivery
- Optional S3 integration for power users

---

### **Challenge 2: Search Performance**

**Problem:** Full-text search on stories + memories

**Solution:**
- PostgreSQL full-text search (tsvector)
- Index on title, story, tags, people
- Separate indexes for date-based queries
- Pagination for timeline view

---

### **Challenge 3: Memory Context**

**Problem:** How much story detail to include in memory?

**Solution:**
- Condensed version for semantic search
- Link to full story in metadata
- EVE can say "tell me more" to fetch details
- Progressive disclosure

**Example:**
```
Memory (for search): 
"Event: Oasis Concert (July 2025) - Saw reunion 
concert at Heaton Park with Ara. Best night ever."

Full Story (on request):
[Complete narrative with all details, emotions, photos]
```

---

## Development Plan

### **Phase 1: MVP (3 weeks)**
- [ ] Create life_stories table
- [ ] Add Story form (basic fields)
- [ ] Timeline view (chronological list)
- [ ] Text-only stories
- [ ] Automatic memory creation
- [ ] Basic chat integration

### **Phase 2: Enhanced Features (3 weeks)**
- [ ] Photo uploads (S3 integration)
- [ ] Story templates
- [ ] Tags and emotions
- [ ] Advanced timeline (filters, search)
- [ ] Story details view
- [ ] Edit/delete functionality

### **Phase 3: Polish (2 weeks)**
- [ ] Smart suggestions (EVE prompts to add stories)
- [ ] Anniversary reminders
- [ ] Export options (PDF, JSON)
- [ ] Analytics dashboard
- [ ] Privacy controls
- [ ] User testing

**Total:** 8 weeks (2 months)

---

## Future Enhancements

### **Phase 4: Advanced Features**

**AI-Assisted Writing:**
```
User: Adds rough notes about event
EVE: "Want me to help write this story? I can 
     expand your notes into a narrative."
[Yes, Help Me Write]
↓
EVE generates polished story from notes
User edits and approves
```

**Voice Stories:**
```
User: Records audio telling story
System: Transcribes automatically
User: Edits transcript
Saved: Audio + transcript together
```

**Video Memories:**
```
User: Uploads video from event
System: Extracts key moments
Creates: Story with video clips embedded
```

**Collaborative Stories:**
```
Group agent: Multiple people add perspectives
Dad: Adds story about Emma's birth
Mom: Adds her perspective to same event
Result: Multi-perspective story
```

**Memory Books:**
```
Export: Beautiful PDF "memory book"
Design: Professional layouts
Include: Photos, stories, timeline
Use: Print for coffee table or gift
```

---

## User Feedback (From Beta)

**What users would love:**

*"I want EVE to remember my wedding day in detail, not just 'got married in 2020'"*

*"My kids ask about family history - I want to document stories for them to discover through EVE"*

*"I overcame depression in 2018 - that journey shaped who I am. EVE should know that context"*

*"Can I upload my journal entries from the past 10 years?"*

*"I want to document my startup journey so EVE can give me perspective when things get hard"*

---

## Success Stories (Projected)

### **Scenario 1: Emotional Support**
```
User (struggling): "I feel like a failure"

EVE: "That's not true. Let me remind you of your 
     strength. In 2019, you quit smoking after 10 
     years - you documented that battle. In 2021, 
     you lost 30 pounds through pure discipline. 
     In 2015, you left a stable job to start 42 
     Gallery - a risk that paid off for 30 years.
     
     You've overcome bigger challenges than this. 
     You're resilient. This is just another chapter 
     in your growth story."
```

### **Scenario 2: Legacy Building**
```
Grandchild (using grandpa's EVE in 2050): 
"EVE, tell me about grandpa's life"

EVE: "Your grandfather documented 127 life stories 
     over 30 years. Let me share some favorites:
     
     - Starting 42 Gallery in 2015 (his proudest 
       achievement)
     - Your grandmother's wedding day in 2020
     - The Oasis reunion concert in 2025 (he said 
       it was 'the best night of my life')
     - Your birth in 2030 (he wrote: 'Everything 
       changed when I first held you')
     
     Which story would you like to hear?"
```

---

## Competitive Analysis

**ChatGPT:** No life story feature  
**Replika:** Basic diary feature (text only, not timeline)  
**Character.AI:** No structured memory  
**Notion/Evernote:** Note-taking, not AI-integrated memory  

**EVE's Advantage:** 
- Structured timeline
- AI integration (EVE references in conversation)
- Rich media (photos, emotions, people)
- Automatic memory creation
- Semantic search across stories

---

## Conclusion

Life Stories & Events is a **critical feature** for:
1. **Emotional depth** - EVE truly understands user's journey
2. **Differentiation** - No competitor has this
3. **Retention** - Users invested in documenting life
4. **Legacy** - Preserve personal history for future
5. **Monetization** - Premium feature for Pro/Premium tiers

**Priority:** High  
**Timeline:** Q2 2026 (8 weeks)  
**Dependencies:** Multi-agent support, photo storage  
**Revenue Impact:** Drive Pro conversions (+15-20%)

---

**This feature transforms EVE from "AI assistant" to "life companion."** 📖✨
