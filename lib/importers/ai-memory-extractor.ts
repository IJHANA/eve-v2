// lib/importers/ai-memory-extractor.ts - AI-powered memory extraction using Claude API

import Anthropic from '@anthropic-ai/sdk';
import type { Conversation, Memory } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ExtractedMemory {
  content: string;
  type: 'fact' | 'preference' | 'experience' | 'context';
  importance_score: number;
  category?: string;
}

/**
 * AI-powered memory extraction using Claude
 * Analyzes conversation chunks to extract rich, contextual memories
 */
export async function extractMemoriesWithAI(
  conversations: Conversation[],
  chunkSize: number = 100
): Promise<Memory[]> {
  const allMemories: Memory[] = [];
  const seenContents = new Set<string>();

  console.log(`Starting AI memory extraction for ${conversations.length} conversations...`);

  for (const conv of conversations) {
    const messages = conv.messages;
    
    // Process in chunks to avoid token limits
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      
      try {
        console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(messages.length / chunkSize)} (${chunk.length} messages)`);
        
        const extractedMemories = await extractFromChunk(chunk);
        
        // Deduplicate and add to collection
        for (const mem of extractedMemories) {
          const contentKey = mem.content.toLowerCase().trim();
          if (!seenContents.has(contentKey)) {
            allMemories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: mem.type,
              content: mem.content,
              importance_score: mem.importance_score,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenContents.add(contentKey);
          }
        }
        
        // Rate limiting: wait 1 second between chunks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing chunk ${i}-${i + chunkSize}:`, error);
        // Continue with next chunk even if one fails
      }
    }
  }

  console.log(`AI extraction complete: ${allMemories.length} memories extracted`);
  return allMemories;
}

/**
 * Extract memories from a single chunk of messages
 */
async function extractFromChunk(messages: any[]): Promise<ExtractedMemory[]> {
  // Format messages for Claude
  const conversationText = messages
    .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `You are analyzing a conversation to extract meaningful, intimate memories about the user.

Extract memories that capture:
1. **Personal details**: Facts about their life, work, home, relationships
2. **Cultural preferences**: Favorite artists, books, movies, music (be SPECIFIC - include full names, titles, album names)
3. **Intimate moments**: Dreams, feelings, trust issues, personal dynamics
4. **Locations & places**: Specific venues, parks, addresses, cities they mention
5. **Equipment & objects**: Cameras, cars, specific items they own or use
6. **Relationship context**: How they relate to people (M, baby girl dynamics, etc.)
7. **Artistic references**: Painters, poets, color theories, photography styles
8. **Nuanced preferences**: Not just "likes music" but "loves Psychocandy by The Jesus and Mary Chain, calls it one of the greatest albums"

Be SPECIFIC and COMPLETE. Include full context:
- "Favorite artist: JMW Turner (British painter, loves his light effects and seascapes)"
- "Music: 'Just Like Honey' by The Jesus and Mary Chain from Psychocandy album (1985)"
- "Camera: Fuji X100VI for Fräulein-style photography"
- "Personal dynamic: Calls partner 'baby girl' in intimate moments"

Avoid generic memories like:
❌ "User likes music"
❌ "User enjoys art"
❌ "User has trust issues"

Instead:
✅ "Music: Loves The Jesus and Mary Chain's Psychocandy album, especially 'Just Like Honey'"
✅ "Favorite artist: JMW Turner - ran art gallery for 30 years, Turner is favorite painter"
✅ "Trust issues with M - ongoing personal matter discussed in conversation"

Return ONLY a JSON array of memories. Each memory should have:
{
  "content": "specific, complete memory with full context",
  "type": "fact" | "preference" | "experience" | "context",
  "importance_score": 0.0-1.0,
  "category": "music" | "art" | "personal" | "location" | "relationship" | "literature" | "equipment" | etc.
}

CONVERSATION:
${conversationText}

Return 10-30 memories from this chunk. Focus on quality and specificity over quantity.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const memories: ExtractedMemory[] = JSON.parse(jsonText);
    
    // Validate and filter
    return memories.filter(mem => 
      mem.content && 
      mem.content.length > 10 && 
      mem.content.length < 500 &&
      mem.type &&
      mem.importance_score >= 0 &&
      mem.importance_score <= 1
    );

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return [];
  }
}

/**
 * Merge AI-extracted memories with pattern-based memories
 * Deduplicates by content similarity
 */
export function mergeMemories(aiMemories: Memory[], patternMemories: Memory[]): Memory[] {
  const merged: Memory[] = [...patternMemories];
  const existingContents = new Set(
    patternMemories.map(m => m.content.toLowerCase().trim())
  );

  for (const aiMem of aiMemories) {
    const contentKey = aiMem.content.toLowerCase().trim();
    
    // Check for exact duplicates
    if (existingContents.has(contentKey)) {
      continue;
    }

    // Check for similar content (simple substring check)
    const isDuplicate = Array.from(existingContents).some(existing => 
      existing.includes(contentKey) || contentKey.includes(existing)
    );

    if (!isDuplicate) {
      merged.push(aiMem);
      existingContents.add(contentKey);
    }
  }

  console.log(`Merged memories: ${patternMemories.length} pattern + ${aiMemories.length} AI = ${merged.length} total`);
  return merged;
}
