// lib/importers/specialized-memory-extractor.ts
// Enhanced memory extraction that populates specialized tables

import { createClient } from '@supabase/supabase-js';

interface SpecializedMemory {
  baseMemory: {
    type: string;
    content: string;
    category: string;
    tags: string[];
    importance_score: number;
    embedding?: number[];
  };
  musicData?: MusicMemoryData;
  workData?: WorkMemoryData;
  relationshipData?: RelationshipMemoryData;
  dreamData?: DreamMemoryData;
}

interface MusicMemoryData {
  song_title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  listen_frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'rare';
  emotional_connection?: 'nostalgic' | 'energizing' | 'calming' | 'romantic' | 'motivational' | 'sad' | 'neutral';
}

interface WorkMemoryData {
  project_name?: string;
  project_description?: string;
  project_status?: 'active' | 'completed' | 'on-hold' | 'cancelled' | 'archived';
  company?: string;
  role?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'self-employed';
  skills?: string[];
  start_date?: string;
  end_date?: string;
}

interface RelationshipMemoryData {
  person_name: string;
  relationship?: string;
  how_met?: string;
  met_date?: string;
  shared_interests?: string[];
  communication_style?: string;
  current_status?: string;
}

interface DreamMemoryData {
  dream_date: string;
  dream_content: string;
  themes?: string[];
  emotions?: string[];
  recurring?: boolean;
  personal_meaning?: string;
}

export class SpecializedMemoryExtractor {
  
  /**
   * Extract specialized memories from conversation
   */
  static async extractSpecializedMemories(content: string): Promise<SpecializedMemory[]> {
    const memories: SpecializedMemory[] = [];
    
    // Extract music memories
    memories.push(...this.extractMusicMemories(content));
    
    // Extract work memories
    memories.push(...this.extractWorkMemories(content));
    
    // Extract relationship memories
    memories.push(...this.extractRelationshipMemories(content));
    
    // Extract dream memories
    memories.push(...this.extractDreamMemories(content));
    
    return memories;
  }
  
