# EVE V2 - Mobile UI Specifications
**Date:** February 14, 2026  
**Version:** 2.0 (Beta)  
**Status:** Mobile-Responsive Design  
**Prepared by:** Senior Product Manager

---

## Problem Statement

**Desktop layout:**
- Mood selector: Right sidebar
- Voice settings: Settings panel
- Chat input: Bottom with inline voice button

**Mobile constraints:**
- No space for sidebars
- Settings panel takes full screen
- Need quick access to mood & voice
- Touch-optimized controls

---

## Mobile Layout Solution

### **Primary Layout (Portrait)**

```
┌─────────────────────────────────┐
│  [☰] EVE      [🎭] [🔊] [⚙️]  │ ← Header (60px)
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ EVE: Hi Kevin! How can I  │ │
│  │      help today?          │ │
│  │      [▶️ Play]            │ │ ← Messages
│  └───────────────────────────┘ │   (scrollable)
│                                 │
│  ┌───────────────────────────┐ │
│  │ USER: What's my favorite  │ │
│  │       album?              │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ EVE: Psychocandy by The   │ │
│  │      Jesus and Mary Chain │ │
│  │      [▶️ Play]            │ │
│  └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ [Type a message...    ] [🎤] [↑]│ ← Input (70px)
└─────────────────────────────────┘
│                                 │
│ ← Safe Area (iOS notch/bar) →  │
└─────────────────────────────────┘

Total: 100vh (full screen)
Width: 100vw (full width)
```

---

## Header Controls (Compact)

### **Mobile Header Layout**

```
┌─────────────────────────────────┐
│  [☰]  EVE    [🎭] [🔊] [⚙️]    │
│   │     │      │    │    │      │
│  Menu Title Mood Voice Settings │
└─────────────────────────────────┘
```

**Icons (44px touch targets):**
- `☰` Menu - Opens navigation drawer
- `🎭` Mood - Opens mood selector sheet
- `🔊` Voice - Toggle voice on/off quickly
- `⚙️` Settings - Opens full settings

---

## Mood Selector (Bottom Sheet)

### **Tap Mood Icon (🎭) →**

```
┌─────────────────────────────────┐
│                                 │
│  Chat continues in background   │
│  (dimmed overlay)               │
│                                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Swipe down to close
│                                 │
│  Select Mood                    │
│                                 │
│  ┌─────────────┬─────────────┐ │
│  │             │             │ │
│  │   Standard  │   Touché    │ │
│  │      💬     │     💋      │ │ ← Large touch targets
│  │             │             │ │   (150px x 150px)
│  │  Professional│  Intimate  │ │
│  │             │             │ │
│  └─────────────┴─────────────┘ │
│                                 │
│  Current: Standard              │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Swipe up from bottom or tap 🎭 icon
- Sheet slides up (300ms animation)
- Large touch targets for thumb reach
- Tap mood to select
- Sheet auto-dismisses (slide down)
- Chat immediately reflects new mood

---

## Voice Controls (Two Options)

### **Option 1: Quick Toggle (Recommended)**

**Tap Voice Icon (🔊) once:**
- Immediately plays last EVE message
- Icon shows playing state: 🔊 → ⏸️
- Tap again to pause

**Long-press Voice Icon (🔊):**
- Opens voice settings sheet

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  Voice Settings                 │
│                                 │
│  ○────●────○                    │ ← Volume slider
│  Soft  Med  Loud                │
│                                 │
│  Voice Selection                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ● Rachel (Warm)         │   │ ← Radio buttons
│  │   [▶️ Preview]          │   │   with preview
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ○ Jessica (Intimate)    │   │
│  │   [▶️ Preview]          │   │
│  └─────────────────────────┘   │
│                                 │
│  Auto-play Responses            │
│  [────○────────────────]        │ ← Toggle switch
│  Off          On                │
│                                 │
│       [Save Changes]            │
└─────────────────────────────────┘
```

---

### **Option 2: Inline Playback (Alternative)**

**No header icon, use message-level controls:**

```
┌───────────────────────────────┐
│ EVE: Based on our            │
│      conversations,          │
│      Psychocandy by JAMC     │
│      is your favorite!       │
│                              │
│  [▶️ Play]  [⚙️ Voice]       │ ← Inline controls
└───────────────────────────────┘
```

**Tap ⚙️ Voice → Same bottom sheet above**

