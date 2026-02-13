// lib/importers/index.ts - Auto-detect and route to correct parser

import { ImportParser } from './base';
import { GrokParser } from './grok';
import { ChatGPTParser } from './chatgpt';

/**
 * All available parsers
 */
export const AVAILABLE_PARSERS: ImportParser[] = [
  new GrokParser(),
  new ChatGPTParser(),
];

/**
 * Auto-detect which parser to use based on file content
 */
export async function detectParser(fileContent: string): Promise<ImportParser | null> {
  for (const parser of AVAILABLE_PARSERS) {
    try {
      const isValid = await parser.validate(fileContent);
      if (isValid) {
        return parser;
      }
    } catch (error) {
      console.error(`Error validating with ${parser.name}:`, error);
    }
  }
  
  return null;
}

/**
 * Get parser by name
 */
export function getParserByName(name: string): ImportParser | null {
  return AVAILABLE_PARSERS.find(p => 
    p.name.toLowerCase().includes(name.toLowerCase())
  ) || null;
}

// Re-export parsers
export { GrokParser, ChatGPTParser };
export type { ImportParser };
