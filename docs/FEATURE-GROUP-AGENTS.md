# Group/Shared Agents - Feature Specification
**Priority:** High (v2.3+ / Q4 2026)  
**Status:** Planned  
**Owner:** Product Team

---

## Overview

**Feature:** Allow multiple users to share access to a single agent with a shared memory pool.

**User Story:**  
*"As a family/team/couple, we want to share one EVE so she remembers our collective history, conversations, and context."*

---

## Use Cases

### **1. Family Memory Keeper** 👨‍👩‍👧‍👦

**Scenario:**  
The Johnson family shares one EVE to remember:
- Family trips and vacations
- Kids' milestones and achievements
- Favorite recipes and traditions
- Inside jokes and stories
- Upcoming events and birthdays

**Value:**
- Centralized family knowledge base
- Grandparents can ask EVE about grandkids
- Kids learn family history
- Shared planning and coordination

**Example:**
```
Dad: "EVE, when was Sarah's first day of school?"
EVE: "Sarah started kindergarten on September 5, 2023. 
     Your wife mentioned she was nervous but excited!"

Grandma: "What's the family lasagna recipe?"
EVE: "Here's the recipe your daughter-in-law uploaded 
     last month. She noted it's been in the family 
     for 3 generations!"
```

---

### **2. Team Knowledge Base** 💼

**Scenario:**  
A startup team shares EVE to remember:
- Project context and decisions
- Client preferences and history
- Meeting notes and action items
- Team processes and best practices
- Company culture and values

**Value:**
- Onboard new team members faster
- Institutional knowledge doesn't leave with employees
- Consistent client service
- Reduced "where did we document that?" questions

**Example:**
```
New hire: "EVE, what's our approach to client onboarding?"
EVE: "Based on team conversations, your 5-step process 
     is: 1) Discovery call, 2) Proposal, 3) Kickoff, 
     4) Weekly check-ins, 5) Retrospective. The team 
     emphasizes over-communication in the first month."

Manager: "What did we decide about the logo redesign?"
EVE: "In your meeting on Jan 15, the team voted 7-2 
     to go with Option B (minimalist). Sarah noted 
     it better represents your tech-forward positioning."
```

---

### **3. Relationship Companion** 💑

**Scenario:**  
A couple shares EVE to remember:
- Important dates and milestones
- Shared memories and experiences
- Each other's preferences
- Relationship insights
- Future plans and dreams

**Value:**
- Never forget anniversaries
- Remember partner's preferences
- Resolve "you said/I said" disputes
- Deepen emotional connection

**Example:**
```
Partner A: "When did we first talk about getting a dog?"
EVE: "You first discussed getting a dog on March 12, 
     2024. Partner B mentioned wanting a golden retriever, 
     and you both agreed to wait until after the move."

Partner B: "What flowers does my partner like?"
EVE: "They love peonies (mentioned 3 times) and dislike 
     roses (too cliché, they said). Their favorite color 
     is dusty pink."
```

---

### **4. Project Collaboration** 🎨

**Scenario:**  
A creative team shares EVE for a specific project:
- Design decisions and rationale
- Client feedback
- Version history
- Resource links
- Inspiration references

**Value:**
- Maintain creative consistency
- Reference past decisions
- Onboard contractors quickly
- Preserve project knowledge

---

## Core Features

### **1. Group Creation**

**Flow:**
1. User creates new agent
2. Selects "Shared Agent" option
3. Names the group (e.g., "Johnson Family", "Startup Team")
4. Invites members via email
5. Members accept invitation
6. Group agent activated

**UI:**
```
┌─────────────────────────────────────┐
│  Create Group Agent                 │
│                                     │
│  Agent Name:    [Family EVE      ]  │
│  Group Name:    [Johnson Family  ]  │
│                                     │
│  Invite Members:                    │
│  [email@example.com          ] [+]  │
│  [                            ] [+]  │
│                                     │
│  Permissions:                       │
│  ● All members can add memories     │
│  ○ Only admins can add memories     │
│                                     │
│        [Cancel]  [Create Group]     │
└─────────────────────────────────────┘
```

---

### **2. Permission Levels**

**Owner (1 per group):**
- Create/delete group
- Manage members
- Change group settings
- Full memory access (read, write, delete)
- Billing responsibility

**Admin (0-many):**
- Invite/remove members
- Edit group settings
- Full memory access
- Cannot delete group

**Editor (default):**
- Chat with agent
- Add memories (via conversation)
- View all memories
- Cannot manage members

**Viewer (optional):**
- Chat with agent
- View memories
- Cannot add new memories
- Read-only access

---

### **3. Shared Memory Pool**

**How it works:**
- All members' conversations contribute to same memory pool
- Memories tagged with contributor (optional)
- Semantic search across all shared memories
- Privacy controls per memory

**Example Memory:**
```json
{
  "content": "Family vacation to Hawaii, July 2024",
  "type": "experience",
  "importance": 0.9,
  "privacy": "group",
  "created_by": "dad@johnson.com",
  "created_at": "2024-07-15",
  "shared_with": ["johnson-family-group"],
  "tags": ["vacation", "hawaii", "family"]
}
```