---

## Settings Panel (Full Screen)

### **Tap Settings Icon (⚙️) →**

```
┌─────────────────────────────────┐
│  [←] Settings                   │ ← Back button
├─────────────────────────────────┤
│                                 │
│  Account                        │
│  [Name: Kevin              ] → │
│  [Email: kevin@example.com ] → │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  Agent                          │
│  [Customize EVE            ] → │
│  [Voice Settings           ] → │ ← Links to
│  [Mood Preferences         ] → │   sub-screens
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  Import                         │
│  [Import Conversation      ] → │
│  [Import History           ] → │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  Legacy & Backup                │
│  [Dead Man's Switch        ] → │
│  [Time-Released Messages   ] → │
│  [Blockchain Backup        ] → │
│  [Life Stories             ] → │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  [Sign Out]                     │
│                                 │
└─────────────────────────────────┘
```

---

## Input Area (Mobile Optimized)

### **Collapsed State (Default)**

```
┌─────────────────────────────────┐
│ [Type a message...    ] [🎤] [↑]│
│  └───────────────────┘  └─┘ └─┘ │
│   Expandable input      Voice Send│
└─────────────────────────────────┘
```

**Dimensions:**
- Input field: Expands to 5 lines max
- Voice button: 44x44px (always visible)
- Send button: 44x44px (shows when typing)

---

### **Expanded State (Typing)**

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ What's my favorite album?   │ │ ← Auto-expands
│ │ I think it was that...      │ │   to 5 lines max
│ │ _                           │ │
│ └─────────────────────────────┘ │
│                      [🎤]  [↑]  │
└─────────────────────────────────┘
```

**Behavior:**
- Taps input → iOS keyboard appears
- Input expands vertically (max 5 lines)
- After 5 lines → becomes scrollable
- Send button (↑) appears when text present
- Voice button (🎤) always accessible

---

## Navigation Drawer (Left Menu)

### **Tap Menu Icon (☰) →**

```
┌─────────────────────────────────┐
│  [✕]                            │
│                                 │
│  👤 Kevin Johnson               │
│  kevin@example.com              │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  💬 Chat                        │ ← Current
│  📖 Life Stories                │
│  📅 Time-Released Messages      │
│  ⏰ Timeline                    │
│  💾 Blockchain Backups          │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  ⚙️ Settings                    │
│  ❓ Help & Support              │
│                                 │
└─────────────────────────────────┘
│  ← Swipe from left edge         │
│     to open drawer              │
└─────────────────────────────────┘
```

**Interaction:**
- Swipe from left edge to open
- Tap outside or ✕ to close
- Slides over chat (doesn't push)
- 80% screen width max

---

## Responsive Breakpoints

### **Phone Portrait (320px - 428px)**

**Layout:**
- Full screen chat
- Bottom sheets for mood/voice
- Single column settings
- Collapsible input

**Touch targets:**
- Minimum 44x44px (Apple HIG)
- Message bubbles: 85% max width
- Buttons: 48x48px minimum
- Input: Min height 50px

---

### **Phone Landscape (568px - 926px)**

```
┌─────────────────────────────────────────────────┐
│ [☰] EVE    [🎭] [🔊] [⚙️]                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ EVE: Hi Kevin!  │  │ Type message...    │ │
│  └─────────────────┘  └─────────────────────┘ │
│                                                 │
│  ┌─────────────────┐                           │
│  │ USER: Question  │                           │
│  └─────────────────┘                           │
└─────────────────────────────────────────────────┘
```

**Optimizations:**
- Wider message bubbles (70% width)
- Input expands to 3 lines (more visible)
- Keyboard takes less % of screen

---

### **Tablet Portrait (744px - 834px)**

```
┌───────────────────────────────────┐
│  [☰] EVE      [🎭] [🔊] [⚙️]    │
├─────┬─────────────────────────────┤
│ 💬  │  ┌────────────────────┐    │
│ 📖  │  │ EVE: Message       │    │
│ 📅  │  └────────────────────┘    │
│ ⚙️  │                            │ ← Persistent
│     │  ┌────────────────────┐    │   sidebar
│     │  │ USER: Question     │    │   on tablet
│     │  └────────────────────┘    │
│     │                            │
│     │  [Type message...    ]     │
└─────┴─────────────────────────────┘
```

**Optimizations:**
- Show persistent left navigation
- Wider chat area (600px max)
- Settings open as overlay (not full screen)
- Mood/voice in sidebar or bottom sheet

---

### **Tablet Landscape (1024px+)**

**Use desktop layout:**
- Right sidebar returns (mood/voice)
- Max width 800px centered
- Settings panel overlay (not full screen)

---

## Mobile-Specific Features

### **1. Haptic Feedback**

```typescript
// On mood selection
navigator.vibrate(50);

