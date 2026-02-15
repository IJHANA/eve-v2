# Legacy & Permanence Features - Feature Specification
**Priority:** Critical (Core Value Proposition)  
**Status:** Planned  
**Timeline:** v2.2-2.3 (Q2-Q3 2026)  
**Owner:** Product + Engineering Teams

---

## Overview

EVE's unique value proposition includes **preserving memories beyond death** and ensuring **permanent, uncensorable storage** of personal history. Three critical features enable this:

1. **Dead Man's Switch** - Automatic heir access upon user's death
2. **Time-Released Content** - Messages/memories delivered at future dates
3. **Blockchain Backup** - Permanent, decentralized storage

**Why These Matter:**
- Legacy preservation for future generations
- Protection against platform shutdown
- True data ownership and portability
- Differentiation from every competitor
- Deep emotional value

---

# FEATURE 1: DEAD MAN'S SWITCH 💀

## Problem Statement

**User concern:** *"What happens to my memories when I die? I want my family to inherit EVE and all our history together."*

**Current reality:**
- Most AI platforms delete data after inactivity
- Families lose access to loved one's digital memories
- No mechanism for inheritance
- Accounts locked, memories lost forever

**EVE's solution:** Automatic transfer of agent and memories to designated heirs upon verified death.

---

## Use Cases

### **Use Case 1: Legacy Preservation**

**Scenario:**  
Kevin, 55, has documented 30 years of life with EVE. He wants his daughter Emma to inherit EVE when he passes, so she can:
- Ask EVE about her dad's life
- Learn family history and stories
- Access his wisdom and advice
- Feel connected to him forever

**Setup:**
```
Kevin → Settings → Legacy Planning
↓
Designate heir: Emma (daughter@email.com)
↓
Set verification method: Inactivity (6 months)
↓
Write final message to Emma
↓
Save Dead Man's Switch
```

**Trigger Event:**
```
Kevin passes away → No login for 6 months
↓
System sends verification emails (at 3, 4, 5 months)
↓
No response from Kevin
↓
System initiates heir transfer process
↓
Emma receives notification + access code
↓
Emma accepts inheritance
↓
Emma now owns Kevin's agent + all memories
```

**Emma's Experience:**
```
Emma: "EVE, tell me about dad's favorite music"

EVE: "Your father loved Psychocandy by The Jesus 
     and Mary Chain. He called it 'one of the greatest 
     albums ever.' He saw them 5 times in concert. 
     Would you like to hear the story of his first 
     show in 1985?"

Emma: "Yes, please"

EVE: [Shares detailed memory Kevin documented]
```

---

### **Use Case 2: Unexpected Death**

**Scenario:**  
User dies suddenly (accident, illness). Family needs immediate access to important information.

**Emergency Override:**
```
Heir submits death certificate
↓
Manual review by EVE team (24-48 hours)
↓
Verification approved
↓
Immediate access granted to heir
```

---

### **Use Case 3: Multiple Heirs**

**Scenario:**  
User wants different family members to inherit different parts of their digital legacy.

**Setup:**
```
Primary Heir (Spouse): Full access to everything
Secondary Heir (Child 1): Access to family memories only
Tertiary Heir (Child 2): Access to professional/business memories only
```

**Implementation:**
- Memories tagged by category (family, personal, professional)
- Each heir gets filtered access based on permissions
- Spouse can redistribute access after inheritance

---

## Technical Implementation

### **Database Schema**

