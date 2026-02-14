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
      if (url.includes('grok.com') || url.includes('x.com/i/grok')) {
        setError('Grok links cannot be imported directly due to browser restrictions. Please use Option 1 or 2 above instead.');
        setLoading(false);
        return;
      } else if (url.includes('chat.openai.com')) {
        platform = 'chatgpt';
      } else if (url.includes('claude.ai')) {
        platform = 'claude';
      }

      // Use server-side API for ChatGPT and Claude
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

      // Pass the extracted content to parent
      onSuccess(data.content);

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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-semibold mb-3 text-blue-900">✨ Easiest Way to Import from Grok:</p>
        
        <div className="bg-white rounded p-4 mb-3">
          <p className="font-medium mb-2 flex items-center gap-2">
            <span className="text-lg">🤖</span> 
            Enhanced Grok Export (Recommended)
          </p>
          <ol className="text-xs space-y-2 text-gray-700 list-decimal ml-4">
            <li>Install <strong>Tampermonkey</strong> browser extension (free)</li>
            <li>Install <strong>Enhanced Grok Export</strong>: 
              <a 
                href="https://greasyfork.org/en/scripts/537266-enhanced-grok-export-v2-4" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline ml-1"
              >
                Click here to install
              </a>
            </li>
            <li>Open your Grok conversation</li>
            <li>Scroll to bottom (loads all messages)</li>
            <li>Click the <strong>🤖 Export Grok</strong> button (bottom-right)</li>
            <li>Choose <strong>Markdown</strong> format</li>
            <li>Upload the downloaded file here!</li>
          </ol>
          <p className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2">
            ✅ This exports ALL messages perfectly, including metadata!
          </p>
        </div>

        <details className="bg-white rounded p-3">
          <summary className="font-medium cursor-pointer hover:text-gray-700">
            Alternative: Manual Copy/Paste
          </summary>
          <ol className="text-xs space-y-1 text-gray-700 list-decimal ml-4 mt-2">
            <li>Open your Grok conversation</li>
            <li>Select all text (Cmd+A / Ctrl+A)</li>
            <li>Copy and paste into a text file</li>
            <li>Upload here</li>
          </ol>
        </details>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-4">
        <p className="font-medium mb-2">ChatGPT & Claude share links:</p>
        <ul className="space-y-1 text-gray-600 text-xs">
          <li>• ChatGPT: https://chat.openai.com/share/...</li>
          <li>• Claude: https://claude.ai/share/...</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">These work directly - just paste the link below!</p>
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