  /**
   * Extract music-specific memories
   */
  private static extractMusicMemories(content: string): SpecializedMemory[] {
    const memories: SpecializedMemory[] = [];
    
    // Pattern 1: Tagged songs [song: Title | artist: Artist | album: Album]
    const taggedSongPattern = /\[song:\s*([^|\]]+?)(?:\s*\|\s*artist:\s*([^|\]]+?))?(?:\s*\|\s*album:\s*([^\]]+?))?\]/gi;
    let match;
    
    while ((match = taggedSongPattern.exec(content)) !== null) {
      const title = match[1]?.trim();
      const artist = match[2]?.trim();
      const album = match[3]?.trim();
      
      if (title) {
        memories.push({
          baseMemory: {
            type: 'preference',
            content: `Song: "${title}"${artist ? ` by ${artist}` : ''}`,
            category: 'music',
            tags: this.generateMusicTags(title, artist, album),
            importance_score: 0.7
          },
          musicData: {
            song_title: title,
            artist: artist,
            album: album,
            listen_frequency: 'occasional'
          }
        });
      }
    }
    
    // Pattern 2: Explicit music preferences
    const musicPreferencePattern = /(?:favorite|love|adore|obsessed with)\s+(?:song|album|artist|band)\s+(?:is|:)?\s*["']?([^"'\n.!?]+)["']?(?:\s+by\s+([A-Z][a-zA-Z\s&'.]+))?/gi;
    
    while ((match = musicPreferencePattern.exec(content)) !== null) {
      const titleOrName = match[1]?.trim();
      const artist = match[2]?.trim();
      
      if (titleOrName) {
        const emotionalConnection = this.detectEmotionalConnection(content, titleOrName);
        
        memories.push({
          baseMemory: {
            type: 'preference',
            content: `Favorite music: "${titleOrName}"${artist ? ` by ${artist}` : ''}`,
            category: 'music',
            tags: this.generateMusicTags(titleOrName, artist),
            importance_score: 0.9 // Explicit favorites are high importance
          },
          musicData: {
            song_title: titleOrName,
            artist: artist,
            emotional_connection: emotionalConnection,
            listen_frequency: 'weekly'
          }
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract work-related memories
   */
  private static extractWorkMemories(content: string): SpecializedMemory[] {
    const memories: SpecializedMemory[] = [];
    
    // Pattern: Company/project mentions
    const workPattern = /(?:work(?:ed|ing)?|job|project|company|business)\s+(?:at|for|on|called|named)\s+([A-Z][a-zA-Z\s&'.]+?)(?:\s+as\s+([a-z\s]+))?/gi;
    let match;
    
    while ((match = workPattern.exec(content)) !== null) {
      const companyOrProject = match[1]?.trim();
      const role = match[2]?.trim();
      
      if (companyOrProject) {
        const status = this.detectProjectStatus(content, companyOrProject);
        
        memories.push({
          baseMemory: {
            type: 'fact',
            content: `Work: ${companyOrProject}${role ? ` as ${role}` : ''}`,
            category: 'work',
            tags: ['work', 'career', companyOrProject.toLowerCase()],
            importance_score: 0.8
          },
          workData: {
            company: companyOrProject,
            role: role,
            project_status: status
          }
        });
      }
    }
    
    // Pattern: Specific projects
    const projectPattern = /(?:started|launched|building|created|working on)\s+([A-Z][a-zA-Z\s]+?)(?:\s+project|\s+business|\s+company)?/gi;
    
    while ((match = projectPattern.exec(content)) !== null) {
      const projectName = match[1]?.trim();
      
      if (projectName && projectName.length < 50) {
        memories.push({
          baseMemory: {
            type: 'experience',
            content: `Project: ${projectName}`,
            category: 'work',
            tags: ['work', 'project', projectName.toLowerCase()],
            importance_score: 0.85
          },
          workData: {
            project_name: projectName,
            project_status: 'active'
          }
        });
      }
    }
    
    return memories;
  }
  
  /**
   * Extract relationship memories
   */
  private static extractRelationshipMemories(content: string): SpecializedMemory[] {
    const memories: SpecializedMemory[] = [];
    
    // Pattern: Relationship declarations
    const relationshipPattern = /(?:my|met my)\s+(wife|husband|spouse|partner|girlfriend|boyfriend|daughter|son|child|mother|father|mom|dad|sister|brother|friend)\s+([A-Z][a-z]+)/gi;
    let match;
    
    while ((match = relationshipPattern.exec(content)) !== null) {
      const relationship = match[1]?.trim();
      const name = match[2]?.trim();
      
      if (name) {
        memories.push({
          baseMemory: {
            type: 'context',
            content: `${name} is my ${relationship}`,
            category: 'family',
            tags: ['relationship', 'family', name.toLowerCase()],
            importance_score: 0.95 // Family is high importance
          },
          relationshipData: {
            person_name: name,
            relationship: relationship,
            current_status: 'close'
          }
        });
      }
    }
    
    // Pattern: People mentions (for building relationship context)
    const peoplePattern = /\b([A-Z][a-z]+)\s+(?:and I|said|told me|loves|enjoys|hates)/g;
    
    while ((match = peoplePattern.exec(content)) !== null) {
      const name = match[1]?.trim();
      
      // Skip common words that look like names
      const skipWords = ['I', 'The', 'A', 'An', 'It', 'This', 'That'];
      if (name && !skipWords.includes(name)) {
        const interests = this.extractSharedInterests(content, name);
        
        if (interests.length > 0) {
          memories.push({
            baseMemory: {
              type: 'context',
              content: `${name}: shared interests in ${interests.join(', ')}`,
              category: 'relationship',
              tags: ['relationship', name.toLowerCase(), ...interests],
              importance_score: 0.7
            },
            relationshipData: {
              person_name: name,
              shared_interests: interests
            }
          });
        }
      }
    }
    
    return memories;
  }
  
  /**
   * Extract dream memories
   */
  private static extractDreamMemories(content: string): SpecializedMemory[] {
    const memories: SpecializedMemory[] = [];
    
    // Pattern: Dream mentions
    const dreamPattern = /(?:had a dream|dreamed|dreamt|nightmare)\s+(?:about|that|where)\s+([^.!?\n]+)/gi;
    let match;
    
    while ((match = dreamPattern.exec(content)) !== null) {
      const dreamContent = match[1]?.trim();
      
      if (dreamContent && dreamContent.length > 10) {
        const themes = this.extractDreamThemes(dreamContent);
        const emotions = this.extractDreamEmotions(dreamContent);
        const recurring = this.isRecurringDream(content, dreamContent);
        
        memories.push({
          baseMemory: {
            type: 'experience',
            content: `Dream: ${dreamContent}`,
            category: 'dreams',
            tags: ['dream', ...themes, ...emotions],
            importance_score: recurring ? 0.8 : 0.6
          },
          dreamData: {
            dream_date: new Date().toISOString().split('T')[0],
            dream_content: dreamContent,
            themes: themes,
            emotions: emotions,
            recurring: recurring
          }
        });
      }
    }
    
    return memories;
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private static generateMusicTags(title: string, artist?: string, album?: string): string[] {
    const tags = ['music'];
    
    if (artist) {
      tags.push(artist.toLowerCase());
    }
    
    if (album) {
      tags.push(album.toLowerCase());
    }
    
    // Add genre tags based on artist (would be enhanced with a database lookup)
    const genreKeywords: Record<string, string> = {
      'oasis': 'britpop',
      'stone roses': 'madchester',
      'happy mondays': 'madchester',
      'jesus and mary chain': 'shoegaze',
      'my bloody valentine': 'shoegaze',
      'mazzy star': 'dream-pop',
      'kasabian': 'indie-rock'
    };
    
    if (artist) {
      const genre = genreKeywords[artist.toLowerCase()];
      if (genre) tags.push(genre);
    }
    
    return tags;
  }
  
  private static detectEmotionalConnection(content: string, music: string): MusicMemoryData['emotional_connection'] {
    const context = content.toLowerCase();
    
    if (context.includes('nostalgic') || context.includes('reminds me') || context.includes('brings me back')) {
      return 'nostalgic';
    }
    if (context.includes('energiz') || context.includes('pump') || context.includes('motivat')) {
      return 'energizing';
    }
    if (context.includes('calm') || context.includes('relax') || context.includes('peaceful')) {
      return 'calming';
    }
    if (context.includes('romantic') || context.includes('love song') || context.includes('date')) {
      return 'romantic';
    }
    if (context.includes('sad') || context.includes('cry') || context.includes('emotional')) {
      return 'sad';
    }
    
    return 'neutral';
  }
  
  private static detectProjectStatus(content: string, project: string): WorkMemoryData['project_status'] {
    const context = content.toLowerCase();
    
    if (context.includes('completed') || context.includes('finished') || context.includes('sold')) {
      return 'completed';
    }
    if (context.includes('working on') || context.includes('building') || context.includes('current')) {
      return 'active';
    }
    if (context.includes('paused') || context.includes('on hold')) {
      return 'on-hold';
    }
    if (context.includes('cancelled') || context.includes('abandoned')) {
      return 'cancelled';
    }
    if (context.includes('archived') || context.includes('past')) {
      return 'archived';
    }
    
    return 'active';
  }
  
  private static extractSharedInterests(content: string, name: string): string[] {
    const interests: string[] = [];
    const interestKeywords = ['music', 'art', 'travel', 'food', 'sports', 'reading', 'gaming', 'photography', 'cooking'];
    
    const nameContext = content.slice(
      Math.max(0, content.indexOf(name) - 100),
      Math.min(content.length, content.indexOf(name) + 100)
    ).toLowerCase();
    
    for (const interest of interestKeywords) {
      if (nameContext.includes(interest)) {
        interests.push(interest);
      }
    }
    
    return interests;
  }
  
  private static extractDreamThemes(dreamContent: string): string[] {
    const themes: string[] = [];
    const themeKeywords: Record<string, string[]> = {
      'flying': ['fly', 'flying', 'flew', 'wings', 'soar'],
      'water': ['water', 'ocean', 'sea', 'lake', 'river', 'swimming', 'drowning'],
      'falling': ['fall', 'falling', 'fell', 'drop', 'dropped'],
      'chase': ['chase', 'chasing', 'chased', 'running', 'escape'],
      'family': ['family', 'mother', 'father', 'mom', 'dad', 'sister', 'brother'],
      'death': ['death', 'dying', 'dead', 'funeral'],
      'animal': ['dog', 'cat', 'bird', 'snake', 'animal', 'creature']
    };
    
    const lowerContent = dreamContent.toLowerCase();
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }
  
  private static extractDreamEmotions(dreamContent: string): string[] {
    const emotions: string[] = [];
    const emotionKeywords: Record<string, string[]> = {
      'fear': ['scared', 'afraid', 'terrified', 'fear', 'frightened'],
      'joy': ['happy', 'joyful', 'excited', 'wonderful', 'amazing'],
      'anxiety': ['anxious', 'worried', 'nervous', 'stressed'],
      'peace': ['peaceful', 'calm', 'serene', 'tranquil'],
      'confusion': ['confused', 'lost', 'unclear', 'strange', 'weird']
    };
    
    const lowerContent = dreamContent.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        emotions.push(emotion);
      }
    }
    
    return emotions;
  }
  
  private static isRecurringDream(content: string, dreamContent: string): boolean {
    const recurringKeywords = ['again', 'recurring', 'same dream', 'another time', 'keeps happening'];
    const lowerContent = content.toLowerCase();
    
    return recurringKeywords.some(keyword => lowerContent.includes(keyword));
  }
  
  /**
   * Save specialized memory to database
   */
  static async saveSpecializedMemory(
    memory: SpecializedMemory,
    userId: string,
    agentId: string,
    supabase: any
  ): Promise<string | null> {
    try {
      // 1. Save base memory
      const { data: baseMemoryData, error: baseError } = await supabase
        .from('memories')
        .insert({
          agent_id: agentId,
          type: memory.baseMemory.type,
          content: memory.baseMemory.content,
          category: memory.baseMemory.category,
          tags: memory.baseMemory.tags,
          importance_score: memory.baseMemory.importance_score,
          embedding: memory.baseMemory.embedding,
          privacy: 'private'
        })
        .select()
        .single();
      
      if (baseError || !baseMemoryData) {
        console.error('Error saving base memory:', baseError);
        return null;
      }
      
      const memoryId = baseMemoryData.id;
      
      // 2. Save specialized data based on type
      if (memory.musicData) {
        const { error: musicError } = await supabase
          .from('music_memories')
          .insert({
            memory_id: memoryId,
            user_id: userId,
            agent_id: agentId,
            ...memory.musicData
          });
        
        if (musicError) console.error('Error saving music memory:', musicError);
      }
      
      if (memory.workData) {
        const { error: workError } = await supabase
          .from('work_memories')
          .insert({
            memory_id: memoryId,
            user_id: userId,
            agent_id: agentId,
            ...memory.workData
          });
        
        if (workError) console.error('Error saving work memory:', workError);
      }
      
      if (memory.relationshipData) {
        const { error: relError } = await supabase
          .from('relationship_memories')
          .insert({
            memory_id: memoryId,
            user_id: userId,
            agent_id: agentId,
            ...memory.relationshipData
          });
        
        if (relError) console.error('Error saving relationship memory:', relError);
      }
      
      if (memory.dreamData) {
        const { error: dreamError } = await supabase
          .from('dream_memories')
          .insert({
            memory_id: memoryId,
            user_id: userId,
            agent_id: agentId,
            ...memory.dreamData
          });
        
        if (dreamError) console.error('Error saving dream memory:', dreamError);
      }
      
      return memoryId;
    } catch (error) {
      console.error('Error in saveSpecializedMemory:', error);
      return null;
    }
  }
}
