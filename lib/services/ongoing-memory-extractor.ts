// lib/services/ongoing-memory-extractor.ts
// Extracts memories from ongoing conversations

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ExtractedMemory {
  type: 'fact' | 'preference' | 'experience' | 'context';
  content: string;
  category: string;
  tags: string[];
  importance_score: number;
  source: 'conversation';
  timestamp: string;
  context?: string;
}

export class OngoingMemoryExtractor {
  
  /**
   * Main entry point: Extract memories from recent conversation
   */
  static async extractFromConversation(
    messages: Message[],
    agentId: string,
    userId: string
  ): Promise<number> {
    console.log(`[Memory Extraction] Processing ${messages.length} messages for agent ${agentId}`);
    
    // Combine messages into context
    const context = messages
      .map(m => `${m.role === 'user' ? 'User' : 'EVE'}: ${m.content}`)
      .join('\n\n');
    
    // Extract using patterns
    const patternMemories = this.extractWithPatterns(context);
    
    // Save memories
    let savedCount = 0;
    for (const memory of patternMemories) {
      const saved = await this.saveMemory(memory, agentId, userId);
      if (saved) savedCount++;
    }
    
    console.log(`[Memory Extraction] Extracted ${savedCount} new memories`);
    return savedCount;
  }
  
  /**
   * Extract memories using pattern matching
   */
  private static extractWithPatterns(context: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    const timestamp = new Date().toISOString();
    
    // Pattern 1: Explicit facts
    memories.push(...this.extractFacts(context, timestamp));
    
    // Pattern 2: Preferences
    memories.push(...this.extractPreferences(context, timestamp));
    
    // Pattern 3: Experiences
    memories.push(...this.extractExperiences(context, timestamp));
    
    // Pattern 4: Current activities
    memories.push(...this.extractCurrentActivities(context, timestamp));
    
    // Pattern 5: Relationships
    memories.push(...this.extractRelationships(context, timestamp));
    
    // Deduplicate
    return this.deduplicateMemories(memories);
  }
  
