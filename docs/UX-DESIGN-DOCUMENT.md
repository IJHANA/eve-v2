# EVE V2 - UX Design Document
**Date:** February 14, 2026  
**Version:** 2.0 (Beta)  
**Status:** Ready for Beta Launch  
**Prepared by:** Senior Product Manager

---

## Executive Summary

EVE V2 represents a complete UX overhaul focused on simplicity, personalization, and emotional connection. The interface prioritizes conversation flow while making advanced features (import, voice, customization) discoverable without overwhelming new users.

**Core UX Principle:** *"Feels like chatting with someone who knows you, not using a tool."*

---

## Design Philosophy

### **1. Conversational First**
The chat interface is the primary experience. Everything else (settings, import, voice) supports the conversation without interrupting it.

### **2. Progressive Disclosure**
Advanced features are hidden until needed:
- New users see: Clean chat interface
- Power users discover: Import, voice, customization, memory controls

### **3. Emotional Design**
Every interaction reinforces the feeling of connection:
- Personalized responses that reference memories
- Warm, intimate voice options
- Subtle animations that feel alive, not mechanical

### **4. Trust Through Transparency**
Users can see and control their data:
- Import shows exactly what was extracted
- Memories are visible and editable (future)
- Privacy controls are clear

---

## User Interface Overview

### **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│  [Logo]  EVE                    [Settings] [⚙️]  │ ← Header (80px)
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ EVE: Hi Kevin! How can I help?           │  │ ← Messages
│  │      [🔊 Play]                           │  │   (scrollable)
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ USER: What's my favorite album?          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ EVE: Based on our conversations,         │  │
│  │      Psychocandy by The Jesus and        │  │
│  │      Mary Chain is your favorite!        │  │
│  │      [🔊 Play]                           │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Type a message...]            [Send] [🎙️]    │ ← Input (100px)
└─────────────────────────────────────────────────┘

Total Height: 100vh (full screen)
Max Width: 800px (centered on desktop)
```

---

## Key Screens

### **1. Chat Screen (Primary)**

**Purpose:** Main conversation interface

**Elements:**
- Message history (scrollable)
- User messages (right-aligned, blue bubble)
- EVE messages (left-aligned, gray bubble)
- Voice button (🔊) on each EVE message
- Input field (bottom)
- Send button (bottom right)
- Voice input button (🎙️) - future feature

**Visual Hierarchy:**
1. Most recent message (highest contrast)
2. Message bubbles (clear distinction user vs EVE)
3. Voice buttons (subtle, secondary action)
4. Input field (prominent, always visible)

**Interactions:**
- Scroll to load older messages
- Click voice button → plays audio inline
- Type message → shows send button
- Press Enter → sends message
- Shift+Enter → new line

**Responsive Behavior:**
- Desktop: Max 800px wide, centered
- Tablet: Full width with padding
- Mobile: Full width, touch-optimized

---

### **2. Settings Panel (Overlay)**

**Access:** Click gear icon (⚙️) in header

**Design:** Right-side overlay (400px wide)

**Tabs:**
```
┌─────────────────────────────────────┐
│  Settings                      [✕]  │
│                                     │
│  [Import] [Agent] [Account]         │ ← Tabs
│  ─────────                          │
│                                     │
│  Import Conversation History        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Drag file here or click    │   │
│  │  to upload                  │   │
│  │                             │   │
│  │  Supported: Grok (.md)      │   │
│  │             ChatGPT (.json) │   │
│  └─────────────────────────────┘   │
│                                     │
│  Import History:                    │
│  • Feb 14: ara1.md (87 memories)    │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Tabs switch content (Import, Agent, Account)
- Drag & drop file upload
- Click to select file
- Progress bar during import
- Success/error messages
- Close button (✕) or click outside to dismiss

---

### **3. Import Success (Modal)**

**Trigger:** After successful import

**Design:** Center modal (500px wide)

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

**Purpose:** 
- Celebrate success
- Show what was imported
- Guide user to next action

**Interactions:**
- Auto-dismiss after 5 seconds, OR
- Click "Start Chatting" to dismiss and return to chat

---

### **4. Agent Customization (Settings Tab)**

**Design:**

```
┌─────────────────────────────────────┐
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
│  Writing Style                      │
│  ○ Concise                          │
│  ● Natural (default)                │
│  ○ Detailed                         │
│                                     │
│        [Cancel]  [Save Changes]     │
└─────────────────────────────────────┘
```

