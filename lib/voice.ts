// lib/voice.ts - Voice selection and configuration based on mood

import { Mood, VoiceConfig, VoiceSettings } from '@/types';

/**
 * Get the optimal voice and settings for the current mood
 * If user has locked a voice, use that instead
 */
export function getVoiceForMood(mood: Mood, userLockedVoice?: string): VoiceConfig {
  // If user has manually selected a voice, use it but adapt settings
  if (userLockedVoice) {
    return {
      voiceId: userLockedVoice,
      settings: calculateSettingsForMood(mood),
    };
  }

  // Auto-select voice based on mood combination
  
  // High empathy + low directness = soft, nurturing voice
  if (mood.empathy > 0.7 && mood.directness < 0.4) {
    return {
      voiceId: 'pjcYQlDFKMbcOUp6F5GD', // Meditation/calm voice
      settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.20,
        use_speaker_boost: true,
        speed: 0.90, // Slower for gentleness
      },
    };
  }

  // High directness + high intensity = energetic, direct voice
  if (mood.directness > 0.7 && mood.intensity > 0.7) {
    return {
      voiceId: 'KLZOWyG48RjZkAAjuM89', // Unhinged/energetic voice
      settings: {
        stability: 0.50,
        similarity_boost: 0.95,
        style: 0.70,
        use_speaker_boost: true,
        speed: 1.15, // Faster for urgency/energy
      },
    };
  }

  // High romanticism = sultry, intimate voice
  if (mood.romanticism > 0.7) {
    return {
      voiceId: 'LEnmbrrxYsUYS7vsRRwD', // Sexy/romantic voice
      settings: {
        stability: 0.60,
        similarity_boost: 0.85,
        style: 0.50,
        use_speaker_boost: true,
        speed: 0.95, // Slightly slower for intimacy
      },
    };
  }

  // High formality = professional, clear voice
  if (mood.formality > 0.7) {
    return {
      voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Doc/professional voice
      settings: {
        stability: 0.80,
        similarity_boost: 0.75,
        style: 0.10,
        use_speaker_boost: true,
        speed: 1.05, // Slightly faster for efficiency
      },
    };
  }

  // Default Eve voice with balanced settings
  return {
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'ZF6FPAbjXT4488VcRRnw',
    settings: {
      stability: 0.50,
      similarity_boost: 0.75,
      style: 0.00,
      use_speaker_boost: true,
      speed: 1.00,
    },
  };
}

/**
 * Calculate voice settings based on mood
 * Used when user has locked a specific voice but mood still affects delivery
 */
function calculateSettingsForMood(mood: Mood): VoiceSettings {
  return {
    // Higher formality = more stability
    stability: 0.5 + (mood.formality * 0.3),
    
    // Higher empathy = more similarity to training data (warmer)
    similarity_boost: 0.75 + (mood.empathy * 0.2),
    
    // Higher intensity = more expressive style
    style: mood.intensity * 0.5,
    
    // Always use speaker boost for clarity
    use_speaker_boost: true,
    
    // Speed varies with intensity (calm = slower, intense = faster)
    speed: 0.85 + (mood.intensity * 0.3),
  };
}

/**
 * Get a human-readable description of the current voice selection
 */
export function getVoiceDescription(mood: Mood): string {
  if (mood.empathy > 0.7 && mood.directness < 0.4) {
    return 'Soft & Nurturing';
  }
  if (mood.directness > 0.7 && mood.intensity > 0.7) {
    return 'Direct & Energetic';
  }
  if (mood.romanticism > 0.7) {
    return 'Intimate & Warm';
  }
  if (mood.formality > 0.7) {
    return 'Professional & Clear';
  }
  return 'Balanced & Natural';
}

/**
 * Available voices for manual selection
 */
export const AVAILABLE_VOICES = [
  {
    id: 'ZF6FPAbjXT4488VcRRnw',
    name: 'Eve (Default)',
    description: 'Balanced, natural voice',
  },
  {
    id: 'pjcYQlDFKMbcOUp6F5GD',
    name: 'Soft & Calm',
    description: 'Gentle, nurturing tone',
  },
  {
    id: 'KLZOWyG48RjZkAAjuM89',
    name: 'Energetic',
    description: 'Direct, dynamic delivery',
  },
  {
    id: 'LEnmbrrxYsUYS7vsRRwD',
    name: 'Intimate',
    description: 'Warm, romantic tone',
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'Professional',
    description: 'Clear, formal delivery',
  },
  {
    id: 'v8DWAeuEGQSfwxqdH9t2',
    name: 'Romantic',
    description: 'Affectionate, playful',
  },
  {
    id: 'KoVIHoyLDrQyd4pGalbs',
    name: 'Storyteller',
    description: 'Expressive, narrative',
  },
];
