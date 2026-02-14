// app/api/import/route.ts - Import conversation history from other platforms

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectParser } from '@/lib/importers';
import { extractEnhancedMemories } from '@/lib/importers/enhanced-memory-extractor';

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

    console.log(`Parsed ${importedData.conversations.length} conversations, ${importedData.memories.length} basic memories`);

    // Run enhanced memory extraction to get MORE memories
    const enhancedMemories = extractEnhancedMemories(importedData.conversations);
    
    // Combine basic + enhanced memories (dedupe by content)
    const allMemories = [...importedData.memories];
    const existingContents = new Set(allMemories.map(m => m.content.toLowerCase()));
    
    for (const mem of enhancedMemories) {
      if (!existingContents.has(mem.content.toLowerCase())) {
        allMemories.push(mem);
        existingContents.add(mem.content.toLowerCase());
      }
    }
    
    // Replace with combined memories
    importedData.memories = allMemories;
    
    console.log(`Enhanced extraction added ${enhancedMemories.length} more memories (total: ${allMemories.length})`);


    // Check if user already has an agent
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'personal')
      .single();

    let agentId: string;
    let importedConversationCount = 0;
    let skippedConversationCount = 0;

    if (existingAgent) {
      // User already has an agent - add conversations to existing agent
      console.log(`Using existing agent: ${existingAgent.id}`);
      agentId = existingAgent.id;
    } else {
      // Create new agent
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
        throw new Error(`Failed to create agent: ${agentError.message}`);
      }

      console.log(`Created new agent: ${agent.id}`);
      agentId = agent.id;
    }

    // Import conversations
    if (importedData.conversations.length > 0) {
      // Check for existing conversations to avoid duplicates
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('messages, started_at')
        .eq('agent_id', agentId);

      const existingHashes = new Set(
        (existingConversations || []).map(conv => {
          // Create hash from first message + timestamp
          const firstMsg = conv.messages?.[0];
          if (!firstMsg) return '';
          return `${firstMsg.content?.slice(0, 100)}_${conv.started_at}`;
        })
      );

      // Filter out duplicates
      const conversationsToInsert = importedData.conversations
        .filter(conv => {
          const firstMsg = conv.messages?.[0];
          if (!firstMsg) return false;
          const hash = `${firstMsg.content?.slice(0, 100)}_${conv.started_at}`;
          return !existingHashes.has(hash);
        })
        .map(conv => ({
          agent_id: agentId,
          user_id: userId,
          messages: conv.messages,
          summary: conv.summary,
          themes: conv.themes,
          privacy: 'heir_only',
          started_at: conv.started_at,
          ended_at: conv.ended_at || conv.started_at,
        }));

      if (conversationsToInsert.length > 0) {
        const { error: convError } = await supabase
          .from('conversations')
          .insert(conversationsToInsert);

        if (convError) {
          console.error('Error importing conversations:', convError);
          // Don't fail the whole import if conversations fail
        } else {
          importedConversationCount = conversationsToInsert.length;
          skippedConversationCount = importedData.conversations.length - conversationsToInsert.length;
          console.log(`Imported ${importedConversationCount} new conversations (${skippedConversationCount} duplicates skipped)`);
        }
      } else {
        skippedConversationCount = importedData.conversations.length;
        console.log('No new conversations to import (all were duplicates)');
      }
    }

    // Import memories
    if (importedData.memories.length > 0) {
      const memoriesToInsert = importedData.memories.map(mem => ({
        agent_id: agentId,
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
      agent_id: agentId,
      inferredPersonality: importedData.inferredPersonality,
      imported: {
        source: importedData.metadata.source,
        conversations: importedConversationCount,
        conversationsSkipped: skippedConversationCount,
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
