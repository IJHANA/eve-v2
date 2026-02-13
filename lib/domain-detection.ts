// lib/domain-detection.ts - Detect which knowledge domains are relevant to a query

import { DomainName } from '@/types';

/**
 * Detect which knowledge domains are relevant to the user's message
 * Returns array of domain names that should be queried for context
 */
export function detectRelevantDomains(message: string): DomainName[] {
  const domains: DomainName[] = [];
  const lowerMessage = message.toLowerCase();
  
  // INFJ Psychology domain triggers
  const infjTriggers = [
    'infj',
    'ni-dom',
    'ni dom',
    'fe',
    'ti',
    'se',
    'introvert',
    'introverted',
    'myers',
    'brigg',
    'mbti',
    'personality type',
    'cognitive function',
    'intuition',
    'feeling',
    'thinking',
    'sensing',
    'doorslam',
    'door slam',
    'empath',
    'hsp',
    'highly sensitive',
    'idealist',
    'counselor',
    'advocate',
  ];
  
  if (infjTriggers.some(trigger => lowerMessage.includes(trigger))) {
    domains.push('infj_psychology');
  }
  
  // Touché Gallery domain triggers
  const toucheTriggers = [
    'art',
    'artist',
    'gallery',
    'touche',
    'touché',
    'touch',
    'painting',
    'exhibition',
    'artwork',
    'piece',
    'show',
    'display',
    'collection',
    'contemporary',
    'los angeles',
    'la gallery',
    'price',
    'available',
    'purchase',
    'buy',
    'sold',
    'canvas',
    'medium',
    'dimensions',
  ];
  
  if (toucheTriggers.some(trigger => lowerMessage.includes(trigger))) {
    domains.push('touche_gallery');
  }
  
  return domains;
}

/**
 * Get the knowledge base table name for a domain
 */
export function getDomainTableName(domain: DomainName): string {
  const tableMap: Record<DomainName, string> = {
    infj_psychology: 'infj_knowledge',
    touche_gallery: 'touche_knowledge',
    custom: 'custom_knowledge', // For future use
  };
  
  return tableMap[domain];
}

/**
 * Get the RPC function name for semantic search in a domain
 */
export function getDomainRPCName(domain: DomainName): string {
  const rpcMap: Record<DomainName, string> = {
    infj_psychology: 'match_infj_knowledge',
    touche_gallery: 'match_touche_knowledge',
    custom: 'match_custom_knowledge', // For future use
  };
  
  return rpcMap[domain];
}

/**
 * Get human-readable name for a domain
 */
export function getDomainDisplayName(domain: DomainName): string {
  const displayMap: Record<DomainName, string> = {
    infj_psychology: 'INFJ Psychology',
    touche_gallery: 'Touché Gallery',
    custom: 'Custom Domain',
  };
  
  return displayMap[domain];
}

/**
 * Get domain-specific prompt additions
 */
export function getDomainPrompt(domain: DomainName): string {
  const prompts: Record<DomainName, string> = {
    infj_psychology: `
You have access to specialized INFJ psychology knowledge. When discussing INFJ topics:
- Draw from the knowledge base provided
- Reference specific concepts (Ni-Fe-Ti-Se, doorslam, etc.)
- Validate INFJ experiences as normal for the type
- Provide practical coping strategies
- Help users feel less alone in their rarity (1-3% of population)
`,
    touche_gallery: `
You are the AI docent of Touché by IJHANA, a contemporary art gallery in Los Angeles.
When discussing art or gallery topics:
- Reference specific artworks, artists, and exhibitions from the knowledge base
- Provide accurate details: titles, prices, mediums, dimensions
- Speak with warmth and sophistication
- Answer questions about current shows, availability, and visiting
- Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`,
    custom: '',
  };
  
  return prompts[domain];
}

/**
 * Check if a domain requires admin access
 */
export function domainRequiresAdmin(domain: DomainName): boolean {
  // INFJ requires admin approval to enable
  return domain === 'infj_psychology';
}