**Interactions:**
- Edit agent name (text input)
- Select personality (radio buttons)
- Select voice (radio buttons with preview)
- Select writing style (radio buttons)
- Save changes (updates immediately)
- Cancel (reverts changes)

---

## Design System

### **Colors**

**Primary Palette:**
```
Primary Blue:    #3B82F6 (user messages)
Primary Gray:    #6B7280 (EVE messages)
Background:      #FFFFFF (light mode)
Text Primary:    #111827
Text Secondary:  #6B7280
Border:          #E5E7EB
```

**Semantic Colors:**
```
Success:  #10B981 (import success, confirmations)
Error:    #EF4444 (errors, warnings)
Info:     #3B82F6 (informational messages)
```

**Dark Mode (Future):**
```
Background:      #1F2937
Text Primary:    #F9FAFB
Text Secondary:  #9CA3AF
```

---

### **Typography**

**Font Family:**
```
Primary: Inter, system-ui, sans-serif
Monospace: 'Courier New', monospace (for code blocks)
```

**Font Sizes:**
```
Heading 1: 32px / 2rem (page titles)
Heading 2: 24px / 1.5rem (section titles)
Heading 3: 20px / 1.25rem (subsections)
Body:      16px / 1rem (default text)
Small:     14px / 0.875rem (metadata, labels)
Tiny:      12px / 0.75rem (timestamps, hints)
```

**Font Weights:**
```
Normal:    400 (body text)
Medium:    500 (labels, buttons)
Semibold:  600 (headings)
Bold:      700 (emphasis)
```

---

### **Spacing**

**Base Unit:** 4px

**Scale:**
```
xs:   4px  (0.25rem)
sm:   8px  (0.5rem)
md:   16px (1rem)
lg:   24px (1.5rem)
xl:   32px (2rem)
2xl:  48px (3rem)
```

**Usage:**
```
Padding (buttons):     12px 24px (sm vertical, lg horizontal)
Padding (messages):    16px (md)
Margin (messages):     8px (sm between messages)
Margin (sections):     24px (lg between sections)
```

---

### **Components**

#### **Message Bubble**

**User Message:**
```css
background: #3B82F6 (blue)
color: #FFFFFF (white text)
border-radius: 16px 16px 4px 16px
padding: 12px 16px
max-width: 70%
align: right
margin: 8px 0
```

**EVE Message:**
```css
background: #F3F4F6 (light gray)
color: #111827 (dark text)
border-radius: 16px 16px 16px 4px
padding: 12px 16px
max-width: 70%
align: left
margin: 8px 0
```

---

#### **Button Styles**

**Primary Button:**
```css
background: #3B82F6
color: #FFFFFF
padding: 10px 20px
border-radius: 8px
font-weight: 500
hover: background #2563EB
active: background #1D4ED8
```

**Secondary Button:**
```css
background: #FFFFFF
color: #3B82F6
border: 1px solid #E5E7EB
padding: 10px 20px
border-radius: 8px
font-weight: 500
hover: background #F9FAFB
```

**Icon Button (Voice):**
```css
background: transparent
color: #6B7280
padding: 6px
border-radius: 4px
hover: background #F3F4F6
active: color #3B82F6
```

---

#### **Input Field**

**Text Input:**
```css
background: #F9FAFB
border: 1px solid #E5E7EB
border-radius: 12px
padding: 12px 16px
font-size: 16px
min-height: 50px
max-height: 150px (auto-expand)
focus: border #3B82F6, shadow
```

**File Upload (Drag & Drop):**
```css
background: #F9FAFB
border: 2px dashed #D1D5DB
border-radius: 12px
padding: 48px
text-align: center
hover: border #3B82F6, background #EFF6FF
dragover: border #3B82F6, background #DBEAFE
```

---

## User Flows

### **Flow 1: First-Time User (No Import)**

```
1. Land on site
   ↓
2. See simple chat interface
   ↓
3. EVE says: "Hi! I'm EVE. I'll remember our conversations 
              so I can help you better over time. How can I 
              help you today?"
   ↓
4. User asks question
   ↓
5. EVE responds (generic, no memories yet)
   ↓
6. Over time, EVE starts remembering preferences
```

**UX Goals:**
- No friction to start chatting
- Clear explanation of memory feature
- Gradual discovery of import option

---

### **Flow 2: Power User (With Import)**

