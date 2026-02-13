// lib/importers/chatgpt.ts - Parser for ChatGPT conversation exports

import { ImportedData, Conversation, Message } from '@/types';
import { ImportParser, extractFactsFromConversations, inferPersonalityFromConversations } from './base';

export class ChatGPTParser implements ImportParser {
  name = 'ChatGPT';
  supportedFormats = ['.json'];

  async validate(fileContent: string): Promise<boolean> {
    try {
      const data = JSON.parse(fileContent);
      // ChatGPT exports typically have a specific structure
      return (
        Array.isArray(data) ||
        (data && typeof data === 'object' && (data.title || data.mapping || data.create_time))
      );
    } catch {
      return false;
    }
  }

  async parse(fileContent: string): Promise<ImportedData> {
    const data = JSON.parse(fileContent);
    
    let conversations: Conversation[];
    
    if (Array.isArray(data)) {
      // Multiple conversations
      conversations = data.map(chat => this.parseChat(chat));
    } else {
      // Single conversation
      conversations = [this.parseChat(data)];
    }

    const memories = extractFactsFromConversations(conversations);
    const personality = inferPersonalityFromConversations(conversations);

    return {
      conversations,
      memories,
      inferredPersonality: personality,
      metadata: {
        source: 'ChatGPT',
        exportDate: new Date().toISOString(),
        messageCount: conversations.reduce((sum, c) => sum + c.messages.length, 0),
      },
    };
  }

  private parseChat(chat: any): Conversation {
    const messages: Message[] = [];
    
    // ChatGPT uses a "mapping" structure with nodes
    if (chat.mapping) {
      const messageMap = chat.mapping;
      const messageIds = Object.keys(messageMap);
      
      // Build message tree and extract linear conversation
      for (const id of messageIds) {
        const node = messageMap[id];
        
        if (node.message && node.message.content && node.message.content.parts) {
          const content = node.message.content.parts.join('\n');
          const role = node.message.author.role;
          
          if (content && (role === 'user' || role === 'assistant')) {
            messages.push({
              role: role === 'user' ? 'user' : 'assistant',
              content,
              timestamp: node.message.create_time 
                ? new Date(node.message.create_time * 1000).toISOString()
                : new Date().toISOString(),
            });
          }
        }
      }
      
      // Sort by timestamp
      messages.sort((a, b) => 
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
    } else if (chat.messages) {
      // Alternative structure
      for (const msg of chat.messages) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: typeof msg.content === 'string' ? msg.content : msg.content.parts?.join('\n') || '',
            timestamp: msg.timestamp || new Date().toISOString(),
          });
        }
      }
    }

    return {
      id: chat.id || crypto.randomUUID(),
      agent_id: '',
      user_id: '',
      messages,
      summary: chat.title || undefined,
      privacy: 'heir_only',
      started_at: chat.create_time 
        ? new Date(chat.create_time * 1000).toISOString()
        : new Date().toISOString(),
      ended_at: chat.update_time
        ? new Date(chat.update_time * 1000).toISOString()
        : undefined,
      created_at: new Date().toISOString(),
    };
  }
}
