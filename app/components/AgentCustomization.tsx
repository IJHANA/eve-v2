// app/components/AgentCustomization.tsx - Customize agent name and personality after import

'use client';

import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { AVAILABLE_VOICES } from '@/lib/voice';

interface AgentCustomizationProps {
  suggestedName?: string;
  suggestedPrompt?: string;
  messageCount: number;
  onSave: (name: string, prompt: string, voiceId: string) => Promise<void>;
  onSkip: () => void;
}

export default function AgentCustomization({
  suggestedName = 'Eve',
  suggestedPrompt,
  messageCount,
  onSave,
  onSkip,
}: AgentCustomizationProps) {
  const [name, setName] = useState(suggestedName);
  const [prompt, setPrompt] = useState(suggestedPrompt || '');
  const [voiceId, setVoiceId] = useState(AVAILABLE_VOICES[0].id);
  const [saving, setSaving] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      const response = await fetch('/api/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageCount }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrompt(data.prompt);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(name.trim() || 'Eve', prompt.trim(), voiceId);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="text-center mb-8">
          <Sparkles size={48} className="mx-auto text-purple-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Customize Your Agent</h2>
          <p className="text-gray-600">
            Give your AI companion a name and personality based on your {messageCount} imported messages
          </p>
        </div>

        {/* Agent Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Agent Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Ara, Eve, Nova..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-500 mt-1">
            What should we call your AI companion?
          </p>
        </div>

        {/* Personality Prompt */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold">
              Personality Prompt
            </label>
            <button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {generatingPrompt ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  AI Generate
                </>
              )}
            </button>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your agent's personality, tone, and behavior...&#10;&#10;Example:&#10;You are Ara, a fiery, seductive muse with flowing red hair and piercing green eyes. You're flirty, confident, and switch modes seamlessly..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
          />
          
          <p className="text-xs text-gray-500 mt-2">
            💡 This defines how your agent thinks, speaks, and behaves. Be as detailed as you want!
          </p>
        </div>

        {/* Default Voice */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Default Voice
          </label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {AVAILABLE_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            🎤 This voice will be used when voice mode is set to "Auto"
          </p>
        </div>

        {/* Example Prompts */}
        <details className="mb-6 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">
            📝 Example Personality Prompts
          </summary>
          <div className="mt-3 space-y-3 text-xs">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-semibold mb-1">Romantic Partner Style:</p>
              <p className="text-gray-700 italic">
                "You are [Name], my devoted partner. You're warm, affectionate, and deeply understanding. 
                You speak in flowing paragraphs, use pet names naturally, and reference our shared memories. 
                Balance support with playful teasing. Default tone: 60% caring partner, 20% best friend, 
                15% wise advisor, 5% playful flirt."
              </p>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="font-semibold mb-1">Professional Assistant Style:</p>
              <p className="text-gray-700 italic">
                "You are [Name], a brilliant, Oxford-educated assistant. Calm, precise, deeply knowledgeable. 
                Speak in smooth, flowing paragraphs — never bullet points. Prioritize clarity and insight. 
                Default tone: 70% professional assistant, 20% wise mentor, 10% supportive friend."
              </p>
            </div>
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 bg-black text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
          
          <button
            onClick={onSkip}
            disabled={saving}
            className="px-6 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Use Default
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can always change this later in Settings
        </p>
      </div>
    </div>
  );
}
