# EVE V2 - QA Test Plan
**Date:** February 14, 2026  
**Version:** 2.0 (Beta)  
**Status:** Ready for Beta Testing  
**Prepared by:** Senior Product Manager

---

## Executive Summary

This document outlines the comprehensive testing strategy for EVE V2 beta launch. Current test coverage is minimal (manual testing only), requiring immediate QA focus on critical user flows, memory accuracy, and edge cases.

**Testing Priority:** High - First production release with real user data

---

## Test Environment

### **Environments**

| Environment | URL | Purpose | Data |
|-------------|-----|---------|------|
| **Production** | https://www.ijhana.com | Live users | Real data |
| **Preview** | Per-PR URLs | Feature testing | Test data |
| **Local** | http://localhost:3000 | Development | Test data |

### **Test Accounts**

Create test accounts for each persona:
- test-professional@ijhana.com (Kevin persona)
- test-creator@ijhana.com (Sarah persona)
- test-companion@ijhana.com (James persona)

### **Test Data**

**Sample Conversation Files:**
- `test-grok-small.md` (100 messages)
- `test-grok-medium.md` (1,000 messages)
- `test-grok-large.md` (3,000+ messages)
- `test-chatgpt.json` (500 messages)
- `test-malformed.md` (edge cases)

---

## Critical User Flows

### **Flow 1: New User Onboarding**

**Steps:**
1. Navigate to https://www.ijhana.com
2. Click "Sign Up"
3. Enter email + password
4. Verify email (check inbox)
5. Log in
6. See chat interface

**Success Criteria:**
- [ ] Sign up completes in <2 minutes
- [ ] Email verification link works
- [ ] First login shows empty chat
- [ ] No errors in console

**Test Cases:**
- Valid email/password
- Invalid email format
- Weak password (< 6 chars)
- Duplicate email (already registered)
- Email verification timeout
- Unverified login attempt

---

### **Flow 2: Import Conversation History**

**Steps:**
1. Log in to EVE
2. Click Settings (gear icon)
3. Click "Import" tab
4. Upload test-grok-medium.md (1,000 messages)
5. Wait for processing
6. See success message with memory count

**Success Criteria:**
- [ ] Import completes in <60 seconds for 1,000 messages
- [ ] Success message shows correct memory count
- [ ] Memories appear in database
- [ ] No duplicate memories
- [ ] No memory extraction errors

**Test Cases:**

| Test Case | File | Expected Result |
|-----------|------|-----------------|
| **Valid Grok (Small)** | test-grok-small.md (100 msg) | ~5-10 memories |
| **Valid Grok (Medium)** | test-grok-medium.md (1K msg) | ~30-50 memories |
| **Valid Grok (Large)** | test-grok-large.md (3K msg) | ~80-100 memories |
| **Valid ChatGPT** | test-chatgpt.json | ~20-40 memories |
| **Invalid Format** | test-invalid.txt | Error message |
| **Empty File** | test-empty.md | "No messages found" |
| **Malformed Markdown** | test-malformed.md | Partial extraction or error |
| **Huge File** | test-huge.md (10K+ msg) | Timeout handling |
| **Re-import Same File** | test-grok-small.md (2x) | Deduplication works |

---

### **Flow 3: First Conversation**

**Steps:**
1. After import, click back to Chat
2. Type: "What's my favorite album?"
3. Send message
4. Wait for response
5. Verify response references imported memory

**Success Criteria:**
- [ ] Response arrives in <3 seconds
- [ ] Response mentions "Psychocandy" (if in imported data)
- [ ] Response feels personalized
- [ ] No hallucinations about memories

**Test Cases:**

| Query | Expected Behavior |
|-------|-------------------|
| "What's my favorite album?" | Returns Psychocandy (if in memories) |
| "Who's my favorite artist?" | Returns JMW Turner (if in memories) |
| "What music do I like?" | Lists songs from memories |
| "Where do I live?" | Returns home details (if in memories) |
| "What's my name?" | Returns user name (if in memories) |
| "Random question" | Answers without forcing memory references |