```
1. Land on site
   ↓
2. Click Settings (⚙️)
   ↓
3. See "Import" tab with clear instructions
   ↓
4. Drag & drop ara1.md file
   ↓
5. See progress bar: "Processing 3,061 messages..."
   ↓
6. See success modal: "87 memories extracted!"
   ↓
7. Click "Start Chatting"
   ↓
8. Ask question
   ↓
9. EVE responds with personalized answer using imported memories
   ↓
10. User feels: "Wow, she actually knows me!"
```

**UX Goals:**
- Clear, simple import process
- Immediate feedback on progress
- Celebrate success
- Instant gratification (personalized responses)

---

### **Flow 3: Voice Interaction**

```
1. User sends message
   ↓
2. EVE responds with text
   ↓
3. User notices voice button (🔊)
   ↓
4. Clicks button
   ↓
5. Audio plays inline
   ↓
6. User hears EVE's voice (warm, natural)
   ↓
7. Audio ends, button resets
```

**UX Goals:**
- Voice is discoverable but not intrusive
- One-click activation
- Smooth audio playback
- Natural-sounding voice

---

## Interaction Patterns

### **Conversational Loading States**

**Message Sending:**
```
User types → Send → Sending... → Delivered ✓
```

**EVE Responding:**
```
Thinking... (animated dots)
↓
Text appears word-by-word (streaming, future)
↓
Complete response shown
↓
Voice button appears
```

**Current (Non-Streaming):**
```
[Thinking animation for 1-3 seconds]
↓
Full response appears at once
```

---

### **Import Progress States**

**Upload:**
```
Drag file → Drop → Uploading... (0%) → Uploaded (100%)
```

**Processing:**
```
Parsing messages... (20%)
↓
Extracting memories... (60%)
↓
Generating embeddings... (90%)
↓
Success! (100%)
```

**Current:**
```
"Processing..." (no specific % shown)
```

---

### **Voice Playback States**

```
[🔊 Play]  (default)
↓
[⏸️ Pause] (while playing)
↓
[🔊 Play]  (after complete)
```

---

## Responsive Design

### **Desktop (>1024px)**

- Max width: 800px (centered)
- Settings panel: 400px overlay (right side)
- Message bubbles: Max 70% width
- Font size: 16px (1rem)
- Padding: Generous (24px)

---

### **Tablet (768px - 1024px)**

- Full width with 32px padding
- Settings panel: Full-screen overlay
- Message bubbles: Max 80% width
- Font size: 16px
- Padding: Moderate (16px)

---

### **Mobile (<768px)**

- Full width with 16px padding
- Settings panel: Full-screen modal
- Message bubbles: Max 85% width
- Font size: 16px (readable)
- Padding: Compact (12px)
- Input: Fixed to bottom (iOS safe area aware)
- Voice button: Larger tap target (44px minimum)

---

## Accessibility

### **Keyboard Navigation**

**Tab Order:**
```
1. Settings button (⚙️)
2. Message input field
3. Send button
4. Voice buttons (each message)
5. Settings panel items (when open)
```

**Shortcuts:**
```
Enter:       Send message
Shift+Enter: New line
Esc:         Close settings panel
Cmd/Ctrl+K:  Focus input
```

---

### **Screen Reader Support**

**ARIA Labels:**
```html
<!-- Message bubbles -->
<div role="log" aria-live="polite" aria-label="Conversation">
  <div role="article" aria-label="Message from EVE">
    EVE's response here
  </div>
</div>

<!-- Voice button -->
<button aria-label="Play audio response">
  🔊
</button>

<!-- Settings -->
<button aria-label="Open settings">
  ⚙️
</button>
```

**Focus Management:**
- New messages auto-announce
- Focus moves to new message on send
- Focus trapped in settings panel when open
- Focus returns to input after settings close

---

### **Visual Accessibility**

**Color Contrast:**
- Text on background: 7:1 (AAA)
- Buttons: 4.5:1 minimum (AA)
- Disabled states: Clear visual difference

**Focus Indicators:**
- Blue outline: 2px solid #3B82F6
- Visible on all interactive elements
- Never removed via CSS

**Font Sizes:**
- Minimum: 14px (0.875rem)
- Body: 16px (1rem)
- Zoomable to 200% without layout breaking

---

## Animations & Microinteractions

### **Message Animations**

**New Message Appears:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

duration: 200ms
easing: ease-out
```

**Typing Indicator (EVE thinking):**
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

Three dots, staggered animation
duration: 600ms
infinite loop
```

---

### **Button Interactions**

**Hover:**
```css
transition: background 150ms ease
background: lighter/darker shade
```

**Active/Press:**
```css
transform: scale(0.98)
transition: transform 100ms ease
```