  /**
   * Extract factual information
   */
  private static extractFacts(context: string, timestamp: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    
    // Name (more specific to avoid false positives)
    const namePattern = /(?:my name is|call me)\s+([A-Z][a-z]+)/gi;
    let match;
    while ((match = namePattern.exec(context)) !== null) {
      const name = match[1];
      // Exclude common verbs/words that might match
      const excludeWords = ['I', 'The', 'It', 'There', 'This', 'That', 'These', 'Those', 
                           'Going', 'Coming', 'Being', 'Having', 'Making', 'Taking',
                           'Getting', 'Doing', 'Saying', 'Looking', 'Trying', 'Using',
                           'Working', 'Calling', 'Asking', 'Feeling', 'Thinking', 'Knowing',
                           'Starting', 'Running', 'Moving', 'Living', 'Giving', 'Finding',
                           'Telling', 'Turning', 'Leaving', 'Bringing', 'Holding', 'Writing',
                           'Standing', 'Sitting', 'Showing', 'Hearing', 'Playing', 'Happening',
                           'Drawn', 'Seen', 'Done', 'Gone', 'Been', 'Had', 'Made', 'Said'];
      if (name && !excludeWords.includes(name)) {
        memories.push({
          type: 'fact',
          content: `Name: ${name}`,
          category: 'personal',
          tags: ['name', 'identity'],
          importance_score: 1.0,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Age
    const agePattern = /(?:I'm|I am)\s+(\d{1,2})\s+years?\s+old/gi;
    while ((match = agePattern.exec(context)) !== null) {
      const age = match[1];
      memories.push({
        type: 'fact',
        content: `Age: ${age} years old`,
        category: 'personal',
        tags: ['age', 'personal'],
        importance_score: 0.9,
        source: 'conversation',
        timestamp: timestamp
      });
    }
    
    // Location
    const locationPattern = /(?:I live in|I'm from|I'm based in|located in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|\n|$)/gi;
    while ((match = locationPattern.exec(context)) !== null) {
      const location = match[1]?.trim();
      if (location && location.length < 50) {
        memories.push({
          type: 'fact',
          content: `Location: ${location}`,
          category: 'personal',
          tags: ['location', 'home'],
          importance_score: 0.8,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Profession
    const professionPattern = /(?:I'm a|I am a|I work as|my job is)\s+([a-z\s]+?)(?:\.|,|\n|$)/gi;
    while ((match = professionPattern.exec(context)) !== null) {
      const profession = match[1]?.trim();
      if (profession && profession.length < 50 && profession.length > 3) {
        memories.push({
          type: 'fact',
          content: `Profession: ${profession}`,
          category: 'work',
          tags: ['work', 'career', 'profession'],
          importance_score: 0.85,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract preferences
   */
  private static extractPreferences(context: string, timestamp: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    
    // Music preferences
    const musicPattern = /(?:favorite song|favorite album|love listening to|obsessed with)\s+(?:is\s+)?["']?([^"'\n.!?]+?)["']?(?:\s+by\s+([A-Z][a-zA-Z\s&'.]+))?/gi;
    let match;
    while ((match = musicPattern.exec(context)) !== null) {
      const title = match[1]?.trim();
      const artist = match[2]?.trim();
      if (title && title.length < 100) {
        memories.push({
          type: 'preference',
          content: `Favorite music: "${title}"${artist ? ` by ${artist}` : ''}`,
          category: 'music',
          tags: ['music', 'favorite', title.toLowerCase()],
          importance_score: 0.8,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Favorite writer/author
    const favoriteWriterPattern = /(?:favorite|fav)\s+(?:writer|author)\s+(?:is\s+)?([A-Z][a-zA-Z\s.]+?)(?:\.|,|\n|$|who|whose)/gi;
    while ((match = favoriteWriterPattern.exec(context)) !== null) {
      const author = match[1]?.trim();
      if (author && author.length < 50 && author.length > 3) {
        memories.push({
          type: 'preference',
          content: `Favorite author: ${author}`,
          category: 'books',
          tags: ['books', 'author', 'literature', author.toLowerCase()],
          importance_score: 0.95,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Currently reading pattern
    const currentlyReadingPattern = /(?:reading|currently reading|just finished|just read)\s+["']?([A-Z][^"'\n.!?]+?)["']?(?:\s+by\s+([A-Z][a-zA-Z\s.]+))?(?:\.|,|\n|$)/gi;
    while ((match = currentlyReadingPattern.exec(context)) !== null) {
      const title = match[1]?.trim();
      const author = match[2]?.trim();
      if (title && title.length < 100 && title.length > 3) {
        memories.push({
          type: 'experience',
          content: `Reading: "${title}"${author ? ` by ${author}` : ''}`,
          category: 'books',
          tags: ['books', 'reading', 'current', title.toLowerCase()],
          importance_score: 0.8,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Favorite book by specific author pattern
    const favoriteByAuthorPattern = /(?:my\s+)?favorite\s+([A-Z][a-zA-Z\s.]+?)\s+(?:book|novel|work)\s+(?:is\s+)?["']?([^"'\n.!?]+?)["']?(?:\.|,|\n|$|too)/gi;
    while ((match = favoriteByAuthorPattern.exec(context)) !== null) {
      const author = match[1]?.trim();
      const title = match[2]?.trim();
      if (title && title.length < 100 && title.length > 3) {
        memories.push({
          type: 'preference',
          content: `Favorite ${author} book: "${title}"`,
          category: 'books',
          tags: ['books', 'favorite', 'literature', author.toLowerCase(), title.toLowerCase()],
          importance_score: 0.9,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Generic favorite book pattern
    const favoriteBookPattern = /(?:my\s+)?favorite\s+(?:book|novel)\s+(?:is\s+)?["']?([A-Z][^"'\n.!?]+?)["']?(?:\s+by\s+([A-Z][a-zA-Z\s.]+))?(?:\.|,|\n|$|too)/gi;
    while ((match = favoriteBookPattern.exec(context)) !== null) {
      const title = match[1]?.trim();
      const author = match[2]?.trim();
      if (title && title.length < 100 && title.length > 3) {
        memories.push({
          type: 'preference',
          content: `Favorite book: "${title}"${author ? ` by ${author}` : ''}`,
          category: 'books',
          tags: ['books', 'favorite', 'literature', title.toLowerCase()],
          importance_score: 0.9,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // "I love [book]" pattern
    const lovesBookPattern = /I\s+love\s+["']?([A-Z][A-Za-z\s]+?)["']?(?:\s+by\s+([A-Z][a-zA-Z\s.]+))?(?:\.|,|\n|$)/gi;
    while ((match = lovesBookPattern.exec(context)) !== null) {
      const title = match[1]?.trim();
      const author = match[2]?.trim();
      // Check if it's likely a book (capital letters, reasonable length)
      if (title && title.length < 100 && title.length > 3 && /^[A-Z]/.test(title)) {
        memories.push({
          type: 'preference',
          content: `Loves: "${title}"${author ? ` by ${author}` : ''}`,
          category: 'books',
          tags: ['books', 'favorite', title.toLowerCase()],
          importance_score: 0.85,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Favorite color
    const colorPattern = /(?:my\s+)?favorite\s+colou?r\s+(?:is\s+)?([a-z]+)/gi;
    while ((match = colorPattern.exec(context)) !== null) {
      const color = match[1]?.trim();
      if (color && color.length < 20) {
        memories.push({
          type: 'preference',
          content: `Favorite color: ${color}`,
          category: 'personal',
          tags: ['color', 'favorite', 'personal'],
          importance_score: 0.7,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Food preferences
    const foodPattern = /(?:favorite food|love eating|favorite restaurant|favorite dish)\s+(?:is\s+)?([^.!?\n]+)/gi;
    while ((match = foodPattern.exec(context)) !== null) {
      const food = match[1]?.trim();
      if (food && food.length < 50 && food.length > 3) {
        memories.push({
          type: 'preference',
          content: `Favorite food: ${food}`,
          category: 'personal',
          tags: ['food', 'favorite', 'preferences'],
          importance_score: 0.6,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // General likes (but exclude short phrases)
    const likePattern = /I (?:really\s+)?(?:love|enjoy|like)\s+([a-z][a-z\s]+?)(?:\.|,|!|\n|$)/gi;
    while ((match = likePattern.exec(context)) !== null) {
      const thing = match[1]?.trim();
      if (thing && thing.length < 50 && thing.length > 5 && !thing.includes('to ')) {
        memories.push({
          type: 'preference',
          content: `Enjoys: ${thing}`,
          category: 'personal',
          tags: ['preference', 'likes'],
          importance_score: 0.5,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract experiences
   */
  private static extractExperiences(context: string, timestamp: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    
    // Events attended
    const eventPattern = /(?:went to|attended|saw)\s+(?:a\s+)?([A-Z][a-zA-Z\s]+?)\s+(?:concert|show|event|festival)/gi;
    let match;
    while ((match = eventPattern.exec(context)) !== null) {
      const event = match[1]?.trim();
      if (event && event.length < 50) {
        memories.push({
          type: 'experience',
          content: `Attended: ${event} event`,
          category: 'experience',
          tags: ['event', 'experience', event.toLowerCase()],
          importance_score: 0.75,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    // Travel
    const travelPattern = /(?:visited|traveled to|went to|trip to)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|\n|$)/gi;
    while ((match = travelPattern.exec(context)) !== null) {
      const place = match[1]?.trim();
      if (place && place.length < 50 && place.length > 3) {
        memories.push({
          type: 'experience',
          content: `Traveled to: ${place}`,
          category: 'travel',
          tags: ['travel', 'experience', place.toLowerCase()],
          importance_score: 0.7,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract current activities
   */
  private static extractCurrentActivities(context: string, timestamp: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    
    // Projects
    const projectPattern = /(?:working on|building|creating|starting)\s+(?:a\s+)?([A-Z][a-zA-Z\s]+?)(?:\.|,|\n|$)/gi;
    let match;
    while ((match = projectPattern.exec(context)) !== null) {
      const project = match[1]?.trim();
      if (project && project.length < 50 && project.length > 3) {
        memories.push({
          type: 'context',
          content: `Current project: ${project}`,
          category: 'work',
          tags: ['work', 'project', 'current'],
          importance_score: 0.85,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract relationships
   */
  private static extractRelationships(context: string, timestamp: string): ExtractedMemory[] {
    const memories: ExtractedMemory[] = [];
    
    const relationshipPattern = /(?:my|met my)\s+(wife|husband|spouse|partner|girlfriend|boyfriend|daughter|son|child|mother|father|mom|dad|sister|brother)\s+([A-Z][a-z]+)/gi;
    let match;
    
    while ((match = relationshipPattern.exec(context)) !== null) {
      const relationship = match[1];
      const name = match[2];
      if (name && !['I', 'The', 'It', 'She', 'He'].includes(name)) {
        memories.push({
          type: 'context',
          content: `${name} (${relationship})`,
          category: 'relationship',
          tags: ['relationship', 'family', name.toLowerCase()],
          importance_score: 0.95,
          source: 'conversation',
          timestamp: timestamp
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Deduplicate similar memories
   */
  private static deduplicateMemories(memories: ExtractedMemory[]): ExtractedMemory[] {
    const seen = new Set<string>();
    const unique: ExtractedMemory[] = [];
    
    for (const memory of memories) {
      const key = memory.content.toLowerCase().replace(/[^\w\s]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(memory);
      }
    }
    
    return unique;
  }
  
  /**
   * Save memory to database with embedding
   */
  private static async saveMemory(
    memory: ExtractedMemory,
    agentId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: memory.content,
      });
      
      const embedding = embeddingResponse.data[0].embedding;
      
      // Check if similar memory already exists
      const { data: existing } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        filter_agent_id: agentId,
        match_threshold: 0.95,
        match_count: 1
      });
      
      if (existing && existing.length > 0) {
        console.log(`[Memory] Skipping duplicate: ${memory.content}`);
        return false;
      }
      
      // Save memory
      const { data, error } = await supabase
        .from('memories')
        .insert({
          agent_id: agentId,
          type: memory.type,
          content: memory.content,
          category: memory.category,
          tags: memory.tags,
          importance_score: memory.importance_score,
          embedding: embedding,
          privacy: 'private',
          mentioned_at: memory.timestamp,
          last_mentioned: memory.timestamp,
          mention_count: 1,
          metadata: {
            source: memory.source,
            extracted_at: new Date().toISOString(),
            context: memory.context
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('[Memory] Error saving:', error);
        return false;
      }
      
      console.log(`[Memory] Saved: ${memory.content}`);
      return true;
      
    } catch (error) {
      console.error('[Memory] Exception saving memory:', error);
      return false;
    }
  }
}
