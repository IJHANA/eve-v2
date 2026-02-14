// app/components/SettingsPanel.tsx - Comprehensive settings panel

'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Database, Shield, User, Trash2, Sparkles } from 'lucide-react';
import ImportFlow from './ImportFlow';
import { createClient } from '@/lib/supabase';
import { AVAILABLE_VOICES } from '@/lib/voice';

interface SettingsPanelProps {
  userId: string;
  onClose: () => void;
  onImportComplete: (agentId: string) => void;
}

export default function SettingsPanel({ userId, onClose, onImportComplete }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'agent' | 'import' | 'domains' | 'privacy'>('general');
  const [agentName, setAgentName] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentId, setAgentId] = useState('');
  const [defaultVoiceId, setDefaultVoiceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const supabase = createClient();

  // Load voices from ElevenLabs
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices);
        } else {
          // Fallback to hardcoded voices
          setVoices(AVAILABLE_VOICES);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        // Fallback to hardcoded voices
        setVoices(AVAILABLE_VOICES);
      } finally {
        setLoadingVoices(false);
      }
    };
    loadVoices();
  }, []);

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      const { data } = await supabase
        .from('agents')
        .select('id, name, core_prompt, default_voice_id')
        .eq('user_id', userId)
        .eq('type', 'personal')
        .single();
      
      if (data) {
        setAgentId(data.id);
        setAgentName(data.name || 'Eve');
        setAgentPrompt(data.core_prompt || '');
        setDefaultVoiceId(data.default_voice_id || '21m00Tcm4TlvDq8ikWAM'); // Rachel legacy default
      }
    };
    loadAgent();
  }, [userId, supabase]);

  const handleSaveAgent = async () => {
    setSaving(true);
    try {
      await fetch('/api/update-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          name: agentName,
          prompt: agentPrompt,
          defaultVoiceId,
        }),
      });
      // Reload page to update agent name everywhere
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: User },
    { id: 'agent' as const, label: 'Agent', icon: Sparkles },
    { id: 'import' as const, label: 'Import', icon: Upload },
    { id: 'domains' as const, label: 'Expertise', icon: Database },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-black text-black font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900">{userId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
                  <Trash2 size={18} />
                  Delete All Data
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  This will permanently delete your agent, conversations, and memories.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Agent Personality</h3>
                <p className="text-gray-600 mb-6">
                  Customize your AI companion's name and personality
                </p>
              </div>

              {/* Agent Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., Eve, Ara, Nova..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Personality Prompt */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Personality Prompt
                </label>
                <textarea
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="Describe your agent's personality, tone, and behavior..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 This defines how your agent thinks, speaks, and behaves in every conversation
                </p>
              </div>

              {/* Example Prompts */}
              <details className="bg-gray-50 rounded-lg p-4">
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

              {/* Default Voice */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Default Voice
                </label>
                {loadingVoices ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Loading voices...
                  </div>
                ) : (
                  <select
                    value={defaultVoiceId}
                    onChange={(e) => setDefaultVoiceId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <optgroup label="Legacy Voices">
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Legacy Default)</option>
                      <option value="oWAxZDx7w5VEj9dCyTzz">Grace (Legacy Default)</option>
                    </optgroup>
                    <optgroup label="Your Voices">
                      {voices
                        .filter(v => !['21m00Tcm4TlvDq8ikWAM', 'oWAxZDx7w5VEj9dCyTzz'].includes(v.id))
                        .map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} - {voice.description}
                          </option>
                        ))
                      }
                    </optgroup>
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  🎤 This voice will be used when voice mode is set to "Auto"
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveAgent}
                disabled={saving || !agentName.trim()}
                className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Changes will take effect immediately. The page will reload after saving.
              </p>
            </div>
          )}

          {activeTab === 'import' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Import Conversation History</h3>
              <p className="text-gray-600 mb-6">
                Add your conversations from other AI platforms to continue your relationship with Eve.
              </p>
              <ImportFlow
                userId={userId}
                onComplete={(agentId) => {
                  // Switch to Agent tab to customize
                  setActiveTab('agent');
                  // Reload agent data
                  const reloadAgent = async () => {
                    const { data } = await supabase
                      .from('agents')
                      .select('id, name, core_prompt, default_voice_id')
                      .eq('user_id', userId)
                      .eq('type', 'personal')
                      .single();
                    
                    if (data) {
                      setAgentId(data.id);
                      setAgentName(data.name || 'Eve');
                      setAgentPrompt(data.core_prompt || '');
                      setDefaultVoiceId(data.default_voice_id || '21m00Tcm4TlvDq8ikWAM');
                    }
                  };
                  reloadAgent();
                }}
                onCancel={onClose}
              />
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Knowledge Domains</h3>
                <p className="text-gray-600 mb-6">
                  Enable specialized expertise areas. Eve will automatically use relevant knowledge when you discuss these topics.
                </p>
              </div>

              {/* INFJ Domain */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">🧠 INFJ Psychology</h4>
                    <p className="text-sm text-gray-600">
                      Deep expertise in INFJ personality type, cognitive functions, and psychology
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Triggers automatically when you mention:</strong> INFJ, Ni-dom, cognitive functions, 
                    personality types, doorslam, HSP, empathy overload, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Try asking:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• "Why do INFJs get so drained after socializing?"</li>
                    <li>• "Tell me about the Ni-Fe-Ti-Se cognitive stack"</li>
                    <li>• "How do I deal with doorslam guilt?"</li>
                  </ul>
                </div>
              </div>

              {/* Touché Domain */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">🎨 Touché Gallery</h4>
                    <p className="text-sm text-gray-600">
                      Contemporary art gallery knowledge - artworks, artists, exhibitions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Triggers automatically when you mention:</strong> art, artist, gallery, 
                    Touché, painting, exhibition, artwork, prices, Los Angeles gallery, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Try asking:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• "What's currently showing at Touché?"</li>
                    <li>• "Tell me about the artists in the gallery"</li>
                    <li>• "Is there any artwork available for purchase?"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy & Inheritance</h3>
                <p className="text-gray-600 mb-6">
                  Control who can access your conversations and when.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Default Privacy Level</h4>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="private">Private (only me)</option>
                  <option value="heir_only" selected>Heir Only (after I'm gone)</option>
                  <option value="heir_age_18">Heir at Age 18</option>
                  <option value="heir_age_25">Heir at Age 25</option>
                  <option value="public">Public</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  New conversations will use this privacy setting by default.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Designated Heir</h4>
                <input
                  type="email"
                  placeholder="heir@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-2"
                />
                <p className="text-xs text-gray-500">
                  This person will receive access to your conversations based on privacy settings.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Coming Soon:</strong> Dead man's switch, time-released content, 
                  and blockchain backup for permanent storage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
