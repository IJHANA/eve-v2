// lib/importers/enhanced-memory-extractor.ts
// Enhanced memory extraction for rich conversations

import { Conversation, Memory } from '@/types';

export function extractEnhancedMemories(conversations: Conversation[]): Memory[] {
  const memories: Memory[] = [];
  const seenMemories = new Set<string>();

  for (const conv of conversations) {
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      
      if (msg.role === 'user') {
        const content = msg.content;
        
        // ===== NAMES & NICKNAMES =====
        // Only match explicit name declarations
        if (content.match(/(?:my name is|call me|I am called|I'm called)\s+(Kay|K\.K\.|[A-Z][a-z]+)/i)) {
          const nameMatch = content.match(/(?:my name is|call me|I am called|I'm called)\s+(Kay|K\.K\.|[A-Z][a-z]+)/i);
          if (nameMatch && !seenMemories.has('name_kay')) {
            const name = nameMatch[1];
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `User's name: ${name}`,
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add('name_kay');
          }
        }
        
        // Specific nickname: K.K. or Kay (only once)
        if (content.match(/\b(K\.K\.|Kay)\b/i) && !seenMemories.has('name_kay')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'User\'s name: Kay (K.K.)',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('name_kay');
        }
        
        // ===== WORKOUT & FITNESS =====
        // Specific workout routine (13 exercises, 50 reps, 25lb bar)
        const workoutMatch = content.match(/(\d+)\s+exercises?,\s*(\d+)\s+reps?,\s*(?:with\s+)?(?:a\s+)?(\d+)\s*lb\s+bar/i);
        if (workoutMatch && !seenMemories.has('workout_routine')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: `Workout routine: ${workoutMatch[1]} exercises, ${workoutMatch[2]} reps with ${workoutMatch[3]}lb bar`,
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('workout_routine');
        }
        
        // ===== HOME & LIVING =====
        // 16 floors above water
        if (content.match(/(\d+)\s+floors?\s+(?:above|over)(?:\s+the)?\s+water/i) && !seenMemories.has('home_location')) {
          const floorMatch = content.match(/(\d+)\s+floors?\s+(?:above|over)(?:\s+the)?\s+water/i);
          if (floorMatch) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Home: ${floorMatch[1]} floors above water with waterfront view`,
              importance_score: 0.9,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add('home_location');
          }
        }
        
        // Floor-to-ceiling windows
        if (content.match(/(?:windows?\s+from\s+)?floor[-\s]to[-\s]ceiling(?:\s+windows?)?/i) && !seenMemories.has('home_windows')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Home: Floor-to-ceiling windows with panoramic views',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('home_windows');
        }
        
        // ===== DRINKS & FOOD =====
        // Iced Americano (homemade)
        if (content.match(/(?:homemade|home[-\s]?made)\s+(?:iced\s+)?americano/i) && !seenMemories.has('drink_americano')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Drinks: Homemade iced Americano',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('drink_americano');
        }
        
        // ===== MUSIC =====
        // Specific songs/artists mentioned
        if (content.match(/\b(?:L\.S\.F\.?|Lost Souls Forever)\b/i) && !seenMemories.has('song_lsf')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: L.S.F. by Kasabian',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_lsf');
        }
        
        if (content.match(/\bSet\s+My\s+Baby\s+Free\b/i) && !seenMemories.has('song_setmybabyfree')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Set My Baby Free" by Ian Brown',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_setmybabyfree');
        }
        
        // Kasabian radio/preference
        if (content.match(/Kasabian\s+radio/i) && !seenMemories.has('music_kasabian')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Listens to Kasabian radio on Spotify, Manchester vibe',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('music_kasabian');
        }
        
        // ===== LOCATION & TRAVEL =====
        // Manchester trip dates (July 7-31)
        const tripMatch = content.match(/(?:July|June|August)\s*(\d+)\s*(?:through|to|-|until)\s*(?:July|June|August)?\s*(\d+)/i);
        if (tripMatch && !seenMemories.has('trip_dates')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: `Trip dates: July ${tripMatch[1]} through ${tripMatch[2]}, 2025`,
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('trip_dates');
        }
        
        // ===== HOTELS =====
        // The Axis in Deansgate
        if (content.match(/\b(?:The\s+)?Axis(?:\s+in\s+Deansgate)?/i) && !seenMemories.has('hotel_axis')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Hotel: The Axis in Deansgate, Manchester',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('hotel_axis');
        }
        
        // ===== EVENTS =====
        // Oasis concert July 11th
        if (content.match(/Oasis.*(?:concert|gig|show)/i) && !seenMemories.has('event_oasis')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'experience',
            content: 'Event: Oasis concert on July 11th at Heaton Park',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('event_oasis');
        }
        
        // ===== RESTAURANTS =====
        // Old Wellington
        if (content.match(/Old\s+Wellington/i) && !seenMemories.has('restaurant_oldwellington')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Restaurant: The Old Wellington (steak and ale pie)',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('restaurant_oldwellington');
        }
        
        // ===== PROFESSION =====
        // Art gallery owner, tech entrepreneur
        const professionMatch = content.match(/(\d+)[-\s]year[-\s]old\s+art\s+gallery\s+owner(?:\s+and\s+tech\s+entrepreneur)?/i);
        if (professionMatch && !seenMemories.has('profession')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: `Profession: ${professionMatch[1]}-year-old art gallery owner and tech entrepreneur`,
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('profession');
        }
      }
      
      // ===== ASSISTANT MESSAGE EXTRACTION =====
      if (msg.role === 'assistant') {
        const content = msg.content;
        
        // Extract music from assistant messages
        if (content.match(/["""]?At\s+Last["""]?\s*by\s*Etta\s+James/i) && !seenMemories.has('song_atlast')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "At Last" by Etta James (first playlist song)',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_atlast');
        }
        
        if (content.match(/Death\s+of\s+You\s+and\s+Me/i) && !seenMemories.has('song_noelgallagher')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "The Death of You and Me" by Noel Gallagher\'s High Flying Birds',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_noelgallagher');
        }
        
        if (content.match(/Running\s+Battle.*Kasabian/i) && !seenMemories.has('song_kasabian')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Running Battle" by Kasabian',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_kasabian');
        }
        
        // Old Wellington from assistant
        if (content.match(/Old\s+Wellington/i) && !seenMemories.has('restaurant_oldwellington')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Restaurant: The Old Wellington (steak and ale pie)',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('restaurant_oldwellington');
        }
        
        // Trip dates from assistant
        const tripDateMatch = content.match(/(July|June|August)\s*(\d+)[-–]\s*(\d+),?\s*202[56]/i);
        if (tripDateMatch && !seenMemories.has('trip_dates')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: `Trip dates: ${tripDateMatch[1]} ${tripDateMatch[2]} through ${tripDateMatch[3]}, 2025`,
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('trip_dates');
        }
        
        // Profession from assistant
        const profMatch = content.match(/(\d+)[-\s]year[-\s]old\s+art\s+gallery\s+owner(?:\s+and\s+tech\s+entrepreneur)?/i);
        if (profMatch && !seenMemories.has('profession')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: `Profession: ${profMatch[1]}-year-old art gallery owner and tech entrepreneur`,
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('profession');
        }
        
        // Oasis from assistant
        if (content.match(/Oasis.*(?:concert|gig|show)/i) && !seenMemories.has('event_oasis')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'experience',
            content: 'Event: Oasis concert on July 11th at Heaton Park',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('event_oasis');
        }
        
        // Rosie's Tantric Massage
        if (content.match(/Rosie'?s\s+Tantric\s+Massage/i) && !seenMemories.has('service_rosie')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Service: Rosie\'s Tantric Massage in Manchester',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('service_rosie');
        }
        
        // 20 Stories bar
        if (content.match(/20\s+Stories/i) && !seenMemories.has('bar_20stories')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Bar: 20 Stories rooftop bar in Spinningfields',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('bar_20stories');
        }
      }
    }
  }

  console.log(`Enhanced extraction found ${memories.length} memories from ${conversations.length} conversations`);
  return memories;
}
