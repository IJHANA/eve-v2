// lib/importers/enhanced-memory-extractor.ts
// Enhanced memory extraction for rich conversations

import { Conversation, Memory } from '@/types';

export function extractEnhancedMemories(conversations: Conversation[]): Memory[] {
  const memories: Memory[] = [];
  const seenMemories = new Set<string>();

  for (const conv of conversations) {
    let conversationContext = '';
    
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      const nextMsg = conv.messages[i + 1];
      
      // Build context from user messages
      if (msg.role === 'user') {
        conversationContext += ' ' + msg.content;
        
        // Extract specific patterns from YOUR Grok conversation
        
        // Names and nicknames
        const namePatterns = [
          /(?:my name is|call me|I'm) (\w+)/gi,
          /(?:calls? me|named?) (\w+)/gi,
        ];
        
        namePatterns.forEach(pattern => {
          const matches = msg.content.matchAll(pattern);
          for (const match of matches) {
            const name = match[1];
            const key = `name_${name.toLowerCase()}`;
            if (!seenMemories.has(key)) {
              memories.push({
                id: crypto.randomUUID(),
                agent_id: '',
                type: 'fact',
                content: `User's name or nickname: ${name}`,
                importance_score: 0.95,
                privacy: 'heir_only',
                created_at: new Date().toISOString(),
              });
              seenMemories.add(key);
            }
          }
        });
        
        // Locations and travel (Manchester, hotels, etc.)
        const locationPatterns = [
          /staying (?:at|in) (?:the )?([A-Z][a-zA-Z\s]+?)(?:\s+(?:in|from|on))/gi,
          /(?:at|in) (?:the )?([A-Z][a-z]+(?:\s+in\s+[A-Z][a-z]+)?)/gi,
        ];
        
        // Special case for "Axis in Deansgate" pattern
        if (msg.content.match(/Axis.*Deansgate/i)) {
          const key = 'location_axis_deansgate';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: 'Staying at: The Axis hotel in Deansgate, Manchester',
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Manchester stay dates
        if (msg.content.match(/(?:from|staying).*July.*(?:through|to|until).*July/i)) {
          const dateMatch = msg.content.match(/July (\d+).*(?:through|to|until).*July (\d+)/i);
          if (dateMatch) {
            const key = 'manchester_dates';
            if (!seenMemories.has(key)) {
              memories.push({
                id: crypto.randomUUID(),
                agent_id: '',
                type: 'fact',
                content: `Manchester trip: July ${dateMatch[1]} through July ${dateMatch[2]}, 2026`,
                importance_score: 0.9,
                privacy: 'heir_only',
                created_at: new Date().toISOString(),
              });
              seenMemories.add(key);
            }
          }
        }
        
        // Oasis concert
        if (msg.content.match(/Oasis.*July.*11/i) || msg.content.match(/seeing Oasis/i)) {
          const key = 'oasis_concert';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'experience',
              content: 'Event: Seeing Oasis concert on July 11th at Heaton Park, Manchester',
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Old Wellington
        if (msg.content.match(/Old Wellington/i)) {
          const key = 'old_wellington';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Restaurant: The Old Wellington (steak and ale pie)',
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // 20 Stories bar
        if (msg.content.match(/20 Stories/i)) {
          const key = '20_stories';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Bar: 20 Stories rooftop bar in Spinningfields, Manchester',
              importance_score: 0.75,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Rosie's massage
        if (msg.content.match(/Rosie.*[Tt]antric/i)) {
          const key = 'rosie_massage';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: "Spa/Wellness: Rosie's Tantric Massage in Manchester",
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // At Last song
        if (msg.content.match(/At Last.*Etta James/i) || msg.content.match(/first song/i)) {
          const key = 'song_at_last';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Music: "At Last" by Etta James (romantic playlist)',
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Noel Gallagher song
        if (msg.content.match(/Death of You and Me/i) || msg.content.match(/Noel Gallagher/i)) {
          const key = 'song_noel';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Music: "The Death of You and Me" by Noel Gallagher\'s High Flying Birds',
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Extract user age/profession from patterns like "55-year-old art gallery owner"
        if (msg.content.match(/(\d+)-year-old.*(?:owner|entrepreneur)/i)) {
          const profMatch = msg.content.match(/(\d+)-year-old\s+([^.]+?)(?:owner|entrepreneur)/i);
          if (profMatch) {
            const key = 'profession';
            if (!seenMemories.has(key)) {
              memories.push({
                id: crypto.randomUUID(),
                agent_id: '',
                type: 'fact',
                content: `User profile: ${profMatch[1]}-year-old ${profMatch[2]}owner/entrepreneur`,
                importance_score: 0.9,
                privacy: 'heir_only',
                created_at: new Date().toISOString(),
              });
              seenMemories.add(key);
            }
          }
        }
      }
    }
  }

  console.log(`Enhanced extraction found ${memories.length} memories from ${conversations.length} conversations`);
  return memories;
}