---

### **Flow 4: Voice Interaction**

**Steps:**
1. Send a message to EVE
2. Wait for text response
3. Click "Play" (speaker icon)
4. Listen to audio
5. Verify voice quality

**Success Criteria:**
- [ ] Audio plays within 3 seconds
- [ ] Voice is clear and natural
- [ ] Markdown formatting stripped (no "asterisk asterisk")
- [ ] Audio player controls work (pause, stop)

**Test Cases:**
- Short response (1 sentence)
- Long response (5+ sentences)
- Response with markdown (bold, italic, lists)
- Response with code blocks
- Switch voices (Rachel vs Jessica)

---

### **Flow 5: Agent Customization**

**Steps:**
1. Go to Settings → Agent Customization
2. Change agent name to "Sarah"
3. Change voice to "Jessica (Intimate)"
4. Save changes
5. Return to chat
6. Verify agent name changed

**Success Criteria:**
- [ ] Changes save successfully
- [ ] Agent name updates in UI
- [ ] Voice change persists
- [ ] No data loss

**Test Cases:**
- Change name only
- Change voice only
- Change personality only
- Change all settings
- Save without changes
- Cancel changes

---

## Memory System Testing

### **Memory Extraction Accuracy**

**Test Data:** Use `ara1.md` (3,061 messages, known good dataset)

**Expected Output:** 87 memories

**Validation:**
```sql
SELECT COUNT(*) FROM memories 
WHERE agent_id = 'test-agent-id';
-- Expected: 87

SELECT content FROM memories 
WHERE content LIKE 'Song:%'
ORDER BY content;
-- Should see ~55 songs, all properly formatted

SELECT content FROM memories
WHERE content LIKE '%garbage%' OR content LIKE '%you crave%';
-- Expected: 0 results (no garbage)
```

**Quality Checks:**

| Category | Test | Pass Criteria |
|----------|------|---------------|
| **Songs** | Extract songs from tagged format | All `[song: ... \| artist: ...]` extracted |
| **Core Facts** | Extract name, profession, home | All present with correct values |
| **Cultural** | Extract Turner, Psychocandy, venues | All major preferences captured |
| **Locations** | Extract Seminole Park, Manchester spots | All locations with context |
| **No Garbage** | Check for random phrases as "songs" | Zero garbage memories |
| **No Duplicates** | Check for duplicate memories | <5% duplication rate |

---

### **Semantic Search Accuracy**

**Test Queries:**

| Query | Expected Top Memory | Similarity Score |
|-------|---------------------|------------------|
| "What music do I like?" | Psychocandy album | >0.80 |
| "psychedelic songs" | Dream Syndicate, Rain Parade | >0.75 |
| "Manchester venues" | Night & Day Café, Band on the Wall | >0.85 |
| "Where do I live?" | 16 floors above water | >0.90 |
| "favorite artist" | JMW Turner | >0.90 |

**Validation:**
1. Send query
2. Check retrieved memories (inspect API logs)
3. Verify relevance and similarity scores
4. Confirm top result is actually relevant

**Edge Cases:**
- Query with typos ("Manchestr" instead of "Manchester")
- Vague queries ("tell me about myself")
- Queries with no matching memories
- Queries that should match multiple memories

---

### **Memory Persistence**

**Test:**
1. Import conversation (creates memories)
2. Log out
3. Log back in
4. Ask question that requires memory
5. Verify memory still accessible

**Success Criteria:**
- [ ] Memories persist after logout
- [ ] Memories accessible across sessions
- [ ] No data loss

---

## Edge Cases & Error Handling

### **Import Edge Cases**

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| **Consecutive Messages** | Same role 3x in a row | Handle gracefully, don't merge |
| **Empty Messages** | Message with no content | Skip, don't crash |
| **Very Long Message** | 10,000+ character message | Truncate or handle properly |
| **Special Characters** | Emojis, Unicode, etc. | Preserve correctly |
| **Markdown in Messages** | Headers, lists, code blocks | Parse correctly |
| **Timestamps** | Messages with dates/times | Extract if present |
| **Huge File** | 50MB+ file | Show error or progress bar |
| **Network Failure** | Upload interrupted | Show error, allow retry |