---

### **4. Privacy Controls**

**Memory Privacy Levels:**

**Group (default):**
- Visible to all group members
- Used in agent responses for all members
- Searchable by all

**Private:**
- Only visible to creator
- Not shared with other members
- Agent can reference in 1-on-1 chats only

**Owner-only:**
- Only visible to group owner
- For sensitive info (medical, financial)

**Example:**
```
Dad adds memory: "Sarah's birthday is May 15" → Group
Mom adds memory: "Surprise party planned for Sarah" → Private
Dad adds memory: "Family budget: $5K/month" → Owner-only
```

---

### **5. Member Management**

**Invite Flow:**
```
Owner → Settings → Members → Invite
↓
Enter email → Send invitation
↓
Invitee receives email
↓
Clicks link → Creates/logs into account
↓
Accepts invitation
↓
Gets access to group agent
```

**Remove Member:**
- Owner/Admin can remove members
- Removed member loses access immediately
- Their contributed memories remain (optional: delete)

**Member List UI:**
```
┌─────────────────────────────────────┐
│  Group Members (5)                  │
│                                     │
│  👑 Dad (Owner)                     │
│     dad@johnson.com                 │
│     [Change Role ▼]                 │
│                                     │
│  👤 Mom (Admin)                     │
│     mom@johnson.com                 │
│     [Change Role ▼] [Remove]        │
│                                     │
│  👤 Sarah (Editor)                  │
│     sarah@johnson.com               │
│     [Change Role ▼] [Remove]        │
│                                     │
│      [+ Invite Member]              │
└─────────────────────────────────────┘
```

---

### **6. Group Chat Context**

**Challenge:** How does EVE address multiple users?

**Solution 1: Individual Context**
```
Dad: "What's my favorite food?"
EVE: "Your favorite food is pizza, especially 
     pepperoni. You mentioned this 3 times."

Mom: "What's my favorite food?"
EVE: "Your favorite food is Thai cuisine, 
     particularly pad thai."
```

**Solution 2: Collective Context**
```
Dad: "What do we usually do on Sundays?"
EVE: "The family typically goes to church at 10am, 
     then has brunch at The Pancake House. Sarah 
     always gets chocolate chip pancakes!"
```

**Solution 3: Attribution**
```
Dad: "What did we decide about the vacation?"
EVE: "Mom suggested Hawaii (Jan 10), you agreed 
     (Jan 12), and Sarah was excited about snorkeling 
     (Jan 15). Grandma offered to dog-sit."
```

---

## Technical Implementation

### **Database Schema Changes**

**groups table:**
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  settings JSONB
);
```

**group_members table:**
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES users(id),
  role TEXT, -- 'owner', 'admin', 'editor', 'viewer'
  joined_at TIMESTAMP,
  UNIQUE(group_id, user_id)
);
```

**agents table (updated):**
```sql
ALTER TABLE agents ADD COLUMN group_id UUID REFERENCES groups(id);
ALTER TABLE agents ADD COLUMN is_shared BOOLEAN DEFAULT false;
```

**memories table (updated):**
```sql
ALTER TABLE memories ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE memories ADD COLUMN privacy TEXT DEFAULT 'group'; -- 'group', 'private', 'owner-only'
```

---

### **Access Control (RLS)**

```sql
-- Users can only access agents they own or are group members of
CREATE POLICY agents_access ON agents
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only see group memories or their own private memories
CREATE POLICY memories_access ON memories
  USING (
    (privacy = 'group' AND agent_id IN (
      SELECT id FROM agents WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )) OR
    (privacy = 'private' AND created_by = auth.uid()) OR
    (privacy = 'owner-only' AND created_by IN (
      SELECT owner_id FROM groups WHERE id IN (
        SELECT group_id FROM agents WHERE id = agent_id
      )
    ))
  );
```

---

### **Chat Context Building**

```typescript
// When user chats with group agent
async function buildGroupContext(message: string, groupId: string, userId: string) {
  // 1. Get all group members
  const members = await getGroupMembers(groupId);
  
  // 2. Search memories with privacy filtering
  const memories = await searchMemories(message, {
    groupId,
    userId,
    privacyFilter: (memory) => {
      if (memory.privacy === 'group') return true;
      if (memory.privacy === 'private' && memory.created_by === userId) return true;
      if (memory.privacy === 'owner-only') {
        const group = await getGroup(groupId);
        return group.owner_id === userId;
      }
      return false;
    }
  });
  
  // 3. Get user-specific context
  const userMemories = memories.filter(m => m.created_by === userId);
  
  // 4. Build prompt
  return {
    systemPrompt: `You are EVE, shared by the ${group.name} group. 
                   Currently chatting with ${user.name}.`,
    groupMemories: memories.filter(m => m.privacy === 'group'),
    userMemories: userMemories,
    conversationHistory: await getConversationHistory(groupId, userId)
  };
}
```

