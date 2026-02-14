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
 * DEPRECATED: Now using enhanced-memory-extractor.ts instead
 * Kept for backwards compatibility but returns empty array
 */
export function extractFactsFromConversations(conversations: Conversation[]): Memory[] {
  // Return empty - using enhanced extractor instead
  return [];
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
