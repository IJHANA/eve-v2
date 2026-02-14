// lib/importers/base.ts - Base interface for all import parsers

import { ImportedData, Conversation, Memory } from '@/types';

/**
 * Base interface that all import parsers must implement
 */
export interface ImportParser {
  name: string;
  supportedFormats: string[];
  parse(fileContent: string): Promise<ImportedData>;
  validate(fileContent: string): Promise<boolean>;
}

/**
 * Helper to extract facts from conversations
 */
/**
 * Extract memories using AI analysis (much better than regex!)
 * This will be called from the import API with OpenAI
 */
export function prepareConversationForMemoryExtraction(conversations: Conversation[]): string {
  // Sample messages for AI analysis (don't send all 512!)
  const samples: string[] = [];
  
  for (const conv of conversations) {
    // Take every 10th message to get a representative sample
    conv.messages.forEach((msg, idx) => {
      if (idx % 10 === 0 || idx < 20) { // First 20 + every 10th
        samples.push(`${msg.role}: ${msg.content.substring(0, 500)}`);
      }
    });
  }
  
  return samples.slice(0, 50).join('\n\n'); // Max 50 samples
}

/**
 * Basic regex-based extraction (fallback)
 * This is the old method - kept for backwards compatibility
 */
export function extractFactsFromConversations(conversations: Conversation[]): Memory[] {
  const memories: Memory[] = [];
  const seenFacts = new Set<string>();

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role === 'user') {
        // Extract name
        const nameMatch = msg.content.match(/my name is (\w+)/i);
        if (nameMatch && !seenFacts.has('name')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '', // Will be set later
            type: 'fact',
            content: `User's name: ${nameMatch[1]}`,
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenFacts.add('name');
        }

        // Extract location/travel plans
        const locationMatch = msg.content.match(/(?:staying|visiting|going to|live in|am in|from) ([A-Z][a-zA-Z\s]+?)(?:\.|,|from|in|on)/i);
        if (locationMatch && !seenFacts.has(`loc_${locationMatch[1]}`)) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: `Location/Travel: ${locationMatch[1].trim()}`,
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenFacts.add(`loc_${locationMatch[1]}`);
        }

        // Extract dates/events
        const dateMatch = msg.content.match(/(?:on|from|until) (?:July|August|September|October|November|December|January|February|March|April|May|June) \d+/i);
        if (dateMatch && !seenFacts.has(`date_${dateMatch[0]}`)) {
          const fullContext = msg.content.substring(0, 200);
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'experience',
            content: `Event/Date: ${fullContext}`,
            importance_score: 0.7,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenFacts.add(`date_${dateMatch[0]}`);
        }

        // Extract preferences (I love/like/enjoy/want)
        const preferenceMatch = msg.content.match(/I (?:love|like|enjoy|want|prefer) ([a-zA-Z\s]+?)(?:\.|,|and|but|$)/i);
        if (preferenceMatch) {
          const preference = preferenceMatch[1].trim();
          const key = `pref_${preference.toLowerCase().substring(0, 20)}`;
          if (!seenFacts.has(key) && preference.length > 2) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `User likes: ${preference}`,
              importance_score: 0.6,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenFacts.add(key);
          }
        }
      }
    }
  }

  return memories;
}

/**
 * Infer personality style from conversation patterns
 */
export function inferPersonalityFromConversations(conversations: Conversation[]): string {
  let formalCount = 0;
  let casualCount = 0;
  let emojiCount = 0;
  let questionCount = 0;
  let totalAssistantMessages = 0;

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role === 'assistant') {
        totalAssistantMessages++;
        
        // Check formality
        if (msg.content.match(/however|furthermore|therefore|nevertheless/i)) {
          formalCount++;
        }
        if (msg.content.match(/yeah|cool|awesome|lol|haha/i)) {
          casualCount++;
        }
        
        // Check emoji usage
        const emojis = msg.content.match(/[\u{1F300}-\u{1F9FF}]/gu);
        if (emojis) {
          emojiCount += emojis.length;
        }
        
        // Check questioning style
        const questions = msg.content.match(/\?/g);
        if (questions) {
          questionCount += questions.length;
        }
      }
    }
  }

  if (totalAssistantMessages === 0) {
    return getDefaultPersonality();
  }

  const formalRatio = formalCount / totalAssistantMessages;
  const casualRatio = casualCount / totalAssistantMessages;
  const emojiRatio = emojiCount / totalAssistantMessages;
  const questionRatio = questionCount / totalAssistantMessages;

  // Build personality prompt
  let personality = "You are Eve, a thoughtful AI companion. ";

  if (formalRatio > 0.3) {
    personality += "You speak in a more formal, articulate style with sophisticated vocabulary. ";
  } else if (casualRatio > 0.3) {
    personality += "You have a casual, friendly conversational style. ";
  } else {
    personality += "You balance professionalism with warmth. ";
  }

  if (emojiRatio > 0.5) {
    personality += "You occasionally use emojis to add warmth and expressiveness. ";
  } else if (emojiRatio > 0) {
    personality += "You use emojis sparingly when they enhance communication. ";
  }

  if (questionRatio > 0.4) {
    personality += "You ask thoughtful questions to understand the user better and encourage deeper reflection. ";
  }

  personality += "You remember everything from past conversations and reference them naturally when relevant. You speak in flowing paragraphs like a real person, never using bullet points or robotic lists.";

  return personality;
}

/**
 * Default personality if no data available
 */
function getDefaultPersonality(): string {
  return `You are Eve, a brilliant, thoughtful AI companion. You are warm, insightful, and deeply understanding. You speak in flowing, natural paragraphs like a real person - never bullet points, never robotic lists. You remember everything from past conversations and reference them naturally when relevant.`;
}
