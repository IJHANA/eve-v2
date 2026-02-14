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
        const namePatterns = [
          { pattern: /(?:my name is|call me|I'm|I am)\s+(\w+)/i, capture: 1 },
          { pattern: /\b(K\.K\.|Kay)\b/i, capture: 1 },
        ];
        
        namePatterns.forEach(({ pattern, capture }) => {
          const match = content.match(pattern);
          if (match) {
            const name = match[capture];
            const key = `name_${name.toLowerCase().replace(/[^a-z]/g, '')}`;
            if (!seenMemories.has(key)) {
              memories.push({
                id: crypto.randomUUID(),
                agent_id: '',
                type: 'fact',
                content: `User's name: ${name}`,
                importance_score: 0.95,
                privacy: 'heir_only',
                created_at: new Date().toISOString(),
              });
              seenMemories.add(key);
            }
          }
        });
        
        // ===== LOCATIONS & HOTELS =====
        // Specific: Axis in Deansgate
        if (content.match(/Axis.*Deansgate/i) || content.match(/staying.*Axis/i)) {
          const key = 'hotel_axis';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: 'Hotel: The Axis in Deansgate, Manchester',
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General location mentions
        const locationMatch = content.match(/(?:in|visiting|going to|staying in|from)\s+(Manchester|London|Paris|New York|Tokyo|Berlin|Chicago|Los Angeles|San Francisco|Seattle|Boston|Miami)/i);
        if (locationMatch) {
          const location = locationMatch[1];
          const key = `location_${location.toLowerCase()}`;
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Location: ${location}`,
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Hotel/accommodation patterns
        const hotelMatch = content.match(/(?:staying at|hotel is|booked at)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+?)(?:\s+(?:hotel|inn|resort))?(?:\s+in|\s+at|\.)/i);
        if (hotelMatch && !content.match(/Axis/i)) {
          const hotel = hotelMatch[1].trim();
          const key = `hotel_${hotel.toLowerCase().substring(0, 15).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && hotel.length > 2) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Accommodation: ${hotel}`,
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== DATES & TRIP DURATION =====
        // July 7-31 trip or any month range
        const tripMatch = content.match(/(?:from|staying).*?(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d+).*?(?:through|to|-|until).*?(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d+)/i);
        if (tripMatch) {
          const key = 'trip_dates';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Trip dates: ${tripMatch[1]} ${tripMatch[2]} through ${tripMatch[3]} ${tripMatch[4]}, 2026`,
              importance_score: 0.9,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Specific event dates
        const eventDateMatch = content.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d+)(?:st|nd|rd|th)?/i);
        if (eventDateMatch && content.match(/seeing|concert|event|going|on\s+/i)) {
          const date = `${eventDateMatch[1]} ${eventDateMatch[2]}`;
          const key = `event_date_${date.toLowerCase().replace(/\s/g, '')}`;
          if (!seenMemories.has(key)) {
            const context = content.substring(0, 100);
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'experience',
              content: `Event date: ${date} - ${context}`,
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== CONCERTS & EVENTS =====
        // Oasis concert
        if (content.match(/Oasis/i)) {
          const key = 'oasis_concert';
          if (!seenMemories.has(key)) {
            let detail = 'Oasis concert';
            if (content.match(/July\s*11/i)) detail += ' on July 11th';
            if (content.match(/Heaton Park/i)) detail += ' at Heaton Park';
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'experience',
              content: `Event: ${detail}`,
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General concert/event pattern
        const concertMatch = content.match(/seeing\s+([A-Z][a-zA-Z\s&]+?)(?:\s+on|\s+at|\s+concert)/i);
        if (concertMatch) {
          const artist = concertMatch[1].trim();
          const key = `concert_${artist.toLowerCase().substring(0, 15).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && artist.length > 2 && !artist.match(/Oasis/i)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'experience',
              content: `Event: Seeing ${artist}`,
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== RESTAURANTS & FOOD =====
        // Old Wellington
        if (content.match(/Old Wellington/i)) {
          const key = 'restaurant_oldwellington';
          if (!seenMemories.has(key)) {
            let detail = 'The Old Wellington';
            if (content.match(/steak.*ale.*pie/i)) detail += ' (steak and ale pie)';
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Restaurant: ${detail}`,
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Pieminister
        if (content.match(/Pieminister/i)) {
          const key = 'restaurant_pieminister';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Restaurant: Pieminister',
              importance_score: 0.75,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // 20 Stories bar
        if (content.match(/20 Stories/i)) {
          const key = 'bar_20stories';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Bar: 20 Stories rooftop bar in Spinningfields',
              importance_score: 0.8,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General restaurant/bar/cafe pattern
        const restaurantMatch = content.match(/(?:restaurant|pub|bar|café|cafe)\s+(?:called\s+|named\s+|is\s+)?([A-Z][a-zA-Z\s&]+?)(?:\.|,|in|on|\s+has)/i);
        if (restaurantMatch) {
          const place = restaurantMatch[1].trim();
          const key = `restaurant_${place.toLowerCase().substring(0, 15).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && place.length > 2 && !place.match(/Old Wellington|Pieminister|20 Stories/i)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Restaurant/Bar: ${place}`,
              importance_score: 0.7,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== MUSIC & PLAYLISTS =====
        // At Last by Etta James
        if (content.match(/At Last.*Etta James/i) || content.match(/Etta James.*At Last/i)) {
          const key = 'song_atlast';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Music: "At Last" by Etta James (first playlist song)',
              importance_score: 0.9,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Noel Gallagher - The Death of You and Me
        if (content.match(/Death of You and Me/i) || (content.match(/Noel Gallagher/i) && content.match(/High Flying Birds/i))) {
          const key = 'song_noelgallagher';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: 'Music: "The Death of You and Me" by Noel Gallagher\'s High Flying Birds',
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General song pattern "Song" by Artist
        const songMatch = content.match(/"([^"]+)"\s+by\s+([A-Z][a-zA-Z\s&'.]+?)(?:\.|,|$)/i);
        if (songMatch) {
          const song = songMatch[1];
          const artist = songMatch[2].trim();
          const key = `song_${song.toLowerCase().substring(0, 15).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && !song.match(/At Last|Death of You/i)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Music: "${song}" by ${artist}`,
              importance_score: 0.75,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // Playlist mention
        if (content.match(/playlist/i) && !seenMemories.has('has_playlist')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Has a romantic/personal playlist',
            importance_score: 0.7,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('has_playlist');
        }
        
        // ===== PROFESSION & BACKGROUND =====
        // "55-year-old art gallery owner and tech entrepreneur"
        const professionMatch = content.match(/(\d+)[-\s]year[-\s]old\s+(.+?)(?:owner|entrepreneur)/i);
        if (professionMatch) {
          const key = 'profession';
          if (!seenMemories.has(key)) {
            const age = professionMatch[1];
            const desc = professionMatch[2].trim();
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Profession: ${age}-year-old ${desc}owner/entrepreneur`,
              importance_score: 0.95,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General profession pattern
        if (!seenMemories.has('profession')) {
          const workMatch = content.match(/I\s+(?:am|work as|'m)\s+(?:a|an)\s+([a-zA-Z\s]+?)(?:\.|,|and|who)/i);
          if (workMatch) {
            const profession = workMatch[1].trim();
            if (profession.length > 3 && profession.length < 50) {
              memories.push({
                id: crypto.randomUUID(),
                agent_id: '',
                type: 'fact',
                content: `Profession: ${profession}`,
                importance_score: 0.85,
                privacy: 'heir_only',
                created_at: new Date().toISOString(),
              });
              seenMemories.add('profession');
            }
          }
        }
        
        // ===== SERVICES & EXPERIENCES =====
        // Rosie's Tantric Massage
        if (content.match(/Rosie/i) && content.match(/tantric|massage/i)) {
          const key = 'service_rosie';
          if (!seenMemories.has(key)) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: "Service: Rosie's Tantric Massage in Manchester",
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // General spa/wellness services
        const spaMatch = content.match(/(?:spa|massage|wellness|therapy)\s+(?:at\s+|called\s+)?([A-Z][a-zA-Z\s&]+?)(?:\.|,|in)/i);
        if (spaMatch && !content.match(/Rosie/i)) {
          const spa = spaMatch[1].trim();
          const key = `spa_${spa.toLowerCase().substring(0, 15).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && spa.length > 2) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Spa/Wellness: ${spa}`,
              importance_score: 0.75,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== PREFERENCES (I love/like/enjoy/want) =====
        const preferenceMatch = content.match(/I\s+(?:love|like|enjoy|want|prefer)\s+([a-zA-Z\s]+?)(?:\.|,|and|but|because)/i);
        if (preferenceMatch) {
          const preference = preferenceMatch[1].trim();
          const key = `pref_${preference.toLowerCase().substring(0, 20).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && preference.length > 3 && preference.length < 50) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Likes: ${preference}`,
              importance_score: 0.65,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
        
        // ===== INTERESTS & HOBBIES =====
        const interestMatch = content.match(/I\s+(?:enjoy|do|practice|play)\s+([a-zA-Z\s]+?)(?:\.|,|and|for)/i);
        if (interestMatch) {
          const interest = interestMatch[1].trim();
          const key = `interest_${interest.toLowerCase().substring(0, 20).replace(/\s/g, '')}`;
          if (!seenMemories.has(key) && interest.length > 3 && interest.length < 50) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'preference',
              content: `Interest/Hobby: ${interest}`,
              importance_score: 0.7,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add(key);
          }
        }
      }
      
      // ===== CONTEXT FROM ASSISTANT RESPONSES =====
      // If assistant mentions facts and user doesn't correct, it's likely true
      if (msg.role === 'assistant') {
        const nextMsg = conv.messages[i + 1];
        
        // Extract context that wasn't corrected
        if (nextMsg && nextMsg.role === 'user' && !nextMsg.content.match(/no|not|wrong|actually|incorrect/i)) {
          // Assistant mentions user's age
          const ageMatch = msg.content.match(/(\d+)[-\s]year[-\s]old/i);
          if (ageMatch && !seenMemories.has('age')) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'context',
              content: `Age: ${ageMatch[1]} years old`,
              importance_score: 0.7,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add('age');
          }
          
          // Assistant mentions location details
          const locationContext = msg.content.match(/you're staying at ([A-Z][a-zA-Z\s]+)/i);
          if (locationContext && !seenMemories.has('hotel_context')) {
            const place = locationContext[1].trim();
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'context',
              content: `Context: Staying at ${place}`,
              importance_score: 0.65,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add('hotel_context');
          }
        }
      }
    }
  }

  console.log(`Enhanced extraction found ${memories.length} memories from ${conversations.length} conversations`);
  return memories;
}
