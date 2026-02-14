// app/api/import-from-link/route.ts - Fetch and parse share links

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the share link
    let content = '';
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      
      // Parse based on platform
      if (platform === 'grok' || url.includes('x.com') || url.includes('twitter.com')) {
        content = parseGrokShareLink(html);
      } else if (platform === 'chatgpt' || url.includes('chat.openai.com')) {
        content = parseChatGPTShareLink(html);
      } else if (platform === 'claude' || url.includes('claude.ai')) {
        content = parseClaudeShareLink(html);
      } else {
        // Generic extraction - try to find conversation-like content
        content = parseGenericShareLink(html);
      }

      if (!content || content.length < 50) {
        throw new Error('Could not extract conversation content from this link');
      }

    } catch (fetchError: any) {
      console.error('Error fetching share link:', fetchError);
      throw new Error('Unable to access this share link. Make sure it is publicly accessible.');
    }

    return NextResponse.json({ 
      content,
      platform: platform || 'unknown',
    });

  } catch (error: any) {
    console.error('Import from link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import from link' },
      { status: 500 }
    );
  }
}

/**
 * Parse Grok share link HTML
 */
function parseGrokShareLink(html: string): string {
  // Grok share links typically have messages in specific div structures
  // Extract text between message markers
  
  let content = '';
  
  // Try to find JSON data in the HTML (Grok often embeds it)
  const jsonMatch = html.match(/<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({.+?})<\/script>/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      // Navigate to conversation data and extract messages
      // This structure may vary - adapt as needed
      const messages = extractMessagesFromJSON(data);
      if (messages.length > 0) {
        content = messages.map((msg: any, i: number) => {
          const role = msg.role || (i % 2 === 0 ? 'User' : 'Grok');
          return `## ${role}\n\n${msg.content}\n`;
        }).join('\n');
      }
    } catch (e) {
      console.error('Error parsing Grok JSON:', e);
    }
  }

  // Fallback: Extract from HTML structure
  if (!content) {
    const messageRegex = /<div[^>]*class="[^"]*message[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    let messageIndex = 0;
    
    while ((match = messageRegex.exec(html)) !== null) {
      const text = stripHTML(match[1]).trim();
      if (text.length > 10) {
        const role = messageIndex % 2 === 0 ? 'User' : 'Grok';
        content += `## ${role}\n\n${text}\n\n`;
        messageIndex++;
      }
    }
  }

  return content;
}

/**
 * Parse ChatGPT share link HTML
 */
function parseChatGPTShareLink(html: string): string {
  let content = '';

  // ChatGPT embeds conversation data in __NEXT_DATA__
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const conversation = data?.props?.pageProps?.serverResponse?.data;
      
      if (conversation) {
        // Extract messages from ChatGPT's data structure
        const messages = extractChatGPTMessages(conversation);
        content = messages.map((msg: any) => {
          const role = msg.author?.role === 'user' ? 'User' : 'Assistant';
          const text = msg.content?.parts?.join('\n') || '';
          return `## ${role}\n\n${text}\n`;
        }).join('\n');
      }
    } catch (e) {
      console.error('Error parsing ChatGPT JSON:', e);
    }
  }

  return content;
}

/**
 * Parse Claude share link HTML
 */
function parseClaudeShareLink(html: string): string {
  // Claude's share format - extract conversation from HTML or JSON
  let content = '';
  
  // Try to find embedded JSON
  const dataMatch = html.match(/window\.__CLAUDE_DATA__\s*=\s*({[\s\S]+?});/);
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      // Extract messages
      const messages = data.messages || data.conversation?.messages || [];
      content = messages.map((msg: any, i: number) => {
        const role = msg.sender === 'human' ? 'User' : 'Claude';
        return `## ${role}\n\n${msg.text}\n`;
      }).join('\n');
    } catch (e) {
      console.error('Error parsing Claude JSON:', e);
    }
  }

  return content;
}

/**
 * Generic parser for unknown share links
 */
function parseGenericShareLink(html: string): string {
  // Strip HTML and extract meaningful text
  const text = stripHTML(html);
  
  // Try to identify conversation patterns
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Format as simple conversation
  return lines.map((line, i) => {
    const role = i % 2 === 0 ? 'User' : 'Assistant';
    return `## ${role}\n\n${line}\n`;
  }).join('\n');
}

/**
 * Helper: Strip HTML tags
 */
function stripHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper: Extract messages from JSON structure
 */
function extractMessagesFromJSON(data: any): any[] {
  // Recursively search for message-like structures
  const messages: any[] = [];
  
  function search(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(search);
    } else {
      // Look for message indicators
      if (obj.content || obj.text || obj.message) {
        messages.push(obj);
      }
      Object.values(obj).forEach(search);
    }
  }
  
  search(data);
  return messages;
}

/**
 * Helper: Extract ChatGPT messages specifically
 */
function extractChatGPTMessages(conversation: any): any[] {
  const messages: any[] = [];
  
  if (conversation.mapping) {
    Object.values(conversation.mapping).forEach((node: any) => {
      if (node.message && node.message.content) {
        messages.push(node.message);
      }
    });
  }
  
  return messages.sort((a, b) => {
    const timeA = a.create_time || 0;
    const timeB = b.create_time || 0;
    return timeA - timeB;
  });
}
