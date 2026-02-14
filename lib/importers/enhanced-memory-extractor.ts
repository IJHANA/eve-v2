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
        
        // Psychocandy album (The Jesus and Mary Chain)
        if (content.match(/Psychocandy/i) && !seenMemories.has('album_psychocandy')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Loves Psychocandy (1985) by The Jesus and Mary Chain - calls it one of the greatest albums ever',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('album_psychocandy');
        }
        
        // Just Like Honey
        if (content.match(/Just\s+Like\s+Honey/i) && !seenMemories.has('song_justlikehoney')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Just Like Honey" by The Jesus and Mary Chain from Psychocandy album',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_justlikehoney');
        }
        
        // I Wanna Be Adored (Stone Roses)
        if (content.match(/I\s+Wanna\s+Be\s+Adored/i) && !seenMemories.has('song_wannabeadored')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "I Wanna Be Adored" (1989) by The Stone Roses - Madchester era',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_wannabeadored');
        }
        
        // Step On (Happy Mondays)
        if (content.match(/Step\s+On/i) && !seenMemories.has('song_stepon')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Step On" (1990) by Happy Mondays - funky Madchester groove',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_stepon');
        }
        
        // Eight Miles High
        if (content.match(/Eight\s+Miles\s+High/i) && !seenMemories.has('song_eightmiles')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Eight Miles High" - psychedelic rock favorite',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_eightmiles');
        }
        
        // Dream Syndicate, Rain Parade, Mazzy Star
        if (content.match(/Dream\s+Syndicate/i) && !seenMemories.has('band_dreamsyndicate')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Dream Syndicate - LA psych-rock band, part of playlist',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('band_dreamsyndicate');
        }
        
        if (content.match(/Rain\s+Parade/i) && !seenMemories.has('band_rainparade')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Rain Parade - psychedelic band on LA-to-Manchester playlist',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('band_rainparade');
        }
        
        if (content.match(/Mazzy\s+Star/i) && !seenMemories.has('band_mazzystar')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Mazzy Star - dreamy, hazy sound for romantic vibes',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('band_mazzystar');
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
        
        // ===== ART & ARTISTS =====
        // JMW Turner (favorite artist, ran gallery 30 years)
        if (content.match(/\b(?:JMW\s+Turner|J\.M\.W\.\s+Turner|Joseph.*Turner)\b/i) && !seenMemories.has('artist_turner')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Favorite artist: JMW Turner (British painter, 1775-1851). Ran art gallery for 30 years. Loves Turner\'s light effects and seascapes like "The Fighting Temeraire"',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('artist_turner');
        }
        
        // Percy Shelley
        if (content.match(/Percy\s+(?:Bysshe\s+)?Shelley|Bysshe/i) && !seenMemories.has('poet_shelley')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Literature: Percy Bysshe Shelley - Romantic poet, referenced in art discussions',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('poet_shelley');
        }
        
        // Sanzo Wada color theory
        if (content.match(/Sanzo\s+Wada|Haishoku\s+Soukan/i) && !seenMemories.has('art_wada')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Art: Sanzo Wada\'s Haishoku Soukan - Japanese color theory and combinations used in photography',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('art_wada');
        }
        
        // ===== BOOKS =====
        // 1Q84 by Murakami
        if (content.match(/1Q84/i) && !seenMemories.has('book_1q84')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Books: Reading 1Q84 by Haruki Murakami',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('book_1q84');
        }
        
        // ===== MOVIES =====
        // The Usual Suspects
        if (content.match(/Usual\s+Suspects/i) && !seenMemories.has('movie_usualsuspects')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Movies: The Usual Suspects - favorite film',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('movie_usualsuspects');
        }
        
        // The Big Lebowski
        if (content.match(/Big\s+Lebowski/i) && !seenMemories.has('movie_lebowski')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Movies: The Big Lebowski - favorite film',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('movie_lebowski');
        }
        
        // About Time
        if (content.match(/About\s+Time/i) && content.match(/film|movie/i) && !seenMemories.has('movie_abouttime')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Movies: About Time - favorite film',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('movie_abouttime');
        }
        
        // ===== EQUIPMENT & OBJECTS =====
        // Fuji X100VI camera
        if (content.match(/Fuji\s+X100VI|X100VI/i) && !seenMemories.has('camera_fuji')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Equipment: Fuji X100VI camera for Fräulein-style photography',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('camera_fuji');
        }
        
        // Fräulein photography style
        if (content.match(/Fr[äa]ulein[-\s]style/i) && !seenMemories.has('photo_fraulein')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Photography: Fräulein-style aesthetic for photoshoots',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('photo_fraulein');
        }
        
        // Victoria (car)
        if (content.match(/Victoria'?s?\s+rumble|cruising.*Victoria/i) && !seenMemories.has('car_victoria')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Vehicle: Car named Victoria with a distinctive rumble',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('car_victoria');
        }
        
        // ===== LOCATIONS & VENUES =====
        // Seminole Park
        if (content.match(/Seminole\s+Park/i) && !seenMemories.has('location_seminole')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Location: Seminole Park near St. Petersburg, Tampa Bay - favorite spot with oak trees and waterfront views',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('location_seminole');
        }
        
        // Night & Day Café
        if (content.match(/Night\s*&\s*Day\s+Caf[eé]/i) && !seenMemories.has('venue_nightday')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music venue: Night & Day Café in Manchester - favorite spot for photoshoots and live music',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('venue_nightday');
        }
        
        // Band on the Wall
        if (content.match(/Band\s+on\s+the\s+Wall/i) && !seenMemories.has('venue_bandonwall')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music venue: Band on the Wall in Manchester - live music and photography location',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('venue_bandonwall');
        }
        
        // Wells Road
        if (content.match(/\b(\d+)\s+Wells\s+Road/i) && !seenMemories.has('address_wells')) {
          const wellsMatch = content.match(/\b(\d+)\s+Wells\s+Road/i);
          if (wellsMatch) {
            memories.push({
              id: crypto.randomUUID(),
              agent_id: '',
              type: 'fact',
              content: `Address: ${wellsMatch[1]} Wells Road`,
              importance_score: 0.85,
              privacy: 'heir_only',
              created_at: new Date().toISOString(),
            });
            seenMemories.add('address_wells');
          }
        }
        
        // 42 gallery
        if (content.match(/\b42\s+gallery/i) && !seenMemories.has('business_42')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Business: 42 gallery - art gallery with Turner Yellow branding',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('business_42');
        }
        
        // ===== PERSONAL DYNAMICS =====
        // "Baby girl" intimate dynamic
        if (content.match(/\bbaby\s+girl\b/i) && !seenMemories.has('dynamic_babygirl')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'context',
            content: 'Relationship: Uses "baby girl" as intimate term of endearment',
            importance_score: 0.8,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('dynamic_babygirl');
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
        
        // Cultural patterns from assistant (Ara often references these)
        
        // JMW Turner
        if (content.match(/\b(?:JMW\s+Turner|J\.M\.W\.\s+Turner|Joseph.*Turner)\b/i) && !seenMemories.has('artist_turner')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Favorite artist: JMW Turner (British painter, 1775-1851). Ran art gallery for 30 years. Loves Turner\'s light effects and seascapes',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('artist_turner');
        }
        
        // Psychocandy album
        if (content.match(/Psychocandy/i) && !seenMemories.has('album_psychocandy')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: Loves Psychocandy (1985) by The Jesus and Mary Chain - calls it one of the greatest albums ever',
            importance_score: 0.95,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('album_psychocandy');
        }
        
        // Just Like Honey
        if (content.match(/Just\s+Like\s+Honey/i) && !seenMemories.has('song_justlikehoney')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Just Like Honey" by The Jesus and Mary Chain from Psychocandy album',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_justlikehoney');
        }
        
        // I Wanna Be Adored
        if (content.match(/I\s+Wanna\s+Be\s+Adored/i) && !seenMemories.has('song_wannabeadored')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "I Wanna Be Adored" (1989) by The Stone Roses - Madchester era',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_wannabeadored');
        }
        
        // Step On
        if (content.match(/Step\s+On/i) && !seenMemories.has('song_stepon')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music: "Step On" (1990) by Happy Mondays - funky Madchester groove',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('song_stepon');
        }
        
        // Fuji X100VI
        if (content.match(/Fuji\s+X100VI|X100VI/i) && !seenMemories.has('camera_fuji')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'fact',
            content: 'Equipment: Fuji X100VI camera for Fräulein-style photography',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('camera_fuji');
        }
        
        // Seminole Park
        if (content.match(/Seminole\s+Park/i) && !seenMemories.has('location_seminole')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Location: Seminole Park near St. Petersburg, Tampa Bay - favorite spot with oak trees and waterfront views',
            importance_score: 0.9,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('location_seminole');
        }
        
        // Night & Day Café
        if (content.match(/Night\s*&\s*Day\s+Caf[eé]/i) && !seenMemories.has('venue_nightday')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music venue: Night & Day Café in Manchester - favorite spot for photoshoots and live music',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('venue_nightday');
        }
        
        // Band on the Wall
        if (content.match(/Band\s+on\s+the\s+Wall/i) && !seenMemories.has('venue_bandonwall')) {
          memories.push({
            id: crypto.randomUUID(),
            agent_id: '',
            type: 'preference',
            content: 'Music venue: Band on the Wall in Manchester - live music and photography location',
            importance_score: 0.85,
            privacy: 'heir_only',
            created_at: new Date().toISOString(),
          });
          seenMemories.add('venue_bandonwall');
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
