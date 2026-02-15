// lib/importers/music-extractor.ts - Comprehensive music extraction

import type { Conversation, Memory } from '@/types';

export interface Song {
  title: string;
  artist?: string;
  album?: string;
  context?: string;
  year?: string;
  mentioned_in?: string[]; // Message IDs where mentioned
}

export interface MusicMemory extends Memory {
  metadata?: {
    type: 'song' | 'album' | 'artist';
    title: string;
    artist?: string;
    album?: string;
    year?: string;
    spotify_id?: string;
    spotify_url?: string;
  };
}

/**
 * Extract songs using comprehensive pattern matching
 */
export function extractSongsWithPatterns(conversations: Conversation[]): Song[] {
  const songs: Song[] = [];
  const seenSongs = new Set<string>();

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      const content = msg.content;
      let match; // Declare once for all patterns

      // Pattern 0: Inline tags [song: Title | artist: Artist | album: Album]
      const inlineTagPattern = /\[song:\s*([^|\]]+?)(?:\s*\|\s*artist:\s*([^|\]]+?))?(?:\s*\|\s*album:\s*([^\]]+?))?\]/gi;
      while ((match = inlineTagPattern.exec(content)) !== null) {
        const title = match[1].trim();
        const artist = match[2]?.trim();
        const album = match[3]?.trim();
        const key = `${title.toLowerCase()}_${artist?.toLowerCase() || 'unknown'}`;
        
        if (!seenSongs.has(key) && title.length > 2) {
          songs.push({ 
            title, 
            artist, 
            album,
            context: 'Tagged in conversation'
          });
          seenSongs.add(key);
        }
      }

      // Pattern 0b: HTML comments <!-- song: Title | artist: Artist | album: Album -->
      const commentPattern = /<!--\s*song:\s*([^|]+?)(?:\s*\|\s*artist:\s*([^|]+?))?(?:\s*\|\s*album:\s*([^|]+?))?\s*-->/gi;
      while ((match = commentPattern.exec(content)) !== null) {
        const title = match[1].trim();
        const artist = match[2]?.trim();
        const album = match[3]?.trim();
        const key = `${title.toLowerCase()}_${artist?.toLowerCase() || 'unknown'}`;
        
        if (!seenSongs.has(key) && title.length > 2) {
          songs.push({ 
            title, 
            artist, 
            album,
            context: 'Tagged in conversation'
          });
          seenSongs.add(key);
        }
      }

      // Pattern 1: "Song Title" by Artist
      const quotedByPattern = /"([^"]+)"\s*by\s*([A-Z][a-zA-Z\s&'.]+)/gi;
      while ((match = quotedByPattern.exec(content)) !== null) {
        const title = match[1].trim();
        const artist = match[2].trim();
        const key = `${title.toLowerCase()}_${artist.toLowerCase()}`;
        
        if (!seenSongs.has(key) && title.length > 2) {
          songs.push({ title, artist });
          seenSongs.add(key);
        }
      }

      // Pattern 2: Song - Artist format
      const dashPattern = /\b([A-Z][a-zA-Z\s']+)\s+-\s+([A-Z][a-zA-Z\s&]+)\b/g;
      while ((match = dashPattern.exec(content)) !== null) {
        const title = match[1].trim();
        const artist = match[2].trim();
        const key = `${title.toLowerCase()}_${artist.toLowerCase()}`;
        
        // Filter out non-song patterns
        if (!seenSongs.has(key) && 
            title.length > 2 && 
            title.length < 50 &&
            !title.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/i)) {
          songs.push({ title, artist });
          seenSongs.add(key);
        }
      }

      // Pattern 3: Artist's "Song Title"
      const possessivePattern = /([A-Z][a-zA-Z\s&]+)'?s?\s+"([^"]+)"/gi;
      while ((match = possessivePattern.exec(content)) !== null) {
        const artist = match[1].trim();
        const title = match[2].trim();
        const key = `${title.toLowerCase()}_${artist.toLowerCase()}`;
        
        if (!seenSongs.has(key) && title.length > 2) {
          songs.push({ title, artist });
          seenSongs.add(key);
        }
      }

      // Pattern 4: "listening to / playing / heard" Song
      const listeningPattern = /(?:listening to|playing|heard|love)\s+["']?([A-Z][a-zA-Z\s']+)["']?/gi;
      while ((match = listeningPattern.exec(content)) !== null) {
        const title = match[1].trim();
        const key = title.toLowerCase();
        
        // Only if not already captured with artist
        if (!seenSongs.has(key) && title.length > 2 && title.length < 30) {
          songs.push({ title });
          seenSongs.add(key);
        }
      }

      // Pattern 5: Known songs from your history
      const knownSongs = [
        { title: 'Just Like Honey', artist: 'The Jesus and Mary Chain', album: 'Psychocandy' },
        { title: 'I Wanna Be Adored', artist: 'The Stone Roses' },
        { title: 'Step On', artist: 'Happy Mondays' },
        { title: 'Eight Miles High', artist: 'The Byrds' },
        { title: 'At Last', artist: 'Etta James' },
        { title: 'Running Battle', artist: 'Kasabian' },
        { title: 'L.S.F.', artist: 'Kasabian' },
        { title: 'Set My Baby Free', artist: 'Ian Brown' },
        { title: 'The Death of You and Me', artist: "Noel Gallagher's High Flying Birds" },
      ];

      for (const known of knownSongs) {
        const regex = new RegExp(known.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (content.match(regex)) {
          const key = `${known.title.toLowerCase()}_${known.artist?.toLowerCase() || ''}`;
          if (!seenSongs.has(key)) {
            songs.push(known);
            seenSongs.add(key);
          }
        }
      }
    }
  }

  console.log(`Pattern extraction found ${songs.length} songs`);
  return songs;
}

