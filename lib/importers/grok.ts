// lib/importers/grok.ts - Parser for Grok conversation exports

import { ImportedData, Conversation, Message } from '@/types';
import { ImportParser, extractFactsFromConversations, inferPersonalityFromConversations } from './base';

export class GrokParser implements ImportParser {
  name = 'Grok (X.AI)';
  supportedFormats = ['.md', '.json', '.txt'];

  async validate(fileContent: string): Promise<boolean> {
    // Check if it looks like a Grok export
    return (
      fileContent.includes('Grok') ||
      fileContent.includes('## User') ||
      fileContent.includes('## Grok') ||
      fileContent.includes('X.AI') ||
      fileContent.includes('grok.com')
    );
  }

  async parse(fileContent: string): Promise<ImportedData> {
    // Try to detect format (JSON vs Markdown)
    let conversations: Conversation[];
    
    if (fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
      conversations = this.parseJSON(fileContent);
    } else {
      conversations = this.parseMarkdown(fileContent);
    }

    const memories = extractFactsFromConversations(conversations);
    const personality = inferPersonalityFromConversations(conversations);

    return {
      conversations,
      memories,
      inferredPersonality: personality,
      metadata: {
        source: 'Grok',
        exportDate: new Date().toISOString(),
        messageCount: conversations.reduce((sum, c) => sum + c.messages.length, 0),
      },
    };
  }

  private parseMarkdown(content: string): Conversation[] {
    const conversations: Conversation[] = [];
    
    // Split by headers (## User or ## Grok)
    const lines = content.split('\n');
    let currentConversation: Conversation | null = null;
    let currentRole: 'user' | 'assistant' | null = null;
    let currentContent: string[] = [];

    const flushMessage = () => {
      if (currentRole && currentContent.length > 0 && currentConversation) {
        const message: Message = {
          role: currentRole,
          content: currentContent.join('\n').trim(),
          timestamp: new Date().toISOString(),
        };
        currentConversation.messages.push(message);
        currentContent = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect role headers
      if (line.match(/^##\s*(User|Grok)/i)) {
        flushMessage();
        
        const role = line.toLowerCase().includes('user') ? 'user' : 'assistant';
        
        // If we're starting a user message and don't have a conversation, create one
        if (role === 'user' && !currentConversation) {
          if (currentConversation) {
            conversations.push(currentConversation);
          }
          currentConversation = {
            id: crypto.randomUUID(),
            agent_id: '',
            user_id: '',
            messages: [],
            privacy: 'heir_only',
            started_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
        }

        currentRole = role;
      } else if (line.trim() && currentRole) {
        // Add content line
        currentContent.push(line);
      }
    }

    // Flush last message
    flushMessage();
    
    // Add last conversation
    if (currentConversation && currentConversation.messages.length > 0) {
      currentConversation.ended_at = new Date().toISOString();
      conversations.push(currentConversation);
    }

    return conversations;
  }

  private parseJSON(content: string): Conversation[] {
    try {
      const data = JSON.parse(content);
      
      // Handle different JSON structures
      if (Array.isArray(data)) {
        return data.map(conv => this.normalizeConversation(conv));
      } else if (data.conversations) {
        return data.conversations.map((conv: any) => this.normalizeConversation(conv));
      } else {
        // Single conversation
        return [this.normalizeConversation(data)];
      }
    } catch (error) {
      console.error('Error parsing Grok JSON:', error);
      return [];
    }
  }

  private normalizeConversation(data: any): Conversation {
    return {
      id: data.id || crypto.randomUUID(),
      agent_id: '',
      user_id: '',
      messages: (data.messages || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || msg.text || '',
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
      summary: data.summary,
      themes: data.themes,
      privacy: 'heir_only',
      started_at: data.started_at || data.created_at || new Date().toISOString(),
      ended_at: data.ended_at,
      created_at: data.created_at || new Date().toISOString(),
    };
  }
}
