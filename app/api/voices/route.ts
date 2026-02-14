// app/api/voices/route.ts - Fetch available voices from ElevenLabs

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Fetch voices from ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    // Add legacy voices that should always be available
    const legacyVoices = [
      {
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel',
        labels: { description: 'Legacy Default - Warm, clear American voice' },
        category: 'premade',
      },
      {
        voice_id: 'oWAxZDx7w5VEj9dCyTzz',
        name: 'Grace',
        labels: { description: 'Legacy Default - Soft, gentle voice' },
        category: 'premade',
      },
    ];

    // Combine ElevenLabs voices with legacy voices
    const allVoices = [
      ...legacyVoices,
      ...data.voices,
    ];

    // Format voices for frontend
    const formattedVoices = allVoices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      description: voice.labels?.description || voice.labels?.accent || 'Custom voice',
      category: voice.category || 'custom',
    }));

    return NextResponse.json({ voices: formattedVoices });

  } catch (error: any) {
    console.error('Voices API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
