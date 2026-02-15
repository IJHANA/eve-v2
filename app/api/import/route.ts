import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectParser } from '@/lib/importers';
import { extractEnhancedMemories } from '@/lib/importers/enhanced-memory-extractor';
import { extractMemoriesWithAI, mergeMemories } from '@/lib/importers/ai-memory-extractor';
import { extractSongsWithPatterns, songsToMemories } from '@/lib/importers/music-extractor';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Run enhanced memory extraction to get MORE memories (pattern-based)
    const enhancedMemories = extractEnhancedMemories(importedData.conversations);
    
    // Extract songs from tagged formats [song: Title | artist: Artist]
    console.log('Extracting songs from conversations...');
    const songs = extractSongsWithPatterns(importedData.conversations);
    const songMemories = songsToMemories(songs);
    console.log(`Music extraction found ${songs.length} songs`);
    
    // Run AI-powered memory extraction for rich, contextual memories
    console.log('Starting AI-powered memory extraction...');
    const aiMemories = await extractMemoriesWithAI(importedData.conversations, 100);
    console.log(`AI extraction found ${aiMemories.length} memories`);
    
    // Merge all sources: basic + enhanced + songs + AI
    let allMemories = [...importedData.memories];
    
    // Add enhanced memories (pattern-based)
    const existingContents = new Set(allMemories.map(m => m.content.toLowerCase()));
    for (const mem of enhancedMemories) {
      if (!existingContents.has(mem.content.toLowerCase())) {
        allMemories.push(mem);
        existingContents.add(mem.content.toLowerCase());
      }
    }
    
    // Add song memories
    for (const mem of songMemories) {
      if (!existingContents.has(mem.content.toLowerCase())) {
        allMemories.push(mem);
        existingContents.add(mem.content.toLowerCase());
      }
    }
    
    // Merge with AI memories (handles deduplication)
    allMemories = mergeMemories(aiMemories, allMemories);
    
    // Replace with combined memories
    importedData.memories = allMemories;
    
    console.log(`Total memories: ${importedData.memories.length} (basic: ${importedData.memories.length}, pattern: ${enhancedMemories.length}, songs: ${songs.length}, AI: ${aiMemories.length})`);


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

    // Import memories with embeddings (insert individually to handle errors)
    if (importedData.memories.length > 0) {
      console.log(`Generating embeddings for ${importedData.memories.length} memories...`);
      
      // Generate embeddings in batches of 10 to avoid rate limits
      const batchSize = 10;
      const memoriesToInsert = [];
      
      for (let i = 0; i < importedData.memories.length; i += batchSize) {
        const batch = importedData.memories.slice(i, i + batchSize);
        
        // Generate embeddings for this batch
        const embeddingPromises = batch.map(async (mem) => {
          try {
            const embedding = await getEmbedding(mem.content);
            return {
              agent_id: agentId,
              type: mem.type,
              content: mem.content,
              importance_score: mem.importance_score,
              privacy: 'heir_only',
              embedding: embedding.length > 0 ? embedding : null,
            };
          } catch (error) {
            console.error(`Error generating embedding for memory: ${mem.content.substring(0, 50)}`, error);
            // Still insert the memory without embedding
            return {
              agent_id: agentId,
              type: mem.type,
              content: mem.content,
              importance_score: mem.importance_score,
              privacy: 'heir_only',
              embedding: null,
            };
          }
        });
        
        const batchResults = await Promise.all(embeddingPromises);
        memoriesToInsert.push(...batchResults);
        
        console.log(`Generated embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(importedData.memories.length / batchSize)}`);
      }

      // Insert memories one at a time to avoid transaction rollback
      let successCount = 0;
      let failCount = 0;
      
      for (const memory of memoriesToInsert) {
        try {
          const { error: memError } = await supabase
            .from('memories')
            .insert([memory]); // Insert one at a time
          
          if (memError) {
            console.error(`Failed to insert memory (type: ${memory.type}):`, memError.message);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Exception inserting memory:`, err);
          failCount++;
        }
      }

      console.log(`✅ Imported ${successCount} memories, ❌ ${failCount} failed`);
      
      // Store actual success count for response
      const actualMemoriesImported = successCount;
    } else {
      const actualMemoriesImported = 0;
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
        memories: importedData.memories.length, // Total attempted
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

/**
 * Generate embedding for semantic search
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000), // Truncate to fit model limits
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}