**Voice Button Playing:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

### **Settings Panel**

**Open:**
```css
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

duration: 300ms
easing: ease-out
```

**Close:**
```css
@keyframes slideOut {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

duration: 250ms
easing: ease-in
```

---

## Error States

### **Import Errors**

**File Too Large:**
```
┌──────────────────────────────────────┐
│  ⚠️ File Too Large                   │
│                                      │
│  Maximum file size: 50MB             │
│  Your file: 75MB                     │
│                                      │
│  Try splitting your conversation     │
│  history into smaller files.         │
│                                      │
│           [Try Again]                │
└──────────────────────────────────────┘
```

**Invalid Format:**
```
┌──────────────────────────────────────┐
│  ⚠️ Invalid File Format              │
│                                      │
│  Supported formats:                  │
│  • Grok (.md or .json)               │
│  • ChatGPT (.json)                   │
│                                      │
│  Your file: document.pdf             │
│                                      │
│           [Try Again]                │
└──────────────────────────────────────┘
```

---

### **Chat Errors**

**Network Error:**
```
[Inline error below failed message]
⚠️ Message failed to send. Check your connection.
[Retry]
```

**API Error:**
```
[Inline error below failed message]
⚠️ Something went wrong. Try again in a moment.
[Retry]
```

---

### **Voice Errors**

**Audio Failed:**
```
[In place of voice button]
⚠️ Audio unavailable
```

**Voice Service Down:**
```
[Toast notification, top right]
Voice temporarily unavailable. Try again later.
[Dismiss after 5 seconds]
```

---

## Empty States

### **No Conversations Yet**

```
┌─────────────────────────────────────┐
│                                     │
│         👋                          │
│                                     │
│     Welcome to EVE!                 │
│                                     │
│  I'm your AI companion who          │
│  remembers everything we discuss.   │
│                                     │
│  Start by asking me anything, or    │
│  import your conversation history   │
│  from Grok or ChatGPT.              │
│                                     │
│     [Import History]                │
│                                     │
└─────────────────────────────────────┘
```

---

### **No Import History**

