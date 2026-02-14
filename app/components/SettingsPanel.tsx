// app/components/SettingsPanel.tsx - Comprehensive settings panel

'use client';

import { useState } from 'react';
import { X, Upload, Database, Shield, User, Trash2 } from 'lucide-react';
import ImportFlow from './ImportFlow';

interface SettingsPanelProps {
  userId: string;
  onClose: () => void;
  onImportComplete: (agentId: string) => void;
}

export default function SettingsPanel({ userId, onClose, onImportComplete }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'import' | 'domains' | 'privacy'>('general');

  const tabs = [
    { id: 'general' as const, label: 'General', icon: User },
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

          {activeTab === 'import' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Import Conversation History</h3>
              <p className="text-gray-600 mb-6">
                Add your conversations from other AI platforms to continue your relationship with Eve.
              </p>
              <ImportFlow
                userId={userId}
                onComplete={onImportComplete}
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
