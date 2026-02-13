// app/api/import/route.ts - Import conversation history from other platforms

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectParser } from '@/lib/importers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fileContent, userId } = await req.json();

    if (!fileContent || !userId) {
      return NextResponse.json(
        { error: 'File content and user ID are required' },
        { status: 400 }
      );
    }

    // Detect which platform this export is from
    const parser = await detectParser(fileContent);

    if (!parser) {
      return NextResponse.json(
        { 
          error: 'Could not detect export format. Please ensure you uploaded a valid Grok, ChatGPT, or Claude export file.' 
        },
        { status: 400 }
      );
    }

    console.log(`Detected format: ${parser.name}`);

    // Parse the file
    const importedData = await parser.parse(fileContent);

    console.log(`Parsed ${importedData.conversations.length} conversations, ${importedData.memories.length} memories`);

    // Create the agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: 'Eve',
        type: 'personal',
        core_prompt: importedData.inferredPersonality,
        default_mood: {
          empathy: 0.7,
          directness: 0.5,
          humor: 0.5,
          formality: 0.3,
          intensity: 0.5,
          romanticism: 0.1,
        },
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error creating agent:', agentError);
      throw new Error('Failed to create agent');
    }

    console.log(`Created agent: ${agent.id}`);

    // Import conversations
    if (importedData.conversations.length > 0) {
      const conversationsToInsert = importedData.conversations.map(conv => ({
        agent_id: agent.id,
        user_id: userId,
        messages: conv.messages,
        summary: conv.summary,
        themes: conv.themes,
        privacy: 'heir_only',
        started_at: conv.started_at,
        ended_at: conv.ended_at || conv.started_at,
      }));

      const { error: convError } = await supabase
        .from('conversations')
        .insert(conversationsToInsert);

      if (convError) {
        console.error('Error importing conversations:', convError);
        // Don't fail the whole import if conversations fail
      } else {
        console.log(`Imported ${conversationsToInsert.length} conversations`);
      }
    }

    // Import memories
    if (importedData.memories.length > 0) {
      const memoriesToInsert = importedData.memories.map(mem => ({
        agent_id: agent.id,
        type: mem.type,
        content: mem.content,
        importance_score: mem.importance_score,
        privacy: 'heir_only',
      }));

      const { error: memError } = await supabase
        .from('memories')
        .insert(memoriesToInsert);

      if (memError) {
        console.error('Error importing memories:', memError);
        // Don't fail the whole import if memories fail
      } else {
        console.log(`Imported ${memoriesToInsert.length} memories`);
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      imported: {
        source: importedData.metadata.source,
        conversations: importedData.conversations.length,
        messages: importedData.metadata.messageCount,
        memories: importedData.memories.length,
      },
    });

  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