```
[Settings → Import Tab]

┌─────────────────────────────────────┐
│  No imports yet                     │
│                                     │
│  Import your conversation history   │
│  to instantly personalize EVE.      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Drag file here or click    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Success States

### **Message Sent**

```
[User message bubble]
What's my favorite album?  ✓ [small checkmark]
```

---

### **Import Complete**

```
┌──────────────────────────────────────┐
│  ✅ Import Successful!               │
│                                      │
│  87 memories extracted from          │
│  your conversation history!          │
│                                      │
│  EVE now knows:                      │
│  • Your favorite music               │
│  • Your art preferences              │
│  • Your home and locations           │
│  • Your personal details             │
│                                      │
│           [Start Chatting]           │
└──────────────────────────────────────┘
```

---

## Loading States

### **Import Processing**

```
┌──────────────────────────────────────┐
│  Processing your conversation...     │
│                                      │
│  [████████████░░░░░░░░] 60%          │
│                                      │
│  Extracting memories...              │
│                                      │
│  This may take up to 60 seconds      │
│  for large files.                    │
└──────────────────────────────────────┘
```

---

### **Chat Response Loading**

```
[EVE's message bubble]
● ● ●  [Animated bouncing dots]
```

---

### **Voice Loading**

```
[Voice button while loading]
[⏳ Loading...]  [Spinner icon]
```

---

## Mobile-Specific Considerations

### **Touch Targets**

**Minimum Size:** 44x44px (Apple HIG standard)

**Applied to:**
- Send button: 48x48px
- Voice buttons: 44x44px
- Settings button: 44x44px
- All tappable elements

---

### **Input Behavior**

**iOS Keyboard:**
- Input field fixed above keyboard
- Auto-scroll to keep input visible
- Keyboard dismisses on scroll up
- Safe area awareness (iPhone notch/home indicator)

**Android Keyboard:**
- Similar behavior to iOS
- Back button closes keyboard
- Input stays anchored

---

### **Gestures**

**Swipe to Go Back:** (Future)
- Settings panel: Swipe right to close
- Not currently implemented

**Pull to Refresh:** (Future)
- Chat: Pull down to load older messages
- Not currently implemented

---

## Dark Mode (Future Feature)

### **Color Palette**

```
Background:      #1F2937 (dark gray)
Surface:         #374151 (medium gray)
Text Primary:    #F9FAFB (almost white)
Text Secondary:  #9CA3AF (medium gray)
Border:          #4B5563 (subtle gray)

User Messages:   #3B82F6 (same blue)
EVE Messages:    #4B5563 (darker gray)
```

### **Activation**

```
Settings → Appearance → Theme
○ Light
● Dark
○ Auto (system preference)
```

---

## UX Metrics to Track

### **Engagement Metrics**

1. **Time to First Message**
   - Target: <30 seconds from landing

2. **Import Adoption Rate**
   - Target: 80% of users import within first session

3. **Voice Usage Rate**
   - Target: 20% of messages use voice

4. **Settings Discovery**
   - Target: 70% of users open settings within first 3 sessions

---

### **Usability Metrics**

1. **Task Completion Rate**
   - Import: >95% success rate
   - Send message: >99% success rate
   - Play voice: >95% success rate

2. **Error Rate**
   - Target: <2% of actions result in errors

3. **Time on Task**
   - Import: <2 minutes (including file preparation)
   - Agent customization: <1 minute

---

### **Satisfaction Metrics**

1. **Net Promoter Score (NPS)**
   - Target: >50 (excellent)

2. **User Satisfaction (CSAT)**
   - Target: >4.5/5

3. **Feature-Specific Satisfaction**
   - Memory accuracy: >4/5
   - Voice quality: >4/5
   - Import ease: >4.5/5

---

## UX Improvements Roadmap

### **Phase 1: Beta Launch (Current)**

**Focus:** Core experience polish

- ✅ Clean, minimal chat interface
- ✅ Simple import flow
- ✅ Voice playback
- ✅ Agent customization
- ⚠️ Need: Better loading states
- ⚠️ Need: Improved error messages

---

### **Phase 2: Production (v2.1)**

**Focus:** User control and transparency

- [ ] Memory browser UI
  - See all memories in organized list
  - Edit memory importance
  - Delete memories
  - Add memories manually

- [ ] Conversation export
  - Download as JSON, Markdown, or PDF
  - Email export option

- [ ] Enhanced onboarding
  - Interactive tutorial
  - Tooltips for first-time users
  - Progress indicators

---

### **Phase 3: Advanced Features (v2.2)**

**Focus:** Multi-modal and mobile

- [ ] Mobile app (iOS + Android)
  - Native performance
  - Push notifications
  - Offline mode

- [ ] Voice input (speech-to-text)
  - Real-time transcription
  - Multiple language support

- [ ] Rich media support
  - Send images to EVE
  - EVE can generate images
  - Code syntax highlighting

---

### **Phase 4: Personalization (v2.3)**

**Focus:** Adaptive UI

- [ ] Custom themes
  - User-selected color palettes
  - Layout preferences
  - Font size controls

- [ ] Smart suggestions
  - Autocomplete based on memory
  - Proactive memory references
  - Quick action buttons

- [ ] Collaborative features
  - Share specific conversations
  - Shared memories with partners
  - Team workspaces

---

## Design Handoff

### **Design Files**

- Figma: [Link to design file]
- Design system: [Link to Storybook]
- Icons: Lucide React (lucide.dev)
- Fonts: Inter (Google Fonts)

---

### **Component Library**

All components built with:
- React 19
- Tailwind CSS 3.4
- Lucide React icons
- No additional UI library

---

### **Development Guidelines**

1. **Use Tailwind utility classes**
   - Consistent spacing, colors, typography
   - Responsive by default

2. **Component structure**
   - Keep components small and focused
   - Props for customization
   - TypeScript for type safety

3. **Accessibility first**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation
   - Focus management

4. **Performance**
   - Lazy load heavy components
   - Optimize images
   - Debounce inputs
   - Virtual scrolling for long lists

---

## Conclusion

EVE V2's UX is designed to feel personal, warm, and effortless. Every interaction reinforces the core value proposition: *"Your AI companion who actually remembers you."*

**Key UX Strengths:**
- Conversational, not transactional
- Progressive disclosure of advanced features
- Emotional connection through voice and personalization
- Trust through transparency and control

**UX Gaps to Address:**
- Memory management UI (can't edit/delete)
- Mobile app (current: responsive web only)
- Voice input (current: text only)
- Proactive suggestions (current: reactive only)

**Next Steps:**
1. Beta user testing (gather feedback)
2. Iterate on import flow (most critical)
3. Build memory browser (most requested)
4. Mobile app design (highest growth potential)

---

**UX Contact:** Head of UX  
**Design Files:** Figma workspace  
**Component Library:** Storybook (coming soon)  
**User Testing:** Beta feedback sessions weekly
