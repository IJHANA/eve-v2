// app/components/ImportFlow.tsx - Import conversation history from other platforms

'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import ShareLinkImport from './ShareLinkImport';

interface ImportFlowProps {
  userId: string;
  onComplete: (agentId: string) => void;
  onCancel?: () => void;
}

export default function ImportFlow({ userId, onComplete, onCancel }: ImportFlowProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<'file' | 'link'>('link');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const fileContent = await file.text();

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);

      // User manually clicks Continue to proceed

    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleShareLinkSuccess = async (content: string) => {
    setImporting(true);
    setError(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: content,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);

      // User manually clicks Continue to proceed

    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  // Success state
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
          
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            ✅ Import Successful!
          </h2>

          <div className="space-y-3 text-left bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Source:</span>
              <strong className="text-gray-900">{result.imported?.source || 'Unknown'}</strong>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Conversations:</span>
              <strong className="text-green-600">{result.imported?.conversations || 0}</strong>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Messages:</span>
              <strong className="text-green-600">{result.imported?.messages || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Memories Extracted:</span>
              <strong className="text-green-600">{result.imported?.memories || 0}</strong>
            </div>
          </div>

          <button
            onClick={() => onComplete(result.agent_id)}
            className="w-full bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all"
          >
            Continue to Chat →
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Your conversation history has been imported successfully!
          </p>
        </div>
      </div>
    );
  }

  // Main import UI
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">Import Your AI History</h2>
      <p className="text-gray-600 mb-8">
        Bring your conversations from Grok, ChatGPT, or Claude to Eve.
      </p>

      {/* Import method tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setImportMethod('link')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            importMethod === 'link'
              ? 'border-black text-black font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📎 Share Link
        </button>
        <button
          onClick={() => setImportMethod('file')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            importMethod === 'file'
              ? 'border-black text-black font-medium'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📁 Upload File
        </button>
      </div>

      {/* Share link import */}
      {importMethod === 'link' && (
        <ShareLinkImport onSuccess={handleShareLinkSuccess} />
      )}

      {/* File upload import */}
      {importMethod === 'file' && (
        <div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-3 text-blue-900">How to export:</h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[80px]">Grok:</span>
            <span>Copy/paste your conversation into a .txt or .md file</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[80px]">ChatGPT:</span>
            <span>Settings → Data Controls → Export Data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[80px]">Claude:</span>
            <span>Projects → Export Conversations</span>
          </li>
        </ul>
      </div>

      {/* File upload */}
      <div className="mb-6">
        <label className="block">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              file 
                ? 'border-black bg-gray-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".md,.json,.txt"
              className="hidden"
              disabled={importing}
            />
            
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            
            {file ? (
              <div>
                <p className="font-medium text-black mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-700 mb-1">
                  Drop your export file here
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports: .md, .json, .txt
                </p>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Import failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="flex-1 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <Loader size={20} className="animate-spin" />
              Importing...
            </>
          ) : (
            'Import & Create Agent'
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={importing}
            className="px-8 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Your data is processed securely and never shared with third parties.
      </p>
        </div>
      )}
    </div>
  );
}
