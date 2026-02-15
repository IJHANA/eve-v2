// app/api/chat/route.ts - Chat API endpoint with mood-aware prompts and domain expertise

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { buildMoodPrompt } from '@/lib/mood';
import { detectRelevantDomains, getDomainRPCName, getDomainPrompt } from '@/lib/domain-detection';
import { OngoingMemoryExtractor } from '@/lib/services/ongoing-memory-extractor';

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

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // ===== RATE LIMITING CHECK =====
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('can_send_message', {
      p_user_id: userId
    });

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
    } else if (rateLimitCheck && rateLimitCheck.length > 0) {
      const check = rateLimitCheck[0];
      
      if (!check.allowed) {
        // Check if it's approval pending
        if (check.reason === 'Account pending approval') {
          return NextResponse.json(
            { error: 'APPROVAL_PENDING', message: 'Your account is awaiting approval' },
            { status: 403 }
          );
        }
        
        // Check if it's rate limit
        if (check.reason === 'Daily message limit reached') {
          return NextResponse.json(
            { error: 'RATE_LIMIT_DAILY', message: 'You have reached your daily message limit. Please try again tomorrow.' },
            { status: 429 }
          );
        }
        
        if (check.reason === 'Please wait before sending another message') {
          return NextResponse.json(
            { 
              error: 'RATE_LIMIT_COOLDOWN', 
              message: `Please wait ${check.wait_seconds} seconds before sending another message.`,
              waitSeconds: check.wait_seconds
            },
            { status: 429 }
          );
        }
      }
      
      console.log(`Rate limit check passed. Messages remaining today: ${check.messages_remaining}`);
    }

    // Load agent's personality from database
    let systemPrompt = '';
    let agentId = '';
    let responseLength = 'standard'; // default
    
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
      
      // Get user's response length preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('response_length')
        .eq('id', userId)
        .single();
      
      if (profile && profile.response_length) {
        responseLength = profile.response_length;
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

    // Add response length control
    const lengthInstructions = {
      brief: '\n\nRESPONSE LENGTH: Keep responses concise and under 100 words. Get straight to the point.',
      standard: '\n\nRESPONSE LENGTH: Keep responses focused and under 200 words unless the user specifically asks for more detail. Be concise but warm.',
      detailed: '\n\nRESPONSE LENGTH: You can provide detailed responses up to 400 words when appropriate. Balance depth with readability.',
      comprehensive: '\n\nRESPONSE LENGTH: No word limit. Provide comprehensive, thorough responses when the topic warrants it.'
    };
    
    systemPrompt += lengthInstructions[responseLength as keyof typeof lengthInstructions] || lengthInstructions.standard;

    // Fetch relevant memories if we have an agent
    if (agentId) {
      let memoriesAdded = false;
      
      // Check if this is a temporal query
      const isTemporalQuery = /(?:last|yesterday|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year)|in\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|2024|2025|2026)/i.test(message);
      
      if (isTemporalQuery) {
        try {
          console.log('Detected temporal query, using temporal search');
          const temporalResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/memories/temporal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message, agentId, userId })
          });
          
          if (temporalResponse.ok) {
            const { memories: temporalMemories } = await temporalResponse.json();
            
            if (temporalMemories && temporalMemories.length > 0) {
              const memoryText = temporalMemories
                .map((m: any) => `- ${m.content} (mentioned on ${new Date(m.mentioned_at).toLocaleDateString()})`)
                .join('\n');
              
              systemPrompt += `\n\nMEMORIES FROM THE REQUESTED TIME PERIOD:\n${memoryText}`;
              console.log(`✅ Added ${temporalMemories.length} temporal memories`);
              memoriesAdded = true;
            }
          }
        } catch (tempErr) {
          console.error('Temporal search failed, falling back to semantic:', tempErr);
        }
      }
      
      // If not temporal or temporal failed, use semantic search
      if (!memoriesAdded) {
      
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
      } // End of !memoriesAdded block
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

    // Log message usage for rate limiting
    if (userId && agentId) {
      try {
        await supabase.rpc('log_message_usage', {
          p_user_id: userId,
          p_agent_id: agentId,
          p_message_content: message.substring(0, 500), // Truncate for storage
          p_response_content: response.substring(0, 500),
          p_tokens_used: completion.usage?.total_tokens || null
        });
      } catch (logError) {
        console.error('Failed to log message usage:', logError);
        // Don't fail the request if logging fails
      }
    }

    // 🔥 NEW: Extract memories from conversation
    if (agentId && userId) {
      try {
        // Get current conversation history (last 10 messages)
        const conversationMessages = [
          ...history.slice(-9), // Last 9 from history
          { role: 'user', content: message }, // Current user message
          { role: 'assistant', content: response } // Current EVE response
        ];
        
        console.log(`[Memory Extraction] ===== DEBUG =====`);
        console.log(`[Memory Extraction] Total messages in history: ${history.length}`);
        console.log(`[Memory Extraction] Messages to process: ${conversationMessages.length}`);
        console.log(`[Memory Extraction] Agent ID: ${agentId}`);
        console.log(`[Memory Extraction] User ID: ${userId}`);
        
        // Only extract if we have 10+ messages
        if (conversationMessages.length >= 10) {
          console.log(`[Memory Extraction] ✅ TRIGGERING EXTRACTION for ${conversationMessages.length} messages`);
          
          // Extract in background (don't block response)
          OngoingMemoryExtractor.extractFromConversation(
            conversationMessages,
            agentId,
            userId
          ).then((count) => {
            console.log(`[Memory Extraction] ✅ SUCCESS - Extracted ${count} memories`);
          }).catch(err => {
            console.error('[Memory Extraction] ❌ FAILED:', err);
          });
        } else {
          console.log(`[Memory Extraction] ⏳ Waiting for more messages (need 10, have ${conversationMessages.length})`);
        }
      } catch (memExtractError) {
        // Don't fail the chat if memory extraction fails
        console.error('[Memory Extraction] ❌ Exception:', memExtractError);
      }
    } else {
      console.log('[Memory Extraction] ⚠️ Skipped - No agentId or userId');
      console.log(`[Memory Extraction] agentId: ${agentId}, userId: ${userId}`);
    }

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
