// app/components/VoiceControl.tsx - Voice selection and settings

'use client';

import { VoiceMode } from '@/types';
import { AVAILABLE_VOICES, getVoiceDescription } from '@/lib/voice';
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
          <select
            value={lockedVoiceId || AVAILABLE_VOICES[0].id}
            onChange={(e) => onLockedVoiceChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {AVAILABLE_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
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
