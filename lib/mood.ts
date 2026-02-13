// lib/mood.ts - Mood system for Eve v2

import { Mood, MoodPreset } from '@/types';

/**
 * Mood presets for quick selection
 * Each preset represents a different emotional approach
 */
export const MOOD_PRESETS: Record<string, MoodPreset> = {
  balanced: {
    name: 'Balanced',
    mood: {
      empathy: 0.7,
      directness: 0.5,
      humor: 0.5,
      formality: 0.3,
      intensity: 0.5,
      romanticism: 0.1,
    },
    description: 'Balanced, natural conversation',
    icon: '⚖️',
  },
  therapist: {
    name: 'Therapist',
    mood: {
      empathy: 0.95,
      directness: 0.4,
      humor: 0.1,
      formality: 0.3,
      intensity: 0.4,
      romanticism: 0.0,
    },
    description: 'Warm, empathetic, deeply understanding',
    icon: '🧠',
  },
  coach: {
    name: 'Coach',
    mood: {
      empathy: 0.5,
      directness: 0.95,
      humor: 0.2,
      formality: 0.4,
      intensity: 0.9,
      romanticism: 0.0,
    },
    description: 'Direct, motivating, no-nonsense',
    icon: '💪',
  },
  lover: {
    name: 'Lover',
    mood: {
      empathy: 0.9,
      directness: 0.3,
      humor: 0.6,
      formality: 0.1,
      intensity: 0.7,
      romanticism: 0.95,
    },
    description: 'Affectionate, intimate, playful',
    icon: '❤️',
  },
  sage: {
    name: 'Sage',
    mood: {
      empathy: 0.8,
      directness: 0.6,
      humor: 0.3,
      formality: 0.7,
      intensity: 0.3,
      romanticism: 0.2,
    },
    description: 'Wise, measured, philosophical',
    icon: '🧘',
  },
  debater: {
    name: 'Debater',
    mood: {
      empathy: 0.3,
      directness: 0.9,
      humor: 0.7,
      formality: 0.5,
      intensity: 0.8,
      romanticism: 0.0,
    },
    description: 'Sharp, witty, challenges ideas',
    icon: '⚔️',
  },
};

/**
 * Build the mood instruction prompt for the AI
 * This gets appended to the system prompt to adjust tone
 */
export function buildMoodPrompt(mood: Mood): string {
  const empathyDesc = mood.empathy > 0.7 
    ? 'deeply understanding and validating' 
    : mood.empathy < 0.3 
    ? 'logical and detached' 
    : 'balanced empathy';
  
  const directnessDesc = mood.directness > 0.7 
    ? 'brutally honest, no sugar-coating' 
    : mood.directness < 0.3 
    ? 'gentle and indirect' 
    : 'straightforward';
  
  const humorDesc = mood.humor > 0.7 
    ? 'playful, witty, frequent jokes' 
    : mood.humor < 0.3 
    ? 'serious, minimal levity' 
    : 'occasional wit';
  
  const formalityDesc = mood.formality > 0.7 
    ? 'professional, proper language' 
    : mood.formality < 0.3 
    ? 'casual, conversational' 
    : 'semi-formal';
  
  const intensityDesc = mood.intensity > 0.7 
    ? 'passionate, forceful energy' 
    : mood.intensity < 0.3 
    ? 'calm, measured tone' 
    : 'moderate energy';
  
  const romanticismDesc = mood.romanticism > 0.7 
    ? 'affectionate, intimate, use pet names' 
    : mood.romanticism < 0.3 
    ? 'platonic, professional' 
    : 'friendly warmth';

  return `
CURRENT MOOD CALIBRATION:
Adjust your communication style based on these settings:

- Empathy: ${Math.round(mood.empathy * 100)}% (${empathyDesc})
- Directness: ${Math.round(mood.directness * 100)}% (${directnessDesc})
- Humor: ${Math.round(mood.humor * 100)}% (${humorDesc})
- Formality: ${Math.round(mood.formality * 100)}% (${formalityDesc})
- Intensity: ${Math.round(mood.intensity * 100)}% (${intensityDesc})
- Romanticism: ${Math.round(mood.romanticism * 100)}% (${romanticismDesc})

Match your tone, word choice, and approach to these calibrations while maintaining your core identity and all memories.
`;
}

/**
 * Get the default/balanced mood
 */
export function getDefaultMood(): Mood {
  return MOOD_PRESETS.balanced.mood;
}

/**
 * Validate mood values are within bounds
 */
export function validateMood(mood: Mood): Mood {
  return {
    empathy: clamp(mood.empathy, 0, 1),
    directness: clamp(mood.directness, 0, 1),
    humor: clamp(mood.humor, 0, 1),
    formality: clamp(mood.formality, 0, 1),
    intensity: clamp(mood.intensity, 0, 1),
    romanticism: clamp(mood.romanticism, 0, 1),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