// On voice playback start
navigator.vibrate([20, 10, 20]);

// On send message
navigator.vibrate(10);
```

---

### **2. Gesture Controls**

**Swipe Right (on message):**
- Quick reply/quote

**Swipe Left (on message):**
- Delete message (own messages only)

**Pull Down (at top of chat):**
- Refresh/load older messages

**Swipe from Left Edge:**
- Open navigation drawer

**Swipe Down (on bottom sheet):**
- Close mood/voice settings

---

### **3. iOS Safe Areas**

```css
/* Account for iPhone notch and home bar */
.chat-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.input-area {
  /* Stick above home indicator */
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}
```

---

### **4. Keyboard Handling**

**iOS:**
```typescript
// Scroll to keep input visible
window.addEventListener('resize', () => {
  if (isKeyboardVisible()) {
    scrollToBottom();
  }
});
```

**Android:**
```xml
<!-- manifest.xml -->
<activity android:windowSoftInputMode="adjustResize">
```

---

## Mood Selector - Mobile Variants

### **Variant A: Bottom Sheet (Recommended)**

**Pros:**
- Familiar mobile pattern
- Quick access
- Doesn't interrupt chat
- Thumb-friendly

**Cons:**
- Requires extra tap
- Temporarily covers chat

---

### **Variant B: Slide-Out Panel**

```
┌───────────────┬─────────────────┐
│               │  Select Mood    │
│               │                 │
│  Chat         │  ┌───────────┐ │ ← Slides from
│  continues    │  │ Standard  │ │   right edge
│               │  └───────────┘ │
│               │  ┌───────────┐ │
│               │  │  Touché   │ │
│               │  └───────────┘ │
└───────────────┴─────────────────┘
```

**Pros:**
- Chat still partially visible
- Easier to compare moods

**Cons:**
- Covers significant chat area
- Less thumb-friendly (right edge)

---

### **Variant C: Floating Action Button (FAB)**

```
┌─────────────────────────────────┐
│  Chat messages                  │
│                                 │
│  ┌───────────────────────────┐ │
│  │ EVE: Message              │ │
│  └───────────────────────────┘ │
│                                 │
│                    ┌──────┐    │
│                    │  🎭  │    │ ← FAB in corner
│                    └──────┘    │   (56x56px)
│                                 │
│  [Type message...]              │
└─────────────────────────────────┘
```

**Tap FAB → Opens mood selector**

**Pros:**
- Always visible
- Doesn't clutter header
- Modern mobile pattern

**Cons:**
- Might block messages
- Accidental taps

---

## Voice Settings - Mobile Variants

### **Variant A: Header Icon + Sheet (Recommended)**

**Quick access:** Tap 🔊 to play/pause  
**Settings:** Long-press 🔊 for full settings

**Pros:**
- One-tap playback
- Settings when needed
- Compact header

---

### **Variant B: Message-Level Only**

**No header icon, only inline controls:**

```
┌───────────────────────────────┐
│ EVE: Your favorite album is  │
│      Psychocandy!            │
│                              │
│  [▶️ Play] [Settings]        │
└───────────────────────────────┘
```

**Pros:**
- Cleaner header
- Contextual to each message

**Cons:**
- Less discoverable
- Requires scrolling to change settings

---

### **Variant C: Settings Panel Only**

**No quick access, all in Settings → Voice**

**Pros:**
- Cleanest interface
- Dedicated space for options

**Cons:**
- Too many taps to play voice
- Poor usability

---

## Recommended Mobile Layout

### **Header Icons (Left to Right):**

```
[☰]  EVE      [🎭]  [🔊]  [⚙️]
 │     │       │     │     │