---

## User Experience

### **Discovery**

**How users find this feature:**
1. Settings → Create Agent → "Create Shared Agent"
2. Dashboard: "Share this agent with others"
3. Onboarding: "Who will use EVE?" → "Just me" or "My family/team"

---

### **Onboarding New Members**

**Email invitation:**
```
Subject: You've been invited to join [Johnson Family] on EVE!

Hi Sarah,

Dad has invited you to join the Johnson Family group on EVE.

EVE is our family's AI companion who remembers our shared 
experiences, traditions, and conversations.

[Accept Invitation]

What you'll get access to:
• Family memories and stories
• Shared conversation history
• Upcoming events and reminders
• Recipe collection

Questions? Reply to this email.

- The EVE Team
```

**First login:**
```
┌─────────────────────────────────────┐
│  Welcome to Johnson Family!         │
│                                     │
│  You're now part of a shared EVE    │
│  with your family.                  │
│                                     │
│  What this means:                   │
│  • EVE knows about your family      │
│  • Your conversations help EVE      │
│    remember more                    │
│  • You can ask about family         │
│    history and plans                │
│                                     │
│           [Start Chatting]          │
└─────────────────────────────────────┘
```

---

## Pricing

### **Billing Model**

**Option 1: Per Group**
- $19/month per group (up to 10 members)
- $2/month per additional member

**Option 2: Per User**
- Free: 1 personal agent
- Pro ($9/month): Unlimited personal agents
- Team ($15/month/user): Personal + group agents

**Option 3: Hybrid**
- Personal plan: $9/month (no groups)
- Family plan: $19/month (1 group, up to 5 members)
- Team plan: $49/month (3 groups, unlimited members)

**Recommendation:** Option 3 (Hybrid) - clearest value props

---

## Success Metrics

**Adoption:**
- % of users who create shared agents
- Average group size
- Groups created per month

**Engagement:**
- Messages per group member
- Active groups (>10 messages/week)
- Retention (group vs solo users)

**Revenue:**
- Conversion rate (free → family/team plan)
- Average revenue per group
- Churn rate (group plans)

**Target:**
- 20% of users create/join groups
- Average group size: 4 members
- 2x retention vs solo users
- 30% higher ARPU

---

## Risks & Mitigations

### **Risk 1: Privacy Concerns**

**Problem:** Users worried about group members seeing private info

**Mitigation:**
- Clear privacy controls (group/private/owner-only)
- Visual indicators on memories
- Easy privacy adjustment
- Default to private for sensitive keywords

---

### **Risk 2: Memory Conflicts**

**Problem:** Group members contribute contradictory memories

**Mitigation:**
- Flag contradictions for owner review
- "Multiple perspectives" system
- Voting on conflicting memories
- Time-based resolution (newer wins)

---

### **Risk 3: Member Disputes**

**Problem:** Member wants their memories deleted after leaving

**Mitigation:**
- Clear terms: "Shared memories stay with group"
- Option to delete private memories only
- Owner can delete any member's contributions
- Export option before leaving

---

### **Risk 4: Billing Complexity**

**Problem:** Who pays when member leaves?

**Mitigation:**
- Owner always pays
- Prorated refunds for removed members
- Auto-downgrade if group size decreases
- Clear billing terms upfront

---

## Development Phases

### **Phase 1: MVP (4 weeks)**
- [ ] Group creation
- [ ] Member invitations
- [ ] Basic permission levels (owner, editor)
- [ ] Shared memory pool
- [ ] Simple privacy controls (group, private)

### **Phase 2: Core Features (4 weeks)**
- [ ] Advanced permissions (admin, viewer)
- [ ] Owner-only memories
- [ ] Member management UI
- [ ] Memory attribution
- [ ] Group settings

### **Phase 3: Polish (2 weeks)**
- [ ] Conflict resolution
- [ ] Memory privacy indicators
- [ ] Group analytics
- [ ] Billing integration
- [ ] User testing

**Total:** 10 weeks (2.5 months)

---

## Future Enhancements

- **Sub-groups:** Team has multiple project sub-groups
- **Memory permissions per member:** Sarah can't see financial memories
- **Scheduled group messages:** Weekly family update from EVE
- **Group memory timeline:** Visualize shared history
- **Integration with group calendars:** Sync family schedule
- **Voice chat for groups:** Family conference calls with EVE

---

## Open Questions

1. **Can one user belong to multiple groups?**  
   → Yes, Pro/Team plan allows multiple group memberships

2. **What happens to memories if group is deleted?**  
   → Owner can export, then all data deleted

3. **Can members transfer ownership?**  
   → Yes, via member management UI

4. **How do we handle spam/abuse?**  
   → Reporting system, moderation tools for owner

5. **Can groups merge?**  
   → Future feature, not MVP

---

**Priority:** High - Unlocks major use cases and revenue  
**Complexity:** High - Requires significant backend changes  
**Timeline:** Q4 2026 (10 weeks development)  
**Dependencies:** Multi-agent support (v2.2)
