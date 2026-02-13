// app/components/MoodControl.tsx - Mood sliders and preset buttons

'use client';

import { Mood } from '@/types';
import { MOOD_PRESETS } from '@/lib/mood';

interface MoodControlProps {
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function MoodControl({ 
  mood, 
  onMoodChange, 
  collapsed = false,
  onToggleCollapse 
}: MoodControlProps) {
  
  const handleSliderChange = (key: keyof Mood, value: number) => {
    onMoodChange({
      ...mood,
      [key]: value,
    });
  };

  const handlePresetClick = (presetKey: string) => {
    const preset = MOOD_PRESETS[presetKey];
    if (preset) {
      onMoodChange(preset.mood);
    }
  };

  const getCurrentPreset = (): string | null => {
    for (const [key, preset] of Object.entries(MOOD_PRESETS)) {
      if (JSON.stringify(preset.mood) === JSON.stringify(mood)) {
        return key;
      }
    }
    return null;
  };

  const currentPreset = getCurrentPreset();

  if (collapsed) {
    return (
      <div className="border border-gray-200 rounded-lg p-3">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-black transition"
        >
          <span>🎭 Mood: {currentPreset ? MOOD_PRESETS[currentPreset].name : 'Custom'}</span>
          <span className="text-gray-400">▼</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">🎭 Mood Controls</h3>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Collapse ▲
          </button>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-3 mb-4">
        {/* Empathy */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Empathy</label>
            <span className="text-xs text-gray-500">{Math.round(mood.empathy * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.empathy * 100}
            onChange={(e) => handleSliderChange('empathy', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        {/* Directness */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Directness</label>
            <span className="text-xs text-gray-500">{Math.round(mood.directness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.directness * 100}
            onChange={(e) => handleSliderChange('directness', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        {/* Humor */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Humor</label>
            <span className="text-xs text-gray-500">{Math.round(mood.humor * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.humor * 100}
            onChange={(e) => handleSliderChange('humor', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        {/* Formality */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Formality</label>
            <span className="text-xs text-gray-500">{Math.round(mood.formality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.formality * 100}
            onChange={(e) => handleSliderChange('formality', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        {/* Intensity */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Intensity</label>
            <span className="text-xs text-gray-500">{Math.round(mood.intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.intensity * 100}
            onChange={(e) => handleSliderChange('intensity', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        {/* Romanticism */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">Romance</label>
            <span className="text-xs text-gray-500">{Math.round(mood.romanticism * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={mood.romanticism * 100}
            onChange={(e) => handleSliderChange('romanticism', parseInt(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MOOD_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                currentPreset === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={preset.description}
            >
              {preset.icon} {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
