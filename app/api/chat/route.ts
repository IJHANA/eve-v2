// app/api/chat/route.ts - Chat API endpoint with mood-aware prompts and domain expertise

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { buildMoodPrompt } from '@/lib/mood';
import { detectRelevantDomains, getDomainRPCName, getDomainPrompt } from '@/lib/domain-detection';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], mood, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build base prompt
    let systemPrompt = `You are Eve, a brilliant, thoughtful AI companion. You are warm, insightful, and deeply understanding. You speak in flowing, natural paragraphs like a real person - never bullet points, never robotic lists. You remember everything from past conversations and reference them naturally when relevant.`;

    // Add mood overlay
    if (mood) {
      systemPrompt += '\n\n' + buildMoodPrompt(mood);
    }

    // Detect relevant knowledge domains
    const domains = detectRelevantDomains(message);
    
    // Fetch domain-specific knowledge
    for (const domain of domains) {
      // Add domain-specific prompt
      systemPrompt += '\n\n' + getDomainPrompt(domain);

      // Fetch relevant knowledge via RAG
      try {
        const embedding = await getEmbedding(message);
        const rpcName = getDomainRPCName(domain);
        
        const { data: knowledge, error } = await supabase.rpc(rpcName, {
          query_embedding: embedding,
          match_threshold: 0.78,
          match_count: 5,
        });

        if (!error && knowledge && knowledge.length > 0) {
          const knowledgeText = knowledge
            .map((k: any) => `${k.title || ''}: ${k.content}`)
            .join('\n\n');
          
          systemPrompt += `\n\nRELEVANT KNOWLEDGE:\n${knowledgeText}`;
        }
      } catch (err) {
        console.error(`Error fetching ${domain} knowledge:`, err);
      }
    }

    // Build messages array for OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "I'm here with you.";

    // TODO: Save conversation to database
    // TODO: Extract memories from conversation

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate embedding for semantic search
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}