/**
 * Convert songs to memory format
 */
export function songsToMemories(songs: Song[]): MusicMemory[] {
  return songs.map(song => {
    const parts = [];
    if (song.title) parts.push(`"${song.title}"`);
    if (song.artist) parts.push(`by ${song.artist}`);
    if (song.album) parts.push(`from ${song.album}`);
    if (song.year) parts.push(`(${song.year})`);
    
    const content = `Song: ${parts.join(' ')}`;
    
    return {
      id: crypto.randomUUID(),
      agent_id: '',
      type: 'preference',
      content,
      importance_score: 0.8,
      privacy: 'heir_only',
      created_at: new Date().toISOString(),
      metadata: {
        type: 'song',
        title: song.title,
        artist: song.artist,
        album: song.album,
        year: song.year,
      }
    };
  });
}

/**
 * Enrich songs with Spotify data
 */
export async function enrichWithSpotify(songs: Song[]): Promise<Song[]> {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.log('Spotify credentials not found, skipping enrichment');
    return songs;
  }

  // Get Spotify access token
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const { access_token } = await tokenResponse.json();

  const enrichedSongs: Song[] = [];

  for (const song of songs) {
    try {
      // Search Spotify
      const query = song.artist 
        ? `track:${song.title} artist:${song.artist}`
        : `track:${song.title}`;

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: { 'Authorization': `Bearer ${access_token}` }
        }
      );

      const data = await searchResponse.json();
      
      if (data.tracks?.items?.[0]) {
        const track = data.tracks.items[0];
        enrichedSongs.push({
          ...song,
          title: track.name, // Use official name
          artist: track.artists[0].name,
          album: track.album.name,
          year: track.album.release_date?.substring(0, 4),
        });
      } else {
        enrichedSongs.push(song);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error enriching ${song.title}:`, error);
      enrichedSongs.push(song);
    }
  }

  return enrichedSongs;
}

/**
 * Build playlist from extracted songs
 */
export function buildPlaylist(songs: Song[]): {
  name: string;
  songs: Song[];
  metadata: {
    total_songs: number;
    artists: string[];
    albums: string[];
  };
} {
  const artists = [...new Set(songs.map(s => s.artist).filter(Boolean))];
  const albums = [...new Set(songs.map(s => s.album).filter(Boolean))];

  return {
    name: 'My Conversation Playlist',
    songs,
    metadata: {
      total_songs: songs.length,
      artists: artists as string[],
      albums: albums as string[],
    }
  };
}

/**
 * Export playlist to various formats
 */
export function exportPlaylist(songs: Song[], format: 'text' | 'json' | 'm3u' | 'spotify'): string {
  switch (format) {
    case 'text':
      return songs.map(s => `${s.title}${s.artist ? ` - ${s.artist}` : ''}`).join('\n');
    
    case 'json':
      return JSON.stringify(songs, null, 2);
    
    case 'm3u':
      return '#EXTM3U\n' + songs.map(s => 
        `#EXTINF:-1,${s.artist || 'Unknown'} - ${s.title}\n${s.title}`
      ).join('\n');
    
    case 'spotify':
      // Return Spotify URIs if available
      return songs
        .map(s => s.title) // Would need spotify_id from enrichment
        .join('\n');
    
    default:
      return '';
  }
}
