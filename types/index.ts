// types/index.ts - Core type definitions for Eve v2

export interface Mood {
  empathy: number; // 0-1
  directness: number; // 0-1
  humor: number; // 0-1
  formality: number; // 0-1
  intensity: number; // 0-1
  romanticism: number; // 0-1
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
}

export interface VoiceConfig {
  voiceId: string;
  settings: VoiceSettings;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  user_id: string;
  messages: Message[];
  summary?: string;
  themes?: string[];
  mood_settings?: Mood;
  voice_used?: VoiceConfig;
  privacy: PrivacyLevel;
  release_date?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export type PrivacyLevel = 
  | 'private' 
  | 'heir_only' 
  | 'heir_age_18' 
  | 'heir_age_25' 
  | 'heir_date' 
  | 'public';

export type MemoryType = 'fact' | 'preference' | 'story' | 'emotion' | 'timeline_event' | 'experience' | 'context';

export interface Memory {
  id: string;
  agent_id: string;
  conversation_id?: string;
  type: MemoryType;
  content: string;
  importance_score: number;
  privacy: PrivacyLevel;
  release_date?: string;
  created_at: string;
}

export type DomainName = 'infj_psychology' | 'touche_gallery' | 'custom';

export interface KnowledgeDomain {
  id: string;
  agent_id: string;
  domain_name: DomainName;
  enabled: boolean;
  context_weight: number;
  created_at: string;
}

export type AgentType = 'personal' | 'shared';

export type VoiceMode = 'auto' | 'locked';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  type: AgentType;
  core_prompt: string;
  default_mood: Mood;
  voice_mode: VoiceMode;
  locked_voice_id?: string;
  locked_voice_settings?: VoiceSettings;
  created_at: string;
  updated_at: string;
}

export interface ImportedData {
  conversations: Conversation[];
  memories: Memory[];
  inferredPersonality: string;
  metadata: {
    source: string;
    exportDate: string;
    messageCount: number;
  };
}

export interface MoodPreset {
  name: string;
  mood: Mood;
  description: string;
  icon: string;
}