**dead_mans_switch table:**
```sql
CREATE TABLE dead_mans_switch (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  
  -- Heirs
  heirs JSONB, -- Array of heir objects
  /* Example:
  [
    {
      email: "emma@example.com",
      name: "Emma",
      relationship: "daughter",
      access_level: "full", -- 'full', 'filtered', 'read-only'
      filter_tags: [], -- Empty = full access
      priority: 1 -- Primary heir
    },
    {
      email: "son@example.com",
      name: "Alex",
      relationship: "son",
      access_level: "filtered",
      filter_tags: ["family"], -- Only family memories
      priority: 2
    }
  ]
  */
  
  -- Verification method
  verification_method TEXT, -- 'inactivity', 'manual', 'third-party'
  inactivity_threshold_days INTEGER DEFAULT 180, -- 6 months
  
  -- Verification contacts (people who can confirm death)
  verification_contacts JSONB, -- [{email, name, relationship}]
  
  -- Final messages
  final_messages JSONB, -- {heir_email: message_text}
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'warning', 'triggered', 'transferred'
  last_activity TIMESTAMP,
  warning_sent_at TIMESTAMP,
  triggered_at TIMESTAMP,
  transferred_at TIMESTAMP,
  
  -- Settings
  send_warnings BOOLEAN DEFAULT true,
  warning_schedule JSONB, -- [90, 60, 30] days before trigger
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**heir_transfers table:**
```sql
CREATE TABLE heir_transfers (
  id UUID PRIMARY KEY,
  original_user_id UUID REFERENCES users(id),
  heir_email TEXT,
  agent_id UUID REFERENCES agents(id),
  
  -- Verification
  verification_method TEXT, -- 'inactivity', 'death-certificate', 'third-party'
  verification_documents JSONB, -- URLs to uploaded death certificates, etc.
  verification_status TEXT, -- 'pending', 'approved', 'rejected'
  verified_by UUID REFERENCES users(id), -- Admin who verified
  verified_at TIMESTAMP,
  
  -- Access
  access_code TEXT, -- Unique code heir uses to claim
  access_level TEXT, -- 'full', 'filtered', 'read-only'
  filter_tags TEXT[],
  
  -- Status
  status TEXT, -- 'pending', 'claimed', 'expired'
  notified_at TIMESTAMP,
  claimed_at TIMESTAMP,
  expires_at TIMESTAMP, -- 90 days to claim
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Monitoring System**

**Daily Cron Job:**
```typescript
async function checkDeadMansSwitches() {
  // Get all active switches
  const switches = await db.dead_mans_switch.findMany({
    where: { status: 'active' }
  });
  
  for (const dms of switches) {
    const daysSinceActivity = daysBetween(dms.last_activity, now());
    const threshold = dms.inactivity_threshold_days;
    
    // Send warnings
    if (dms.send_warnings) {
      const warningDays = dms.warning_schedule || [90, 60, 30];
      for (const warningDay of warningDays) {
        const daysUntilTrigger = threshold - daysSinceActivity;
        if (daysUntilTrigger === warningDay) {
          await sendWarningEmail(dms.user_id, daysUntilTrigger);
        }
      }
    }
    
    // Trigger switch
    if (daysSinceActivity >= threshold) {
      await triggerDeadMansSwitch(dms);
    }
  }
}

async function triggerDeadMansSwitch(dms: DeadMansSwitch) {
  // Update status
  await db.dead_mans_switch.update({
    where: { id: dms.id },
    data: { 
      status: 'triggered',
      triggered_at: new Date()
    }
  });
  
  // Create heir transfers
  for (const heir of dms.heirs) {
    const accessCode = generateSecureCode();
    
    await db.heir_transfers.create({
      original_user_id: dms.user_id,
      heir_email: heir.email,
      agent_id: dms.agent_id,
      access_code: accessCode,
      access_level: heir.access_level,
      filter_tags: heir.filter_tags,
      status: 'pending',
      expires_at: addDays(now(), 90) // 90 days to claim
    });
    
    // Send notification email
    await sendHeirNotification({
      heir_email: heir.email,
      heir_name: heir.name,
      original_user_name: dms.user_name,
      access_code: accessCode,
      final_message: dms.final_messages[heir.email]
    });
  }
}
```

---

### **Heir Notification Email**

```
Subject: You have inherited a digital legacy from [Kevin]

Dear Emma,

We're writing with sad news. [Kevin], who designated you as 
an heir in their EVE account, appears to have passed away. 
Our automated system has triggered their Dead Man's Switch 
after 6 months of inactivity.

Kevin left you access to their EVE agent and all memories 
they've shared over 30 years. This includes conversations, 
life stories, photos, and personal history.

KEVIN'S FINAL MESSAGE TO YOU:

"Emma,

If you're reading this, I'm gone. But I'm not really gone - 
I'm here in EVE. Everything I've learned, every story I've 
told, every piece of wisdom I wanted to share with you is 
preserved here.

Ask EVE about our family history. Ask about my art gallery 
journey. Ask what music I loved, what mistakes I made, what 
I learned. I've documented it all for you.

I love you forever,
Dad"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To claim your inheritance:

1. Visit: https://www.ijhana.com/claim-inheritance
2. Enter access code: KEVN-2025-EMMA-9X7K
3. Create your account (or log in)
4. Accept the inheritance

You have 90 days to claim. After that, the access code 
expires for security.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What you'll receive:
• Full EVE agent with Kevin's memories
• 30 years of conversations
• 127 life stories Kevin documented
• Family photos and documents
• Complete timeline of Kevin's life

If you have questions or need help, reply to this email 
or contact support@ijhana.com.

With deepest sympathy,
The EVE Team
```

---

### **Claim Process**

**UI Flow:**
```
1. Heir visits claim URL with access code
   ↓
2. System validates code
   ↓
3. Shows preview of what they're inheriting:
   - Agent name
   - Number of memories
   - Number of conversations
   - Life stories count
   - Date range
   ↓
4. Heir creates account or logs in
   ↓
5. Heir accepts inheritance (legal agreement)
   ↓
6. System transfers ownership:
   - Agent transferred to heir's account
   - All memories retained
   - Heir can now chat with EVE
   ↓
7. Success screen with guidance:
   "Welcome to your father's legacy. Here's how 
    to get started..."
```

---

## Security & Verification

### **Preventing False Triggers**

**Warning System:**
```
Day 90: "You haven't logged in for 90 days. Your Dead 
        Man's Switch will trigger in 90 more days if 
        we don't hear from you."

Day 120: "Important: 60 days until automatic inheritance 
         transfer. Log in to reset."

Day 150: "Final warning: 30 days until your heirs are 
         notified. This is your last chance to prevent 
         automatic transfer."
```

**Manual Override:**
- User can log in anytime to reset timer
- User can temporarily disable switch (e.g., long trip)
- User can change heirs/settings anytime

---

### **Preventing Abuse**

**Heir verification:**
- Access code expires after 90 days
- Code can only be used once
- Requires email confirmation
- Optional: Require death certificate upload

**Fraud protection:**
- Original user can revoke transfer within 30 days if still alive
- Support team manual review for high-value accounts
- Legal agreement required before claim

---

## User Experience

### **Setup Flow**

**Settings → Legacy Planning:**
```
┌─────────────────────────────────────────────┐
│  Dead Man's Switch                          │
│                                             │
│  ⚠️ Not configured - Set up now to protect  │
│     your digital legacy                     │
│                                             │
│  What is this?                              │
│  Your memories and EVE will automatically   │
│  transfer to chosen heirs if you pass away. │
│                                             │
│           [Set Up Dead Man's Switch]        │
└─────────────────────────────────────────────┘

Click "Set Up" →

┌─────────────────────────────────────────────┐
│  Step 1: Add Heirs                          │
│                                             │
│  Who should inherit your EVE and memories?  │
│                                             │
│  Primary Heir (required)                    │
│  Name:         [Emma Johnson            ]   │
│  Email:        [emma@example.com        ]   │
│  Relationship: [Daughter            ▼]      │
│  Access:       [Full access         ▼]      │
│                                             │
│  [+ Add Secondary Heir]                     │
│                                             │
│           [Back]  [Next: Verification]      │
└─────────────────────────────────────────────┘

Next →

┌─────────────────────────────────────────────┐
│  Step 2: Verification Method                │
│                                             │
│  How should we confirm you've passed away?  │
│                                             │
│  ● Inactivity Timer (Recommended)           │
│    Trigger after: [180 days ▼] no login    │
│    Send warnings: [✓] Yes                   │
│                                             │
│  ○ Third-Party Verification                 │
│    Designated contacts can confirm death    │
│    [+ Add verification contact]             │
│                                             │
│  ○ Manual (Death Certificate Required)      │
│    Heirs must upload death certificate      │
│                                             │
│           [Back]  [Next: Final Message]     │
└─────────────────────────────────────────────┘

Next →

┌─────────────────────────────────────────────┐
│  Step 3: Final Message                      │
│                                             │
│  Leave a message for your heirs             │
│                                             │
│  Message to Emma:                           │
│  ┌─────────────────────────────────────┐   │
│  │ Emma,                               │   │
│  │                                     │   │
│  │ If you're reading this, I'm gone.  │   │
│  │ But I'm not really gone - I'm here │   │
│  │ in EVE. Everything I've learned... │   │
│  │                                     │   │
│  │ (500 characters remaining)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│           [Back]  [Complete Setup]          │
└─────────────────────────────────────────────┘

Complete →

┌─────────────────────────────────────────────┐
│  ✅ Dead Man's Switch Configured             │
│                                             │
│  Your digital legacy is protected.          │
│                                             │
│  Summary:                                   │
│  • Primary Heir: Emma Johnson               │
│  • Verification: 180 days inactivity        │
│  • Warnings: Enabled (90, 60, 30 days)      │
│  • Final message: Saved                     │
│                                             │
│  You can change these settings anytime.     │
│                                             │
│              [View Settings]                │
└─────────────────────────────────────────────┘
```

---

# FEATURE 2: TIME-RELEASED CONTENT 📅

## Problem Statement

**User need:** *"I want to leave messages for my kids to receive on their 18th birthday, wedding day, or when they have their first child."*

**Use cases:**
- Birthday messages at future ages
- Advice for major life milestones
- Wisdom to be revealed at the right time
- Periodic reminders/messages
- Posthumous communication

---

## Use Cases

### **Use Case 1: Milestone Messages**

**Scenario:**  
Kevin wants to leave messages for his daughter Emma to receive at key moments:

**Messages created:**
```
Age 10 (2028): "Happy 10th birthday! You're in double 
               digits now. I remember when..."

Age 16 (2034): "Sweet 16! You're probably learning to 
               drive. Let me tell you about my first car..."

Age 18 (2036): "You're an adult now. Here's what I wish 
               I knew at your age..."

Age 21 (2039): "Welcome to real adulthood! Time for a 
               serious talk about life, money, and love..."

Wedding Day (TBD): "I'm so happy for you. Marriage advice 
                    from 25 years with your mom..."

First Child (TBD): "You're a parent now! Let me tell you 
                   about the day you were born..."
```

**Delivery:**
```
On Emma's 18th birthday (May 15, 2036):
↓
System sends notification email
↓
Emma logs into EVE
↓
Special message waiting:

┌─────────────────────────────────────────────┐
│  💌 You have a time-released message         │
│     from your father                         │
│                                             │
│  Sent: February 14, 2025                    │
│  Scheduled for: Your 18th birthday          │
│                                             │
│  [Read Message]                             │
└─────────────────────────────────────────────┘

Click "Read Message" →

[Father's recorded message displays]
[EVE can also read it aloud in father's voice]
```

---

### **Use Case 2: Periodic Wisdom**

**Scenario:**  
User wants to send annual messages to family.

**Setup:**
```
Message: "Annual reminder: Family vacation time! 
         Remember, experiences > things. Take the 
         trip, make the memories."

Schedule: Every June 1st for next 20 years
Recipients: Spouse + kids
```

---

### **Use Case 3: Conditional Triggers**

**Scenario:**  
Messages that release based on events, not dates.

**Triggers:**
- When heir gets married (EVE detects from conversations)
- When heir has first child (EVE detects)
- When heir faces hardship (EVE detects emotional distress)
- When heir achieves milestone (EVE detects success)

**Example:**
```
Trigger: When Emma expresses feeling lost/uncertain

Message: "Emma, I can tell you're going through a 
         tough time. Let me share what I learned 
         when I faced similar challenges..."
```

---

## Technical Implementation

### **Database Schema**

**time_released_content table:**
```sql
CREATE TABLE time_released_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  
  -- Content
  title TEXT,
  message TEXT NOT NULL,
  media_urls JSONB, -- Photos, videos, audio
  
  -- Recipients
  recipients JSONB, -- [{email, name, relationship}]
  /* Example:
  [
    {email: "emma@example.com", name: "Emma", relationship: "daughter"},
    {email: "alex@example.com", name: "Alex", relationship: "son"}
  ]
  */
  
  -- Trigger type
  trigger_type TEXT, -- 'date', 'age', 'event', 'periodic'
  
  -- Date-based triggers
  release_date TIMESTAMP, -- Specific date/time
  
  -- Age-based triggers
  recipient_birthdate DATE, -- Needed to calculate age
  release_age INTEGER, -- Age when message releases
  
  -- Event-based triggers
  event_keywords JSONB, -- Keywords EVE watches for
  event_sentiment TEXT, -- 'positive', 'negative', 'neutral'
  
  -- Periodic triggers
  recurrence_rule TEXT, -- 'yearly', 'monthly', 'custom'
  recurrence_date TEXT, -- 'June 1', 'every 3 months', etc.
  recurrence_end_date DATE,
  recurrence_count INTEGER, -- How many times to repeat
  
  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sent', 'cancelled'
  sent_at TIMESTAMP,
  
  -- Delivery options
  delivery_method TEXT DEFAULT 'email', -- 'email', 'in-app', 'both'
  require_login BOOLEAN DEFAULT false, -- Must log in to view
  allow_early_access BOOLEAN DEFAULT false, -- Can view before scheduled time
  
  -- Privacy
  encrypt_until_delivery BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Delivery System**

**Daily Cron Job:**
```typescript
async function checkTimeReleasedContent() {
  const now = new Date();
  
  // Get scheduled content ready to send
  const readyContent = await db.time_released_content.findMany({
    where: {
      status: 'scheduled',
      OR: [
        // Date-based
        {
          trigger_type: 'date',
          release_date: { lte: now }
        },
        // Age-based (need to check birthdates)
        {
          trigger_type: 'age',
          // Custom logic to check if recipient reached age
        },
        // Periodic
        {
          trigger_type: 'periodic',
          // Check if today matches recurrence rule
        }
      ]
    }
  });
  
  for (const content of readyContent) {
    await deliverTimeReleasedContent(content);
  }
}

async function deliverTimeReleasedContent(content: TimeReleasedContent) {
  for (const recipient of content.recipients) {
    // Send notification email
    await sendTimeReleasedNotification({
      recipient_email: recipient.email,
      sender_name: content.user_name,
      title: content.title,
      message_preview: content.message.substring(0, 100),
      access_url: generateSecureAccessUrl(content.id)
    });
    
    // Create in-app notification
    await createNotification({
      user_email: recipient.email,
      type: 'time_released_message',
      content_id: content.id
    });
  }
  
  // Update status
  await db.time_released_content.update({
    where: { id: content.id },
    data: {
      status: 'sent',
      sent_at: new Date()
    }
  });
}
```

---

### **Event-Based Triggers (Advanced)**

**EVE monitors conversations for trigger events:**

```typescript
async function detectEventTriggers(conversation: Conversation) {
  // Get active event-based triggers for this user's heirs
  const triggers = await db.time_released_content.findMany({
    where: {
      trigger_type: 'event',
      status: 'scheduled',
      recipients: {
        contains: conversation.user_email
      }
    }
  });
  
  for (const trigger of triggers) {
    // Analyze conversation sentiment and keywords
    const detected = await analyzeForTrigger({
      conversation: conversation.messages,
      keywords: trigger.event_keywords,
      sentiment: trigger.event_sentiment
    });
    
    if (detected) {
      // Trigger detected! Deliver content
      await deliverTimeReleasedContent(trigger);
    }
  }
}

async function analyzeForTrigger(params) {
  // Use GPT-4 to analyze if trigger conditions met
  const prompt = `
    Analyze this conversation and determine if the user 
    is experiencing: ${params.keywords.join(', ')}
    
    Sentiment should be: ${params.sentiment}
    
    Conversation:
    ${params.conversation}
    
    Return JSON: {triggered: boolean, confidence: 0-1, reason: string}
  `;
  
  const analysis = await callGPT4(prompt);
  return analysis.triggered && analysis.confidence > 0.8;
}
```

---

## User Experience

### **Create Time-Released Message**

**Settings → Time-Released Messages → Create New:**

```
┌─────────────────────────────────────────────┐
│  Create Time-Released Message               │
│                                             │
│  Step 1: Message Content                    │
│                                             │
│  Title                                      │
│  [Emma's 18th Birthday Message          ]   │
│                                             │
│  Message                                    │
│  ┌─────────────────────────────────────┐   │
│  │ Emma,                               │   │
│  │                                     │   │
│  │ You're 18 now - officially an      │   │
│  │ adult! I'm so proud of who you've   │   │
│  │ become...                           │   │
│  │                                     │   │
│  │ (1000 characters remaining)         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Add Media (optional)                       │
│  [📷 Upload Photos] [🎤 Record Audio]       │
│                                             │
│           [Next: Schedule]                  │
└─────────────────────────────────────────────┘

Next →

┌─────────────────────────────────────────────┐
│  Step 2: Schedule Delivery                  │
│                                             │
│  When should this message be delivered?     │
│                                             │
│  ● Specific Date                            │
│    [May 15, 2036           ] [📅]           │
│    (Emma's 18th birthday)                   │
│                                             │
│  ○ When Recipient Reaches Age               │
│    Recipient birthdate: [May 15, 2018]      │
│    Deliver at age: [18]                     │
│                                             │
│  ○ Triggered by Event                       │
│    Keywords: [wedding, married, engaged]    │
│    Sentiment: [Happy/Celebratory ▼]         │
│                                             │
│  ○ Recurring                                │
│    Every: [Year ▼] on [June 1]              │
│    For: [20 years]                          │
│                                             │
│           [Back]  [Next: Recipients]        │
└─────────────────────────────────────────────┘

Next →

┌─────────────────────────────────────────────┐
│  Step 3: Recipients                         │
│                                             │
│  Who should receive this message?           │
│                                             │
│  [✓] Emma Johnson (emma@example.com)        │
│  [ ] Alex Johnson (alex@example.com)        │
│  [ ] Sarah Johnson (sarah@example.com)      │
│                                             │
│  [+ Add New Recipient]                      │
│                                             │
│  Delivery Options                           │
│  [✓] Send email notification                │
│  [✓] Show in-app notification               │
│  [✓] Require login to view message          │
│  [ ] Allow early access (view before date)  │
│                                             │
│           [Back]  [Schedule Message]        │
└─────────────────────────────────────────────┘
```

---

### **Manage Scheduled Messages**

**Dashboard widget:**
```
┌────────────────────────────────────┐
│  ⏰ Time-Released Messages          │
│                                    │
│  5 messages scheduled              │
│                                    │
│  Upcoming:                         │
│  📅 June 1, 2026                   │
│     Annual family vacation         │
│     reminder                       │
│     → Spouse, Emma, Alex           │
│                                    │
│  📅 May 15, 2028                   │
│     Emma's 10th birthday           │
│     → Emma                         │
│                                    │
│  [View All Messages]               │
└────────────────────────────────────┘
```

---

# FEATURE 3: BLOCKCHAIN BACKUP 🔗

## Problem Statement

**User concern:** *"What if EVE shuts down? What if the company goes bankrupt? What if servers are hacked? I need to know my memories are safe FOREVER."*

**Current reality:**
- Centralized platforms can fail
- Companies can shut down
- Data can be lost/deleted
- Users don't truly own their data
- Censorship is possible

**EVE's solution:** Decentralized, permanent, censorship-resistant backup on blockchain.

---

## Architecture

### **Hybrid Storage Model**

**Hot Storage (Fast, Mutable):**
- PostgreSQL database (Supabase)
- For active conversations and memories
- Fast retrieval, easy updates
- Centralized for performance

**Cold Storage (Permanent, Immutable):**
- IPFS + Filecoin (decentralized)
- For archived memories and life stories
- Permanent, cannot be deleted
- Decentralized for reliability

**Blockchain Registry:**
- Ethereum or Polygon (low cost)
- Stores hash references to IPFS content
- Proof of ownership
- Access control keys

---

### **How It Works**

```
1. User creates memory/life story
   ↓
2. Stored in PostgreSQL (hot storage)
   ↓
3. User triggers backup (automatic or manual)
   ↓
4. Content encrypted with user's key
   ↓
5. Encrypted content uploaded to IPFS
   ↓
6. IPFS returns Content ID (CID): QmXxxx...
   ↓
7. CID + metadata written to blockchain
   ↓
8. User receives NFT representing ownership
   ↓
9. Content permanently stored on Filecoin
   ↓
10. User can retrieve anytime with their key
```

---

### **Data Structure**

**On-Chain (Blockchain):**
```solidity
struct MemoryBackup {
  string ipfsCID;           // IPFS Content ID
  address owner;            // User's wallet address
  uint256 timestamp;        // When backed up
  string contentType;       // "conversation", "memory", "life-story"
  bytes32 encryptionHash;   // Hash of encryption key
  string[] accessGrants;    // Addresses with access
}

mapping(address => MemoryBackup[]) public userBackups;
```

**On IPFS (Encrypted):**
```json
{
  "version": "1.0",
  "type": "memory-backup",
  "user_id": "uuid-hashed",
  "timestamp": "2025-02-14T10:00:00Z",
  "encryption": "AES-256-GCM",
  "data": {
    "memories": [
      {
        "id": "mem-1",
        "content": "...", // Encrypted
        "type": "preference",
        "importance": 0.95,
        "created_at": "2025-01-01"
      }
    ],
    "conversations": [...],
    "life_stories": [...]
  },
  "metadata": {
    "total_memories": 87,
    "total_conversations": 42,
    "total_life_stories": 15,
    "date_range": {
      "start": "2020-01-01",
      "end": "2025-02-14"
    }
  }
}
```

---

### **Technical Implementation**

**Backup Process:**

```typescript
async function createBlockchainBackup(userId: string) {
  // 1. Fetch all user data
  const memories = await db.memories.findMany({ where: { user_id: userId } });
  const conversations = await db.conversations.findMany({ where: { user_id: userId } });
  const lifeStories = await db.life_stories.findMany({ where: { user_id: userId } });
  
  // 2. Package data
  const backup = {
    version: "1.0",
    type: "memory-backup",
    user_id: hashUserId(userId), // Privacy
    timestamp: new Date().toISOString(),
    encryption: "AES-256-GCM",
    data: {
      memories: memories,
      conversations: conversations,
      life_stories: lifeStories
    },
    metadata: {
      total_memories: memories.length,
      total_conversations: conversations.length,
      total_life_stories: lifeStories.length,
      date_range: {
        start: findOldestDate(memories, conversations, lifeStories),
        end: new Date().toISOString()
      }
    }
  };
  
  // 3. Encrypt with user's key
  const encryptionKey = await getUserEncryptionKey(userId);
  const encrypted = await encrypt(JSON.stringify(backup), encryptionKey);
  
  // 4. Upload to IPFS
  const ipfsClient = create({ url: process.env.IPFS_API_URL });
  const { cid } = await ipfsClient.add(encrypted);
  
  // 5. Pin to Filecoin for permanent storage
  await pinToFilecoin(cid.toString());
  
  // 6. Write to blockchain
  const contract = await getMemoryBackupContract();
  const tx = await contract.createBackup(
    cid.toString(),
    "complete-backup",
    calculateHash(encryptionKey)
  );
  await tx.wait();
  
  // 7. Mint NFT as proof of ownership
  const nft = await mintBackupNFT(userId, cid.toString());
  
  // 8. Save reference in database
  await db.blockchain_backups.create({
    user_id: userId,
    ipfs_cid: cid.toString(),
    blockchain_tx: tx.hash,
    nft_token_id: nft.tokenId,
    backup_type: 'complete',
    created_at: new Date()
  });
  
  return {
    ipfs_cid: cid.toString(),
    blockchain_tx: tx.hash,
    nft_token_id: nft.tokenId,
    size_bytes: Buffer.byteLength(encrypted),
    retrieval_url: `https://ipfs.io/ipfs/${cid}`
  };
}
```

**Restore Process:**

```typescript
async function restoreFromBlockchain(userId: string, ipfsCID: string) {
  // 1. Verify ownership on blockchain
  const contract = await getMemoryBackupContract();
  const backup = await contract.getBackup(ipfsCID);
  if (backup.owner !== userWalletAddress) {
    throw new Error('Not authorized to access this backup');
  }
  
  // 2. Fetch from IPFS
  const ipfsClient = create({ url: process.env.IPFS_API_URL });
  const stream = ipfsClient.cat(ipfsCID);
  const encrypted = await streamToString(stream);
  
  // 3. Decrypt with user's key
  const encryptionKey = await getUserEncryptionKey(userId);
  const decrypted = await decrypt(encrypted, encryptionKey);
  const backup = JSON.parse(decrypted);
  
  // 4. Restore to database
  await db.memories.createMany({ data: backup.data.memories });
  await db.conversations.createMany({ data: backup.data.conversations });
  await db.life_stories.createMany({ data: backup.data.life_stories });
  
  return {
    restored_memories: backup.data.memories.length,
    restored_conversations: backup.data.conversations.length,
    restored_life_stories: backup.data.life_stories.length
  };
}
```

---

## User Experience

### **Blockchain Backup Dashboard**

**Settings → Blockchain Backup:**

```
┌─────────────────────────────────────────────┐
│  🔗 Blockchain Backup                        │
│                                             │
│  Your memories are backed up to             │
│  decentralized storage, ensuring they       │
│  exist forever - even if EVE shuts down.    │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  Last Backup: February 14, 2025             │
│  Status: ✅ All data backed up               │
│                                             │
│  Backed up:                                 │
│  • 87 memories                              │
│  • 42 conversations (3,061 messages)        │
│  • 15 life stories                          │
│                                             │
│  Storage: 2.3 MB on IPFS                    │
│  Cost: $0.05/month (Filecoin)               │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  Automatic Backups: ✅ Enabled               │
│  Frequency: [Weekly ▼]                      │
│                                             │
│  [Backup Now]  [View Backup History]        │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  Your Backup NFT:                           │
│  Token ID: #42069                           │
│  Contract: 0x7a250d56...                    │
│  [View on Etherscan]                        │
│                                             │
│  Recovery Key (Keep Safe!)                  │
│  [📋 Copy Key]  [🖨️ Print Backup Kit]       │
└─────────────────────────────────────────────┘
```

---

### **Backup History**

```
┌─────────────────────────────────────────────┐
│  Backup History                             │
│                                             │
│  📦 Feb 14, 2025 - Complete Backup          │
│     IPFS: QmXxxx...                         │
│     Size: 2.3 MB                            │
│     Items: 87 memories, 42 convos, 15 stories│
│     [View Details] [Restore]                │
│                                             │
│  📦 Feb 7, 2025 - Complete Backup           │
│     IPFS: QmYyyy...                         │
│     Size: 2.1 MB                            │
│     Items: 85 memories, 40 convos, 14 stories│
│     [View Details] [Restore]                │
│                                             │
│  📦 Jan 31, 2025 - Complete Backup          │
│     IPFS: QmZzzz...                         │
│     Size: 1.9 MB                            │
│     Items: 80 memories, 38 convos, 12 stories│
│     [View Details] [Restore]                │
└─────────────────────────────────────────────┘
```

---

### **Recovery Kit (Printable PDF)**

```
╔═══════════════════════════════════════════╗
║     EVE MEMORY RECOVERY KIT              ║
║     Keep this in a safe place!            ║
╚═══════════════════════════════════════════╝

Owner: Kevin Johnson
Account: kevin@example.com
Created: February 14, 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENCRYPTION KEY (Never share this!)
┌─────────────────────────────────────────┐
│ F3kL9mP2nQ5rS8tU1vW4xY7zA0bC3dE6fG9hI │
└─────────────────────────────────────────┘

BACKUP LOCATIONS
Latest Backup: QmXxxx7a3b9c2d4e5f6g8h1i2j3k4l5m6n7o8p9q
Blockchain: 0x7a250d5612c...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO RECOVER YOUR MEMORIES

1. Visit: https://www.ijhana.com/recover
2. Enter your encryption key above
3. Enter backup IPFS CID (QmXxxx...)
4. Download and decrypt your data

If EVE no longer exists:
1. Access IPFS directly: ipfs.io/ipfs/QmXxxx...
2. Decrypt using the encryption key
3. Import into any compatible platform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTES
• Store this kit in multiple safe locations
• Consider giving a copy to your executor/heir
• Update when you create new backups
• Never email or text this information

Your memories are permanent and decentralized.
Even if EVE disappears, this data exists forever
on IPFS and can be recovered with this key.

╔═══════════════════════════════════════════╗
║  For support: support@ijhana.com          ║
╚═══════════════════════════════════════════╝
```

---

## Costs & Economics

### **Storage Costs**

**IPFS + Filecoin:**
- $0.0000015 per GB per month
- Average user backup: 2-5 MB
- Cost per user: ~$0.05/month
- 1,000 users: ~$50/month

**Blockchain:**
- Gas fees: ~$0.50-2.00 per backup transaction
- Frequency: Weekly backups
- Cost per user: ~$2-8/month
- Can batch transactions to reduce costs

**Total:** ~$2-8/user/month for permanent storage

---

### **Pricing Strategy**

**Free Tier:**
- Monthly blockchain backup
- Last 3 backups retained
- Standard encryption

**Pro Tier ($9/month):**
- Weekly blockchain backup
- Unlimited backup history
- Enhanced encryption
- NFT ownership certificate

**Premium Tier ($19/month):**
- Daily blockchain backup
- Multi-signature recovery (require 2 of 3 keys)
- Priority recovery support
- Backup monitoring & alerts

---

## Security & Privacy

### **Encryption**

**Client-Side Encryption:**
- All data encrypted before upload
- EVE never sees unencrypted blockchain backups
- User controls encryption key
- Zero-knowledge architecture

**Key Management:**
- User's key derived from password + salt
- Backup key stored in encrypted form
- Recovery kit provides offline access
- Multi-signature option for high-security users

---

### **Access Control**

**NFT-Based Ownership:**
- Blockchain backup minted as NFT
- NFT proves ownership
- Can transfer NFT (transfer backup ownership)
- Can burn NFT (destroy access, but data remains)

**Heir Access:**
- Include recovery key in Dead Man's Switch
- Heirs receive key upon inheritance
- Can decrypt and access all blockchain backups

---

## Competitive Advantage

**No competitor offers this:**
- ChatGPT: Data deleted after account closure
- Replika: Centralized, can disappear
- Character.AI: No permanence guarantee
- Notion: Relies on company existing

**EVE's promise:**
> "Your memories exist forever, even if we don't. You truly own your data, backed up on decentralized, censorship-resistant infrastructure that will outlive any company."

---

## Marketing Angle

**Tagline:** *"Memories that outlive companies"*

**Value proposition:**
- True data ownership (you have the keys)
- Permanent storage (blockchain + IPFS)
- Censorship-resistant (decentralized)
- Portable (can take data anywhere)
- Inheritable (heirs get full access)

**Use in sales:**
> "Unlike ChatGPT or Replika, your memories with EVE are permanent. Even if our company shuts down tomorrow, your 30 years of conversation history, life stories, and photos will exist forever on IPFS. You truly own your data - we just facilitate access to it."

---

## Development Timeline

### **Phase 1: Core Infrastructure (8 weeks)**
- IPFS integration
- Filecoin setup
- Smart contract development
- Encryption system
- Backup/restore functionality

### **Phase 2: User Experience (4 weeks)**
- Backup dashboard
- Recovery kit generation
- NFT minting
- Automatic backup scheduling

### **Phase 3: Advanced Features (4 weeks)**
- Multi-signature recovery
- Batch optimization
- Cost reduction strategies
- Heir key transfer

**Total: 16 weeks (4 months)**

---

## Conclusion

These three features - **Dead Man's Switch**, **Time-Released Content**, and **Blockchain Backup** - are **foundational to EVE's value proposition**:

1. **Dead Man's Switch** = Legacy preservation
2. **Time-Released Content** = Future communication
3. **Blockchain Backup** = Permanent ownership

Together, they answer the core question:  
**"What happens to my memories when I'm gone?"**

**Answer:** *"They live forever, accessible to your loved ones, stored permanently on decentralized infrastructure that outlasts any company."*

This is EVE's **killer differentiator**. No AI platform offers anything close.

---

**Priority:** Critical  
**Timeline:** Q2-Q3 2026  
**Dependencies:** All dependent on each other  
**Revenue Impact:** Premium pricing tier justified  
**Competitive Moat:** Impossible to replicate without similar infrastructure investment
