# Eve V2 - AI Companion Platform

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
1. Go to your Supabase project: https://xesdnhwiqkviompqkeal.supabase.co
2. Open SQL Editor
3. Copy and paste the entire contents of `database-migration.sql`
4. Run it
5. Verify: You should see new tables: agents, conversations, memories, knowledge_domains

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
1. Push code to your GitHub repo (eve-v2)
2. Connect repo to Vercel
3. Add environment variables (copy from .env.local)
4. Deploy!

## Project Structure

```
eve-v2/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main chat interface  
│   ├── onboarding/        # New user flow
│   ├── api/               # API routes
│   └── components/        # React components
├── lib/                   # Utilities
│   ├── supabase.ts       # Database client
│   ├── mood.ts           # Mood system
│   ├── voice.ts          # Voice mapping
│   └── importers/        # Import parsers
├── types/                # TypeScript types
└── public/               # Static assets
```

## Environment Variables

All set in `.env.local` - DO NOT commit this file!

## Database

Uses existing Supabase project with new tables:
- `agents` - User AI agents
- `conversations` - Chat history
- `memories` - Extracted memories
- `knowledge_domains` - Expertise areas (INFJ, Touché)

Keeps existing tables:
- `infj_knowledge` - INFJ psychology knowledge base
- `touche_knowledge` - Gallery artwork knowledge

## Features

- ✅ Mood-adaptive AI (6 sliders + presets)
- ✅ Voice changes with mood
- ✅ Import from Grok/ChatGPT
- ✅ Privacy controls for inheritance
- ✅ Domain expertise (INFJ, Touché)
- ✅ Full compliance (age gate, cookies, GDPR)

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- OpenAI GPT-4
- ElevenLabs TTS

## Support

Issues? Contact: [your email]

## License

Private - IJHANA © 2026
