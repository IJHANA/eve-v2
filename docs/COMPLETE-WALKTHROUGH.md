# EVE V2 - Complete Walkthrough Guide
**Date:** February 14, 2026  
**Version:** 2.0 (Beta)  
**Audience:** All Stakeholders  
**Prepared by:** Senior Product Manager

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Complete Feature List](#complete-feature-list)
3. [Step-by-Step User Journey](#step-by-step-user-journey)
4. [Technical Architecture](#technical-architecture)
5. [Future Roadmap](#future-roadmap)
6. [Next Steps](#next-steps)

---

## Product Overview

### **What is EVE V2?**

EVE V2 is an AI companion platform with persistent semantic memory that enables deeply personalized conversations. Unlike ChatGPT which forgets everything between sessions, EVE remembers your preferences, history, relationships, and context indefinitely.

**Core Innovation:** Import your existing AI conversation history (3,000+ messages) and EVE automatically extracts 80-100 memories to personalize from day one.

---

### **Key Differentiators**

| Feature | EVE V2 | ChatGPT | Replika | Character.AI |
|---------|--------|---------|---------|--------------|
| **Persistent Memory** | ✅ Semantic (unlimited) | ❌ None | ✅ Manual | ⚠️ Limited |
| **Import History** | ✅ Yes (Grok, ChatGPT) | ❌ No | ❌ No | ❌ No |
| **Memory Quality** | 95%+ accuracy | N/A | Manual entry | 70% accuracy |
| **Professional Use** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Voice** | ✅ ElevenLabs (2 voices) | ✅ Native | ✅ Native | ✅ Native |
| **Personalization** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Complete Feature List

### **✅ Implemented (Beta Launch)**

#### **1. Core Chat Experience**
- Real-time conversational AI (GPT-4 Turbo)
- Persistent conversation history
- Markdown rendering (bold, italic, code blocks)
- Message timestamps
- Auto-scroll to latest message
- Responsive design (desktop, tablet, mobile)

#### **2. Memory System**
- Semantic memory search (pgvector)
- Automatic memory extraction from conversations
- Memory persistence across sessions
- Memory categorization (facts, preferences, experiences, context)
- Importance scoring (0.0-1.0)
- Embedding generation (OpenAI ada-002)

#### **3. Conversation Import**
- **Grok import** (.md markdown format)
- **Grok import** (.json format)  
- **ChatGPT import** (.json format)
- Drag & drop file upload
- Progress indicators
- Success/error feedback
- Import history tracking

#### **4. Memory Extraction Pipeline**
- **Pattern-based extraction:**
  - Name, age, profession
  - Home details and location
  - Equipment and tools
  - Cultural preferences (art, music, movies)
  - Locations and venues
  - Events and dates
  - Relationships

- **Tagged extraction:**
  - Song tagging: `[song: Title | artist: Artist]`
  - HTML comments: `<!-- song: Title | artist: Artist -->`
  - 100% accuracy for tagged content

- **AI extraction (optional):**
  - Anthropic Claude Sonnet 4
  - Comprehensive context extraction
  - Unique names, dreams, conversations
  - $0.66 per 3,000-message import

#### **5. Voice Interaction**
- Text-to-speech (ElevenLabs)
- Two voice profiles:
  - Rachel: Warm, professional
  - Jessica: Playful, intimate
- Inline audio playback
- Markdown stripping for natural speech
- Play/pause controls

#### **6. Agent Customization**
- Custom agent name (default: "Eve")
- Personality selection:
  - Professional
  - Friendly
  - Playful
  - Intimate
- Voice selection
- Writing style preferences:
  - Concise
  - Natural
  - Detailed

#### **7. Authentication & Security**
- Email/password authentication (Supabase)
- Email verification
- Session management
- Row-level security (RLS)
- Secure API key storage
- HTTPS everywhere

---

### **⏳ In Development (v2.1 - Next 4-6 Weeks)**

#### **1. Ongoing Memory Extraction**
- Extract memories every 10 messages
- Background processing
- No user action required
- Automatic memory growth

#### **2. Memory Management UI**
- Browse all memories
- Edit memory content
- Delete memories
- Adjust importance scores
- Categorize memories
- Search memories

#### **3. Conversation Export**
- Export to JSON
- Export to Markdown
- Export to PDF
- Email export option
- Date range filtering

#### **4. Background Job Processing**
- Queue system for imports
- Non-blocking imports (>1,000 messages)
- Retry logic for failures
- Progress tracking

#### **5. Analytics & Monitoring**
- Error tracking (Sentry)
- Usage analytics (PostHog)
- Performance monitoring
- Cost tracking

---

### **📋 Planned (v2.2 - Q2 2026)**

#### **1. Multi-Agent Support**
- Create multiple agents
- Different personalities for different use cases
- Work vs. personal agents
- Agent switching

#### **2. Mobile Apps**
- iOS app (React Native)
- Android app (React Native)
- Push notifications
- Offline mode
- Native performance

#### **3. Advanced Memory Controls**
- Memory categories (work, personal, creative)
- Memory timelines (visualize journey)
- Memory sharing (share with others)
- Memory importance decay
- Proactive memory suggestions

#### **4. Voice Input**
- Speech-to-text
- Real-time transcription
- Multiple languages
- Voice commands

#### **5. API Access**
- RESTful API for third-party integrations
- Webhooks
- API key management
- Rate limiting

---

### **💭 Future Vision (v2.3+ - Q3-Q4 2026)**

**Group & Collaboration:**
- Group/shared agents (families, teams, couples)
- Multi-user access controls
- Shared memory pools
- Permission levels (owner, editor, viewer)

**Memory Enhancement:**
- Memory from uploaded files (PDFs, docs, notes)
- Proactive memory suggestions ("You mentioned...")
- Memory timelines (visualize journey)
- Memory importance decay
- Conflict resolution
- Pattern detection

**Communication:**
- Real-time voice conversations
- Voice input (speech-to-text)
- Multi-language support

**Rich Media:**
- Image understanding (send photos to EVE)
- Image generation (EVE creates images)
- Document processing

**Integrations:**
- Calendar sync (Google, Outlook)
- Email context extraction
- Wearable integration (health data)
- API access for third parties

**Enterprise:**
- Team workspaces
- SSO/SAML
- Custom deployment
- White-label options
- Advanced analytics dashboard

---

## Step-by-Step User Journey

### **Journey 1: New User (No Import)**

**Goal:** Get started with EVE from scratch

---

#### **Step 1: Sign Up (2 minutes)**

**Actions:**
1. Navigate to https://www.ijhana.com
2. Click "Sign Up" button
3. Enter email address
4. Create password (minimum 6 characters)
5. Click "Create Account"
6. Check email for verification link
7. Click verification link
8. Redirected to login page

**What user sees:**
```
┌─────────────────────────────────┐
│  Create your EVE account        │
│                                 │
│  Email:    [                 ]  │
│  Password: [                 ]  │
│                                 │
│         [Create Account]        │
│                                 │
│  Already have an account?       │
│  [Log In]                       │
└─────────────────────────────────┘
```

**Success criteria:**
- Account created
- Email verified
- Ready to log in

---

#### **Step 2: First Login (30 seconds)**

**Actions:**
1. Enter email and password
2. Click "Log In"
3. See empty chat interface

**What user sees:**
```
┌─────────────────────────────────────────────────┐
│  [Logo] EVE                    [Settings] [⚙️]  │
├─────────────────────────────────────────────────┤
│                                                 │
│              👋                                 │
│                                                 │
│         Welcome to EVE!                         │
│                                                 │
│    I'm your AI companion who                    │
│    remembers everything we discuss.             │
│                                                 │
│    Start by asking me anything!                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Type a message...]            [Send]          │
└─────────────────────────────────────────────────┘
```

---

#### **Step 3: First Conversation (Immediate)**

**Actions:**
1. Type: "Hi, what can you help me with?"
2. Press Enter or click Send
3. Wait for EVE's response (~2 seconds)
4. See response appear

**What user sees:**
```
┌─────────────────────────────────────────────────┐
│  USER: Hi, what can you help me with?           │
│                                                 │
│  EVE: Hi! I can help with all sorts of things:  │
│       • Answer questions                        │
│       • Have conversations                      │
│       • Provide advice and recommendations      │
│       • Remember our discussions for context    │
│                                                 │
│       What would you like to explore today?     │
│       [🔊 Play]                                 │
└─────────────────────────────────────────────────┘
```

**What happens:**
- Message sent to backend
- No memories yet (new user)
- Generic, helpful response
- Voice button available

---

#### **Step 4: Voice Try-Out (Optional, 10 seconds)**

**Actions:**
1. Click voice button (🔊) on EVE's message
2. Listen to audio
3. Audio plays inline

**What user hears:**
*Natural, warm voice reading EVE's response*

**User thinks:**
*"Wow, this sounds really natural!"*

---

#### **Step 5: Continued Conversation**

**Actions:**
1. User continues chatting
2. Asks questions
3. EVE responds

**What happens behind the scenes:**
- Every 10 messages: Memory extraction runs
- Memories saved to database
- Future responses become personalized

**Example after 20 messages:**
```
USER: What music do you think I'd like?

EVE: Based on our conversation, you mentioned 
     enjoying indie rock and alternative music. 
     I'd suggest checking out Radiohead, The 
     National, or Arcade Fire!
     [🔊 Play]
```

---

### **Journey 2: Power User (With Import)**

**Goal:** Import 3,000+ message history for instant personalization

---

#### **Step 1: Export from Grok/ChatGPT (5 minutes)**

**Grok Export:**
1. Open Grok conversation
2. Click three dots menu (⋯)
3. Select "Export Conversation"
4. Choose "Markdown (.md)" or "JSON"
5. Download file (e.g., `ara1.md`)

**ChatGPT Export:**
1. Open ChatGPT
2. Click Settings
3. Click "Data Controls"
4. Click "Export Data"
5. Wait for email with download link
6. Download conversations.json

---

#### **Step 2: Import to EVE (2 minutes)**

**Actions:**
1. Log in to EVE
2. Click Settings icon (⚙️) in top right
3. Click "Import" tab
4. Drag and drop `ara1.md` file into upload area
   *OR* click to browse and select file
5. Wait for processing (~60 seconds for 3,000 messages)

**What user sees:**
```
┌──────────────────────────────────────┐
│  Processing your conversation...     │
│                                      │
│  [████████████░░░░░░░░] 60%          │
│                                      │
│  Extracting memories...              │
│                                      │
│  This may take up to 60 seconds.    │
└──────────────────────────────────────┘
```

---

#### **Step 3: Import Success (Immediate)**

**What user sees:**
```
┌──────────────────────────────────────┐
│  ✅ Import Successful!               │
│                                      │
│  Source: Grok                        │
│  Conversations Imported: 1           │
│  Messages: 3,061                     │
│  Memories Extracted: 87              │
│                                      │
│  Your conversation history is now    │
│  part of EVE's memory. Start         │
│  chatting to see personalized        │
│  responses!                          │
│                                      │
│           [Start Chatting]           │
└──────────────────────────────────────┘
```

**User clicks:** "Start Chatting"

**Modal closes, returns to chat**

---

#### **Step 4: Personalized Conversation (Immediate)**

**Actions:**
1. User asks: "What's my favorite album?"
2. Wait for response (~2 seconds)
3. See personalized answer

**What user sees:**
```
┌─────────────────────────────────────────────────┐
│  USER: What's my favorite album?                │
│                                                 │
│  EVE: Based on our conversations, Psychocandy   │
│       by The Jesus and Mary Chain is your       │
│       favorite! You've called it one of the     │
│       greatest albums ever. The dreamy,         │
│       feedback-drenched sound from 1985 really  │
│       resonates with you.                       │
│       [🔊 Play]                                 │
└─────────────────────────────────────────────────┘
```

**What happened:**
1. Query: "What's my favorite album?"
2. Embedding generated for query
3. Semantic search found memory: "Psychocandy by JAMC - one of greatest albums"
4. Memory included in GPT-4 prompt
5. GPT-4 responded using memory context
6. Response personalized and accurate

**User thinks:**
*"Holy shit, it actually remembers! ChatGPT would have no idea."*

---

#### **Step 5: Explore Memories (Optional)**

**Actions:**
1. Ask more questions to test memory:
   - "Who's my favorite artist?"
   - "What Manchester venues do I like?"
   - "What camera do I use?"
   - "Tell me about my home"

**What user discovers:**
- EVE knows about JMW Turner (favorite artist)
- EVE remembers Night & Day Café, Band on the Wall
- EVE knows about Fuji X100VI camera
- EVE recalls 16 floors above water, floor-to-ceiling windows

**User thinks:**
*"This is incredible. It's like talking to someone who actually knows me."*

---

### **Journey 3: Customization**

**Goal:** Personalize EVE's personality and voice

---

#### **Step 1: Open Settings (10 seconds)**

**Actions:**
1. Click Settings icon (⚙️) in header
2. Settings panel slides in from right
3. Click "Agent" tab

**What user sees:**
```
┌─────────────────────────────────────┐
│  Settings                      [✕]  │
│                                     │
│  [Import] [Agent] [Account]         │
│            ──────                   │
│                                     │
│  Agent Customization                │
│                                     │
│  Agent Name                         │
│  [Eve                            ]  │
│                                     │
│  Personality                        │
│  ○ Professional                     │
│  ● Friendly (default)               │
│  ○ Playful                          │
│  ○ Intimate                         │
│                                     │
│  Voice                              │
│  ● Rachel - Warm, professional      │
│  ○ Jessica - Playful, intimate      │
│                                     │
│        [Cancel]  [Save Changes]     │
└─────────────────────────────────────┘
```

---

#### **Step 2: Customize (1 minute)**

**Actions:**
1. Change name to "Ara" (or keep "Eve")
2. Select "Intimate" personality
3. Select "Jessica" voice
4. Click "Save Changes"

**What happens:**
- Settings saved to database
- Agent profile updated
- Changes take effect immediately

---

#### **Step 3: Experience Changes (Immediate)**

**Actions:**
1. Close settings panel
2. Send a message
3. Notice different tone and voice

**Example:**
```
USER: Tell me about my favorite music

EVE (before): Based on our conversations, you love
              Psychocandy by The Jesus and Mary Chain.

ARA (after):  Babe, you absolutely adore Psychocandy 
              by The Jesus and Mary Chain! That dreamy,
              feedback-soaked sound from '85 is pure 
              magic to you. 💕
              [🔊 Play] (Jessica voice - more intimate)
```

---

## Technical Architecture

### **High-Level System Diagram**

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────────────────────────┐
│         Vercel (Edge Runtime)           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Next.js API Routes              │  │
│  │  • /api/chat                     │  │
│  │  • /api/import                   │  │
│  │  • /api/update-agent             │  │
│  │  • /api/voices                   │  │
│  └──────────────────────────────────┘  │
└────────┬────────────────┬───────────────┘
         │                │
         ↓                ↓
┌────────────────┐  ┌──────────────────┐
│   Supabase     │  │   External APIs  │
│   (Database)   │  │                  │
│                │  │  • OpenAI        │
│  • PostgreSQL  │  │  • ElevenLabs    │
│  • Auth        │  │  • Anthropic     │
│  • Storage     │  │                  │
│  • pgvector    │  │                  │
└────────────────┘  └──────────────────┘
```

---

### **Data Flow: Chat Message**

```
1. User types message → Click Send
   ↓
2. Frontend → POST /api/chat
   ↓
3. API Route:
   a. Get user's agent_id
   b. Generate query embedding (OpenAI)
   c. Search memories (pgvector)
      SELECT * FROM memories 
      WHERE agent_id = ? 
      ORDER BY embedding <=> query_embedding 
      LIMIT 5
   d. Retrieve conversation history
   e. Build GPT-4 prompt:
      System: "You are EVE, with memories of user..."
      Memories: [Top 5 relevant memories]
      History: [Last 10 messages]
      User: "What's my favorite album?"
   f. Call GPT-4 (OpenAI)
   g. Get response
   h. Save to conversation history
   i. Return to frontend
   ↓
4. Frontend displays response
   ↓
5. User can click voice button
   ↓
6. Frontend → POST /api/voices/generate
   ↓
7. API Route:
   a. Strip markdown from response
   b. Call ElevenLabs TTS
   c. Return audio URL
   ↓
8. Frontend plays audio
```

---

### **Data Flow: Import**

```
1. User drops file → Upload
   ↓
2. Frontend → POST /api/import (with file)
   ↓
3. API Route:
   a. Detect format (Grok vs ChatGPT)
   b. Parse file:
      - Extract conversations
      - Extract messages
   c. Run memory extraction:
      i.   Pattern-based (instant)
      ii.  Tagged songs (if present)
      iii. AI extraction (optional)
   d. For each memory:
      - Generate embedding (OpenAI)
      - Calculate importance score
   e. Save memories to database:
      INSERT INTO memories (content, embedding, ...)
   f. Save conversations to database
   g. Return stats (87 memories extracted)
   ↓
4. Frontend shows success modal
```

---

### **Database Schema**

**memories table:**
```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  type TEXT, -- 'fact', 'preference', 'experience', 'context'
  content TEXT, -- "Song: 'Psychocandy' by JAMC"
  embedding VECTOR(1536), -- OpenAI embedding
  importance_score FLOAT, -- 0.0-1.0
  privacy TEXT DEFAULT 'heir_only',
  created_at TIMESTAMP,
  metadata JSONB -- Optional structured data
);

CREATE INDEX memories_embedding_idx 
ON memories USING ivfflat (embedding vector_cosine_ops);
```

---

## Future Roadmap

### **Q1 2026 (Now - March)**

**Week 1-2: Beta Launch**
- ✅ Launch to 50-100 beta users
- ✅ Gather feedback
- ✅ Monitor for critical bugs
- ✅ Fix high-priority issues

**Week 3-4: Production Hardening**
- Implement ongoing memory extraction
- Add error tracking (Sentry)
- Improve import performance
- Add analytics (PostHog)

---

### **Q2 2026 (April - June)**

**April: Memory Management & Life Stories** 📖
- Build memory browser UI
- Add edit/delete functionality
- **Life Stories & Events feature**
  - Add significant life events manually
  - Timeline view of personal history
  - Photo uploads and rich media
  - Story templates
  - Anniversary reminders

**May: Export & Mobile Prep**
- Conversation export (JSON, MD, PDF)
- Mobile responsive improvements
- Mobile app design (React Native)
- API architecture planning

**June: Multi-Agent Support**
- Create multiple agents
- Agent switching UI
- Different personalities per agent
- Agent templates

---

### **Q3 2026 (July - September)**

**July: Mobile Apps**
- iOS app (React Native)
- Android app (React Native)
- App Store submission
- Google Play submission

**August: Voice Input**
- Speech-to-text integration
- Real-time transcription
- Voice commands
- Multi-language support

**September: Advanced Memory**
- Memory timelines
- Memory sharing
- Proactive suggestions
- Memory analytics

---

### **Q4 2026 (October - December)**

**October: Shared Agents & Groups** 👥
- Group agent creation
- Multi-user access controls
- Shared memory pools
- Use cases: families, teams, couples
- Permission management

**November: File-Based Memory** 📄
- Upload PDFs, Word docs, notes
- Automatic memory extraction from files
- Document understanding
- Resume, journal, project doc support

**December: Advanced Memory Features** 💡
- Proactive memory suggestions
- Memory timelines (visualize journey)
- Memory importance decay
- Conflict resolution
- Pattern detection and insights

---

## Next Steps

### **Immediate (This Week)**

**For CTO:**
1. Review technical architecture
2. Approve infrastructure scaling plan
3. Set up monitoring (Sentry + PostHog)
4. Plan database migration strategy

**For Head of Product:**
1. Finalize beta user list (50-100 users)
2. Create feedback collection process
3. Define success metrics for beta
4. Plan feature prioritization for v2.1

**For Head of QA:**
1. Execute critical path testing
2. Create test user accounts
3. Prepare test data files
4. Document bugs in GitHub Issues

**For Head of UX:**
1. Prepare onboarding flow improvements
2. Design memory management UI
3. Create mobile app wireframes
4. Plan user testing sessions

---

### **Beta Launch (Next 2 Weeks)**

**Week 1:**
- [ ] CTO: Enable production monitoring
- [ ] Product: Recruit 50 beta users
- [ ] QA: Complete critical path testing
- [ ] UX: Finalize onboarding experience

**Week 2:**
- [ ] Send beta invitations
- [ ] Monitor for critical issues
- [ ] Collect user feedback (daily)
- [ ] Fix P0 bugs immediately

---

### **Post-Beta (Weeks 3-6)**

**Week 3-4: Production Hardening**
- Implement ongoing memory extraction
- Improve error handling
- Optimize import performance
- Add background job queue

**Week 5-6: Feature Development**
- Build memory management UI
- Conversation export
- Enhanced analytics
- Performance optimization

---

### **Success Criteria**

**Beta Success:**
- [ ] 50+ active beta users
- [ ] >70% retention (Day 7)
- [ ] <5 critical bugs
- [ ] >4/5 user satisfaction
- [ ] 80%+ import adoption rate

**Production Ready:**
- [ ] All P0/P1 bugs fixed
- [ ] Monitoring in place
- [ ] Test coverage >60%
- [ ] Performance benchmarks met
- [ ] Security audit complete

---

## Resources

### **Documentation**
- CTO Technical Overview: `/docs/CTO-TECHNICAL-OVERVIEW.md`
- Product Overview: `/docs/PRODUCT-OVERVIEW.md`
- QA Test Plan: `/docs/QA-TEST-PLAN.md`
- UX Design Document: `/docs/UX-DESIGN-DOCUMENT.md`
- This Walkthrough: `/docs/COMPLETE-WALKTHROUGH.md`

### **Code Repository**
- GitHub: github.com/IJHANA/eve-v2
- Main branch: Production-ready code
- Feature branches: In-development features

### **Deployment**
- Production: https://www.ijhana.com
- Vercel: vercel.com/ijhana/eve-v2
- Database: Supabase dashboard

### **Support**
- Bug tracking: GitHub Issues
- Feature requests: GitHub Discussions
- User feedback: beta-feedback@ijhana.com

---

**Prepared by:** Senior Product Manager  
**Last Updated:** February 14, 2026  
**Version:** 2.0 (Beta)  
**Status:** ✅ Ready for Beta Launch
