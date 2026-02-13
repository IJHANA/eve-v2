# EVE V2 - STARTER KIT

## ✅ WHAT'S INCLUDED (Foundation Complete)

### 1. Project Configuration
- ✅ package.json (all dependencies)
- ✅ TypeScript config
- ✅ Next.js config  
- ✅ Tailwind CSS config
- ✅ Environment variables (.env.local with your actual keys)
- ✅ .gitignore (protects sensitive files)

### 2. Database
- ✅ Complete migration SQL (database-migration.sql)
- ✅ All new tables: agents, conversations, memories, knowledge_domains
- ✅ RLS policies for security
- ✅ Vector similarity search functions
- ✅ Safe migration (doesn't touch old tables)

### 3. Type Definitions
- ✅ Complete TypeScript types (types/index.ts)
- ✅ Mood, Voice, Message, Conversation, Agent types
- ✅ Import data structures

### 4. Core Utilities
- ✅ Supabase client setup (lib/supabase.ts)

### 5. Documentation
- ✅ README.md (quick start guide)
- ✅ DEPLOYMENT.md (step-by-step deployment)
- ✅ This STARTER-KIT.md file

### 6. Assets
- ✅ Your IJHANA logo (public/ijhana-logo-black.png)

## 🚧 WHAT NEEDS TO BE ADDED (Your Work Thu-Sun)

Due to file size, I'm providing you with the ARCHITECTURE and you'll implement:

### Thursday Tasks:

#### 1. Mood System (`lib/mood.ts`)
```typescript
import { Mood, MoodPreset } from '@/types';

export const MOOD_PRESETS: Record<string, MoodPreset> = {
  therapist: {
    name: 'Therapist',
    mood: { empathy: 0.95, directness: 0.4, humor: 0.1, formality: 0.3, intensity: 0.4, romanticism: 0.0 },
    description: 'Warm, empathetic, deeply understanding',
    icon: '🧠',
  },
  coach: {
    name: 'Coach',
    mood: { empathy: 0.5, directness: 0.95, humor: 0.2, formality: 0.4, intensity: 0.9, romanticism: 0.0 },
    description: 'Direct, motivating, no-nonsense',
    icon: '💪',
  },
  lover: {
    name: 'Lover',
    mood: { empathy: 0.9, directness: 0.3, humor: 0.6, formality: 0.1, intensity: 0.7, romanticism: 0.95 },
    description: 'Affectionate, intimate, playful',
    icon: '❤️',
  },
  sage: {
    name: 'Sage',
    mood: { empathy: 0.8, directness: 0.6, humor: 0.3, formality: 0.7, intensity: 0.3, romanticism: 0.2 },
    description: 'Wise, measured, philosophical',
    icon: '🧘',
  },
  debater: {
    name: 'Debater',
    mood: { empathy: 0.3, directness: 0.9, humor: 0.7, formality: 0.5, intensity: 0.8, romanticism: 0.0 },
    description: 'Sharp, witty, challenges ideas',
    icon: '⚔️',
  },
};

export function buildMoodPrompt(mood: Mood): string {
  return `
Current mood calibration:
- Empathy: ${Math.round(mood.empathy * 100)}% ${mood.empathy > 0.7 ? '(deeply understanding)' : mood.empathy < 0.3 ? '(logical, detached)' : '(balanced)'}
- Directness: ${Math.round(mood.directness * 100)}% ${mood.directness > 0.7 ? '(brutally honest)' : mood.directness < 0.3 ? '(gentle, indirect)' : '(straightforward)'}
- Humor: ${Math.round(mood.humor * 100)}% ${mood.humor > 0.7 ? '(playful, witty)' : mood.humor < 0.3 ? '(serious)' : '(occasional wit)'}
- Formality: ${Math.round(mood.formality * 100)}% ${mood.formality > 0.7 ? '(professional)' : mood.formality < 0.3 ? '(casual)' : '(semi-formal)'}
- Intensity: ${Math.round(mood.intensity * 100)}% ${mood.intensity > 0.7 ? '(passionate)' : mood.intensity < 0.3 ? '(calm)' : '(moderate energy)'}
- Romanticism: ${Math.round(mood.romanticism * 100)}% ${mood.romanticism > 0.7 ? '(affectionate, intimate)' : mood.romanticism < 0.3 ? '(platonic)' : '(friendly warmth)'}

Adjust your tone and approach to match these calibrations.`;
}
```

#### 2. Voice Mapping (`lib/voice.ts`)
```typescript
import { Mood, VoiceConfig } from '@/types';

export function getVoiceForMood(mood: Mood, userSelectedVoice?: string): VoiceConfig {
  if (userSelectedVoice) {
    return {
      voiceId: userSelectedVoice,
      settings: calculateSettingsForMood(mood),
    };
  }

  // High empathy + low directness = soft, nurturing
  if (mood.empathy > 0.7 && mood.directness < 0.4) {
    return {
      voiceId: 'pjcYQlDFKMbcOUp6F5GD',
      settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.20,
        use_speaker_boost: true,
        speed: 0.90,
      },
    };
  }

  // High directness + high intensity = energetic, direct
  if (mood.directness > 0.7 && mood.intensity > 0.7) {
    return {
      voiceId: 'KLZOWyG48RjZkAAjuM89',
      settings: {
        stability: 0.50,
        similarity_boost: 0.95,
        style: 0.70,
        use_speaker_boost: true,
        speed: 1.15,
      },
    };
  }

  // High romanticism = sultry, intimate
  if (mood.romanticism > 0.7) {
    return {
      voiceId: 'LEnmbrrxYsUYS7vsRRwD',
      settings: {
        stability: 0.60,
        similarity_boost: 0.85,
        style: 0.50,
        use_speaker_boost: true,
        speed: 0.95,
      },
    };
  }

  // Default Eve voice
  return {
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'ZF6FPAbjXT4488VcRRnw',
    settings: {
      stability: 0.50,
      similarity_boost: 0.75,
      style: 0.00,
      use_speaker_boost: true,
      speed: 1.00,
    },
  };
}

function calculateSettingsForMood(mood: Mood) {
  return {
    stability: 0.5 + (mood.formality * 0.3),
    similarity_boost: 0.75 + (mood.empathy * 0.2),
    style: mood.intensity * 0.5,
    use_speaker_boost: true,
    speed: 0.85 + (mood.intensity * 0.3),
  };
}
```

#### 3. Domain Detection (`lib/domain-detection.ts`)
```typescript
export function detectRelevantDomains(message: string): string[] {
  const domains = [];
  
  if (message.match(/INFJ|personality|Ni-dom|Fe|Ti|introvert|myers.brigg/i)) {
    domains.push('infj_psychology');
  }
  
  if (message.match(/art|artist|gallery|touche|touch[eé]|painting|exhibition|artwork/i)) {
    domains.push('touche_gallery');
  }
  
  return domains;
}
```

#### 4. Grok Parser (`lib/importers/grok.ts`)
```typescript
import { ImportedData, Conversation, Memory } from '@/types';

export class GrokParser {
  async parse(fileContent: string): Promise<ImportedData> {
    const conversations = this.parseMarkdown(fileContent);
    const memories = this.extractMemories(conversations);
    const personality = this.inferPersonality(conversations);
    
    return {
      conversations,
      memories,
      inferredPersonality: personality,
      metadata: {
        source: 'Grok',
        exportDate: new Date().toISOString(),
        messageCount: conversations.reduce((sum, c) => sum + c.messages.length, 0),
      },
    };
  }

  private parseMarkdown(content: string): Conversation[] {
    // Parse the Grok markdown format
    // Implementation here...
  }

  private extractMemories(conversations: Conversation[]): Memory[] {
    // Extract facts, preferences from conversations
    // Implementation here...
  }

  private inferPersonality(conversations: Conversation[]): string {
    // Analyze conversation style
    // Implementation here...
  }
}
```

### Friday Tasks:

#### 5. Main Chat Page (`app/page.tsx`)
- Age gate component
- Cookie banner
- Chat interface with mood controls
- Voice controls
- Message rendering
- Input handling

#### 6. Mood Component (`app/components/MoodControl.tsx`)
- 6 sliders (empathy, directness, etc.)
- Preset buttons
- Real-time updates

#### 7. Voice Component (`app/components/VoiceControl.tsx`)
- Auto/Locked toggle
- Voice selection dropdown
- Settings display

### Saturday Tasks:

#### 8. Import Flow (`app/components/ImportFlow.tsx`)
- File upload
- Parser detection
- Progress display
- Success/error handling

#### 9. Chat API (`app/api/chat/route.ts`)
- Accept message + mood + history
- Build prompt with mood overlay
- Detect relevant domains
- Fetch knowledge from INFJ/Touché tables
- Call OpenAI
- Extract memories
- Save conversation
- Return response

#### 10. Import API (`app/api/import/route.ts`)
- Accept uploaded file
- Detect format (Grok/ChatGPT)
- Parse data
- Create agent
- Import conversations
- Import memories

### Sunday Tasks:

#### 11. Privacy Controls
- Per-conversation privacy dropdown
- Batch privacy management

#### 12. Onboarding Flow (`app/onboarding/page.tsx`)
- Welcome screen
- Choice: Fresh vs Import
- Setup wizard

#### 13. Polish & Testing
- Mobile responsive
- Error handling
- Loading states
- Final QA

## 📂 File Structure You Need to Create

```
app/
├── layout.tsx              # Root layout with fonts, metadata
├── page.tsx                # Main chat interface
├── globals.css             # Tailwind imports
├── onboarding/
│   └── page.tsx           # New user flow
├── privacy/
│   └── page.tsx           # Privacy policy
├── terms/
│   └── page.tsx           # Terms of service
├── api/
│   ├── chat/
│   │   └── route.ts       # Chat endpoint
│   ├── import/
│   │   └── route.ts       # Import endpoint
│   ├── agent/
│   │   ├── create/route.ts
│   │   └── update/route.ts
│   └── voice/
│       └── route.ts
└── components/
    ├── AgeGate.tsx
    ├── CookieBanner.tsx
    ├── MoodControl.tsx
    ├── VoiceControl.tsx
    ├── ImportFlow.tsx
    ├── ChatMessage.tsx
    ├── ChatInput.tsx
    └── PrivacySettings.tsx
```

## 🎯 Priority Order

**Thursday:**
1. lib/mood.ts
2. lib/voice.ts
3. lib/domain-detection.ts
4. app/layout.tsx
5. app/globals.css

**Friday:**
6. app/components/MoodControl.tsx
7. app/components/VoiceControl.tsx
8. app/page.tsx (basic version)
9. app/api/chat/route.ts

**Saturday:**
10. lib/importers/grok.ts
11. app/components/ImportFlow.tsx
12. app/api/import/route.ts
13. Polish app/page.tsx

**Sunday:**
14. app/onboarding/page.tsx
15. Privacy/Terms pages
16. Testing
17. Deployment

## 💡 Code Templates Available

I can provide complete code for any of these files. Just ask:
- "Give me MoodControl.tsx"
- "Give me the chat API route"
- "Give me the main page.tsx"

Each file will be production-ready with:
- Full TypeScript types
- Error handling
- Loading states
- Mobile responsive
- Clean, modern UI (black/white/gray)

## 🚀 Getting Started NOW

1. Extract this ZIP
2. cd eve-v2
3. npm install
4. Run database migration (see DEPLOYMENT.md)
5. npm run dev
6. Start building! Ask me for any file you need.

Ready to code! 🔥