---

### **Chat Edge Cases**

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| **Empty Message** | Send blank message | Prevent send or show error |
| **Very Long Message** | 5,000+ characters | Handle or show character limit |
| **Rapid Messages** | Send 10 messages quickly | Queue properly, no crashes |
| **Special Characters** | Emojis, symbols | Display correctly |
| **Code Blocks** | ```code``` | Render properly |
| **Markdown** | **bold**, *italic* | Render properly |
| **Links** | https://example.com | Clickable, safe |
| **Network Offline** | Send while offline | Show error, queue for retry |

---

### **Voice Edge Cases**

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| **Very Long Response** | 5,000+ character response | Audio generates or shows limit |
| **Markdown in Response** | **bold**, lists, etc. | Stripped from audio |
| **Special Characters** | Emojis, symbols | Handled gracefully |
| **Audio Player Failure** | ElevenLabs API down | Show error message |
| **Multiple Plays** | Play audio 5x quickly | Queue properly |

---

## Performance Testing

### **Response Time Benchmarks**

| Action | Target | Acceptable | Poor |
|--------|--------|------------|------|
| **Page Load** | <1s | <2s | >3s |
| **Chat Response** | <2s | <4s | >5s |
| **Memory Search** | <100ms | <200ms | >500ms |
| **Import (1K msg)** | <30s | <60s | >120s |
| **Import (3K msg)** | <60s | <120s | >180s |
| **Voice Generation** | <3s | <5s | >10s |

### **Load Testing**

**Scenario 1: Single User, Heavy Use**
- 100 messages in 10 minutes
- All with memory search
- Expected: No degradation

**Scenario 2: 10 Concurrent Users**
- Each sends 10 messages
- Expected: <5s response time for all

**Scenario 3: 100 Concurrent Imports**
- 100 users import 1,000-message files simultaneously
- Expected: Queue properly, all complete within 10 minutes

---

## Security Testing

### **Authentication Tests**

| Test | Expected Result |
|------|-----------------|
| **Unauthenticated Access** | Redirect to login |
| **Expired Session** | Redirect to login |
| **Invalid Credentials** | Show error |
| **SQL Injection** | Prevented by Supabase |
| **XSS Attempts** | Sanitized by React |
| **CSRF** | Protected by Supabase |

### **Data Access Tests**

| Test | Expected Result |
|------|-----------------|
| **Access Other User's Memories** | 403 Forbidden |
| **Access Other User's Conversations** | 403 Forbidden |
| **Delete Other User's Data** | 403 Forbidden |
| **Modify Other User's Agent** | 403 Forbidden |

### **API Key Security**

| Test | Expected Result |
|------|-----------------|
| **OpenAI Key Exposed?** | No (server-side only) |
| **Supabase Key Exposed?** | Anon key OK, service key NO |
| **ElevenLabs Key Exposed?** | No (server-side only) |

---

## Browser Compatibility

### **Supported Browsers**

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| **Chrome** | Latest | P0 | ✅ Test |
| **Firefox** | Latest | P0 | ✅ Test |
| **Safari** | Latest | P0 | ✅ Test |
| **Edge** | Latest | P1 | ✅ Test |
| **Mobile Safari** | iOS 15+ | P1 | ⏳ Needs testing |
| **Mobile Chrome** | Android 10+ | P1 | ⏳ Needs testing |

### **Responsive Design**

| Device | Resolution | Status |
|--------|------------|--------|
| **Desktop** | 1920x1080 | ✅ Works |
| **Laptop** | 1366x768 | ✅ Works |
| **Tablet** | 768x1024 | ⚠️ Needs testing |
| **Mobile** | 375x667 | ⚠️ Needs testing |

---

## Accessibility Testing

### **WCAG 2.1 Compliance**