Menu Title  Mood  Voice Settings
```

---

### **Mood Icon (🎭) Behavior:**

**Single tap:**
- Opens bottom sheet
- Large touch targets (150x150px)
- Quick selection
- Auto-dismiss

**Long-press (optional):**
- Preview mood without selecting
- Haptic feedback

---

### **Voice Icon (🔊) Behavior:**

**Single tap:**
- Play/pause last EVE message
- Visual feedback (icon changes)
- Haptic feedback

**Long-press:**
- Opens voice settings bottom sheet
- Volume, voice selection, auto-play
- Save changes

---

## Accessibility (Mobile)

### **Screen Reader Support**

```html
<!-- Mood button -->
<button 
  aria-label="Select conversation mood. Current: Standard"
  aria-haspopup="dialog"
  onClick={openMoodSheet}
>
  🎭
</button>

<!-- Voice button -->
<button
  aria-label="Play audio response. Voice: Rachel"
  aria-pressed={isPlaying}
  onClick={toggleVoice}
>
  {isPlaying ? '⏸️' : '🔊'}
</button>
```

---

### **Voice Control (iOS/Android)**

**Siri/Google Assistant:**
```
"Hey Siri, open EVE"
"Change mood to touché"
"Play last message"
"Send message: What's my favorite album?"
```

---

### **Dynamic Type (iOS)**

```css
/* Respect user's text size preferences */
.message-text {
  font-size: 1rem; /* Scales with Dynamic Type */
}

/* Test at all sizes */
- Extra Small
- Small
- Medium (default)
- Large
- Extra Large
- XXL
- XXXL (Accessibility)
```

---

## Performance Optimizations

### **Lazy Loading Messages**

```typescript
// Load 20 messages initially
// Load more on scroll up
const MESSAGES_PER_PAGE = 20;

function onScroll() {
  if (scrolledToTop() && hasMoreMessages()) {
    loadMoreMessages(MESSAGES_PER_PAGE);
  }
}
```

---

### **Image Optimization**

```typescript
// Use responsive images
<img 
  src="/photo-small.jpg"
  srcset="/photo-small.jpg 320w,
          /photo-medium.jpg 640w,
          /photo-large.jpg 1024w"
  sizes="(max-width: 428px) 100vw,
         (max-width: 834px) 50vw,
         33vw"
/>
```

---

### **Reduce Animations on Low Power**

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

if (prefersReducedMotion.matches) {
  // Disable animations
  disableBottomSheetAnimation();
}
```

---

## Testing Matrix

| Device | OS | Screen | Test |
|--------|----|---------| -----|
| iPhone SE | iOS 17 | 375x667 | Smallest screen |
| iPhone 15 | iOS 17 | 393x852 | Notch + Dynamic Island |
| iPhone 15 Pro Max | iOS 17 | 430x932 | Large screen |
| Samsung Galaxy S23 | Android 14 | 360x780 | Small Android |
| Samsung Galaxy S23 Ultra | Android 14 | 412x915 | Large Android |
| iPad Mini | iOS 17 | 744x1133 | Small tablet |
| iPad Pro 11" | iOS 17 | 834x1194 | Medium tablet |
| iPad Pro 12.9" | iOS 17 | 1024x1366 | Large tablet |

---

## Implementation Priority

### **Phase 1: MVP (Current)**
- ✅ Basic responsive layout
- ✅ Bottom sheet for mood
- ✅ Header icon for voice
- ✅ Settings full screen

### **Phase 2: Mobile Optimization**
- [ ] Haptic feedback
- [ ] Gesture controls (swipe)
- [ ] Better keyboard handling
- [ ] iOS safe areas

### **Phase 3: Polish**
- [ ] Floating action button option
- [ ] Voice control integration
- [ ] Optimized animations
- [ ] Extensive device testing

---

## Conclusion

**Recommended Mobile Layout:**

**Header:**
- `☰` Menu (navigation drawer)
- `🎭` Mood (bottom sheet)
- `🔊` Voice (tap=play, long-press=settings)
- `⚙️` Settings (full screen)

**Chat:**
- Full screen messages
- Auto-expanding input (max 5 lines)
- Inline voice buttons per message

**Benefits:**
- Clean, uncluttered interface
- Quick access to key features
- Touch-optimized (44px+ targets)
- Familiar mobile patterns
- Accessible for all users

---

**This mobile layout balances:**
- ✅ Feature accessibility
- ✅ Screen real estate
- ✅ Thumb-friendly design
- ✅ iOS/Android conventions
- ✅ Performance
