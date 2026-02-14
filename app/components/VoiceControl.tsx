// app/components/VoiceControl.tsx - Voice selection and settings

'use client';

import { useState, useEffect } from 'react';
import { VoiceMode } from '@/types';
import { getVoiceDescription } from '@/lib/voice';
import { Mood } from '@/types';

interface VoiceControlProps {
  voiceMode: VoiceMode;
  lockedVoiceId?: string;
  currentMood: Mood;
  onVoiceModeChange: (mode: VoiceMode) => void;
  onLockedVoiceChange: (voiceId: string) => void;
}

export default function VoiceControl({
  voiceMode,
  lockedVoiceId,
  currentMood,
  onVoiceModeChange,
  onLockedVoiceChange,
}: VoiceControlProps) {
  const [voices, setVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Load voices from ElevenLabs
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      } finally {
        setLoadingVoices(false);
      }
    };
    loadVoices();
  }, []);
  
  const autoDescription = getVoiceDescription(currentMood);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3">🎤 Voice Settings</h3>

      {/* Voice Mode Toggle */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Voice Mode:</p>
        <div className="flex gap-2">
          <button
            onClick={() => onVoiceModeChange('auto')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              voiceMode === 'auto'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Auto (Mood-based)
          </button>
          <button
            onClick={() => onVoiceModeChange('locked')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              voiceMode === 'locked'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lock Voice
          </button>
        </div>
      </div>

      {/* Current Voice Display */}
      {voiceMode === 'auto' ? (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 mb-1">Current Voice:</p>
          <p className="text-sm font-medium text-gray-900">{autoDescription}</p>
          <p className="text-xs text-gray-500 mt-1">
            Voice automatically adapts to your mood settings
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Select Voice:
          </label>
          {loadingVoices ? (
            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Loading voices...
            </div>
          ) : (
            <select
              value={lockedVoiceId || '21m00Tcm4TlvDq8ikWAM'}
              onChange={(e) => onLockedVoiceChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Voice settings still adapt slightly to mood
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> Auto mode changes Eve's voice to match the emotional tone 
          of your conversation. Lock mode keeps one consistent voice while still adapting 
          delivery speed and emphasis.
        </p>
      </div>
    </div>
  );
}