| Criterion | Level | Status |
|-----------|-------|--------|
| **Keyboard Navigation** | A | ⚠️ Test needed |
| **Screen Reader** | A | ⚠️ Test needed |
| **Color Contrast** | AA | ✅ Passes |
| **Focus Indicators** | AA | ✅ Passes |
| **Alt Text** | A | ⚠️ Test needed |
| **ARIA Labels** | A | ⏳ Partially implemented |

---

## Regression Testing

### **Pre-Deployment Checklist**

Before each deployment, verify:

- [ ] Import still works (Grok + ChatGPT)
- [ ] Memory extraction accuracy >90%
- [ ] Semantic search returns relevant results
- [ ] Chat responses are personalized
- [ ] Voice playback works
- [ ] Agent customization saves
- [ ] No new console errors
- [ ] No new 500 errors in logs
- [ ] No security vulnerabilities introduced

---

## Bug Reporting Template

```markdown
## Bug Report

**Title:** [Short description]

**Environment:**
- URL: [e.g., https://www.ijhana.com]
- Browser: [e.g., Chrome 120]
- User: [e.g., test-professional@ijhana.com]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
```
[Paste any errors]
```

**Priority:**
[ ] P0 - Critical (blocks launch)
[ ] P1 - High (major feature broken)
[ ] P2 - Medium (minor issue)
[ ] P3 - Low (nice to fix)
```

---

## Known Issues (Beta)

### **P0 - Critical (Launch Blockers)**
*None identified*

### **P1 - High (Fix Before Production)**

1. **Ongoing memory extraction not implemented**
   - Impact: Memories only created on import, not from new chats
   - Workaround: Users re-import periodically
   - Fix: Implement extraction every 10 messages (Week 2)

2. **No memory management UI**
   - Impact: Users can't edit/delete memories
   - Workaround: Contact support for manual deletion
   - Fix: Build memory browser UI (Week 4)

### **P2 - Medium (Post-Launch)**

3. **Import times out for very large files (10K+ messages)**
   - Impact: Small percentage of power users affected
   - Workaround: Split file or use chunks
   - Fix: Background job queue (Week 3)

4. **Voice sometimes has slight delay**
   - Impact: Audio takes 4-5 seconds instead of 2-3
   - Workaround: User waits
   - Fix: Optimize audio pipeline (Week 5)

### **P3 - Low (Future Enhancement)**

5. **No mobile app**
   - Impact: Users want iOS/Android apps
   - Workaround: Use responsive web app
   - Fix: React Native app (Q2 2026)

---

## Test Execution Schedule

### **Week 1: Critical Path Testing**
- [ ] Day 1-2: User onboarding flow
- [ ] Day 3-4: Import functionality
- [ ] Day 5: Memory extraction accuracy

### **Week 2: Feature Testing**
- [ ] Day 1-2: Chat + semantic search
- [ ] Day 3: Voice interaction
- [ ] Day 4: Agent customization
- [ ] Day 5: Edge cases

### **Week 3: Integration Testing**
- [ ] Day 1-2: End-to-end user journeys
- [ ] Day 3-4: Cross-browser testing
- [ ] Day 5: Performance testing

### **Week 4: Beta User Testing**
- [ ] Day 1-5: 50-100 real users test platform
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Prepare for public launch

---

## Success Criteria (QA Sign-Off)

### **Functional Requirements**
- [ ] All critical user flows work end-to-end
- [ ] Memory extraction accuracy >90%
- [ ] Semantic search accuracy >85%
- [ ] No P0 or P1 bugs remaining

### **Performance Requirements**
- [ ] Chat response <3 seconds (95th percentile)
- [ ] Import (3K messages) <120 seconds
- [ ] Memory search <200ms
- [ ] Page load <2 seconds

### **Quality Requirements**
- [ ] <1% error rate in production
- [ ] No security vulnerabilities
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Responsive on desktop, tablet, mobile

---

**QA Contact:** Head of QA  
**Bug Tracker:** GitHub Issues  
**Test Data:** Available in `/test-data` directory  
**Test Results:** Document in QA-Test-Results.md
