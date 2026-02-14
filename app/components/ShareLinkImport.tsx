// app/components/ShareLinkImport.tsx - Import from share links

'use client';

import { useState } from 'react';
import { Link as LinkIcon, Loader } from 'lucide-react';

interface ShareLinkImportProps {
  onSuccess: (content: string) => void;
}

export default function ShareLinkImport({ onSuccess }: ShareLinkImportProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a share link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Detect platform
      let platform = 'unknown';
      if (url.includes('x.com') || url.includes('twitter.com') || url.includes('grok.com')) {
        platform = 'grok';
      } else if (url.includes('chat.openai.com')) {
        platform = 'chatgpt';
      } else if (url.includes('claude.ai')) {
        platform = 'claude';
      }

      let content = '';

      // For Grok, use client-side fetch since it requires cookies
      if (platform === 'grok') {
        try {
          const response = await fetch(url, {
            credentials: 'include', // Include cookies
          });

          if (!response.ok) {
            throw new Error('Unable to fetch Grok share link. Make sure you\'re logged into Grok/X in this browser.');
          }

          const html = await response.text();
          
          // Parse the HTML client-side
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extract conversation from Grok's HTML structure
          const messages: string[] = [];
          
          // Try different selectors Grok might use
          const messageElements = doc.querySelectorAll(
            '[data-testid*="message"], [class*="message"], article, [role="article"]'
          );
          
          messageElements.forEach((el, i) => {
            const text = el.textContent?.trim();
            if (text && text.length > 20) {
              const role = i % 2 === 0 ? 'User' : 'Grok';
              messages.push(`## ${role}\n\n${text}\n`);
            }
          });

          if (messages.length === 0) {
            throw new Error('Could not extract messages from Grok share link. The page structure may have changed.');
          }

          content = messages.join('\n');
          
        } catch (err: any) {
          throw new Error(`Grok import failed: ${err.message}. Try copying the conversation text directly instead.`);
        }
      } else {
        // For other platforms, use server-side API
        const response = await fetch('/api/import-from-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, platform }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to import from link');
        }

        const data = await response.json();
        content = data.content;
      }

      // Pass the extracted content to parent
      onSuccess(content);

    } catch (err: any) {
      setError(err.message || 'Failed to import from share link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Import from Share Link</h3>
        <p className="text-sm text-gray-600 mb-4">
          Paste a public share link from Grok, ChatGPT, or Claude
        </p>
      </div>

      {/* Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Example links:</p>
        <ul className="space-y-1 text-gray-600">
          <li>• Grok: https://grok.com/share/...</li>
          <li>• ChatGPT: https://chat.openai.com/share/...</li>
          <li>• Claude: https://claude.ai/share/...</li>
        </ul>
        
        <div className="mt-3 pt-3 border-t border-gray-300">
          <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded">
            <strong>Note for Grok:</strong> Make sure you're logged into Grok/X.com in this browser before importing.
          </p>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://x.com/i/grok/share/..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          disabled={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={loading || !url.trim()}
        className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <LinkIcon size={20} />
            Import from Link
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Only public share links work. Private conversations cannot be imported via link.
      </p>
    </div>
  );
}
