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

    // Load agent's personality from database
    let systemPrompt = '';
    let agentId = '';
    
    if (userId) {
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id, core_prompt, name')
        .eq('user_id', userId)
        .eq('type', 'personal')
        .single();
      
      console.log('Loaded agent:', { name: agent?.name, hasPrompt: !!agent?.core_prompt });
      
      if (agent) {
        agentId = agent.id;
        
        if (agent.core_prompt) {
          systemPrompt = agent.core_prompt;
        } else {
          // Fallback to default if no custom prompt
          systemPrompt = `You are ${agent.name || 'Eve'}, a brilliant, thoughtful AI companion. You are warm, insightful, and deeply understanding. You speak in flowing, natural paragraphs like a real person - never bullet points, never robotic lists. You remember everything from past conversations and reference them naturally when relevant.`;
          console.log('Using fallback prompt for:', agent.name || 'Eve');
        }
      }
    } else {
      // No userId - use default
      systemPrompt = `You are Eve, a brilliant, thoughtful AI companion. You are warm, insightful, and deeply understanding. You speak in flowing, natural paragraphs like a real person - never bullet points, never robotic lists. You remember everything from past conversations and reference them naturally when relevant.`;
      console.log('No userId provided, using default Eve prompt');
    }
    
    // Add temporal awareness
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    systemPrompt += `\n\nIMPORTANT: Today's date is ${currentDate}. When referencing events from memories, use past tense for dates before today and future tense for dates after today. For example, if a concert happened in July 2025 and it's now February 2026, refer to it as "we saw" or "we went to" (past tense), not "we're seeing" (future tense).`;

    // Fetch relevant memories if we have an agent
    if (agentId) {
      let memoriesAdded = false;
      
      try {
        // Get embedding for the message
        console.log('Generating embedding for query:', message.substring(0, 100));
        const embedding = await getEmbedding(message);
        console.log('Embedding generated, length:', embedding.length);
        
        if (embedding.length > 0) {
          // Search for relevant memories using semantic similarity
          console.log('Searching memories for agent:', agentId);
          const { data: memories, error: memError } = await supabase.rpc('match_memories', {
            query_embedding: embedding,
            filter_agent_id: agentId,
            match_threshold: 0.70,
            match_count: 10,
          });

          console.log('Semantic search result:', { 
            found: memories?.length || 0, 
            error: memError?.message,
            memories: memories?.map((m: any) => ({ content: m.content.substring(0, 50), similarity: m.similarity }))
          });

          if (!memError && memories && memories.length > 0) {
            const memoryText = memories
              .map((m: any) => `- ${m.content}`)
              .join('\n');
            
            systemPrompt += `\n\nRELEVANT MEMORIES FROM PAST CONVERSATIONS:\n${memoryText}`;
            console.log(`✅ Added ${memories.length} memories via semantic search`);
            memoriesAdded = true;
          } else if (memError) {
            console.log('❌ Semantic search error:', memError.message);
          } else {
            console.log('⚠️ Semantic search found 0 relevant memories');
          }
        } else {
          console.log('❌ Failed to generate embedding');
        }
      } catch (err) {
        console.error('❌ Error fetching memories:', err);
      }
      
      // FALLBACK: If semantic search returned nothing, load top memories by importance
      if (!memoriesAdded) {
        try {
          console.log('🔄 Using fallback: loading top memories by importance');
          const { data: topMemories, error: fallbackError } = await supabase
            .from('memories')
            .select('content, type, importance_score')
            .eq('agent_id', agentId)
            .order('importance_score', { ascending: false })
            .limit(15);
          
          console.log('Fallback result:', { 
            found: topMemories?.length || 0, 
            error: fallbackError?.message 
          });
          
          if (topMemories && topMemories.length > 0) {
            const memoryText = topMemories
              .map((m: any) => `- ${m.content}`)
              .join('\n');
            
            systemPrompt += `\n\nKEY MEMORIES FROM PAST CONVERSATIONS:\n${memoryText}`;
            console.log(`✅ Added ${topMemories.length} memories via fallback`);
          } else {
            console.log('❌ No memories found even in fallback!');
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback memory loading failed:', fallbackErr);
        }
      }
    } else {
      console.log('❌ No agentId - cannot load memories');
    }

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
