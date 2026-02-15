// app/api/memories/temporal/route.ts
// Search memories by date/time

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { query, agentId, userId } = await req.json();
    
    if (!query || !agentId) {
      return NextResponse.json(
        { error: 'Query and agentId required' },
        { status: 400 }
      );
    }
    
    // Parse temporal query
    const temporalContext = parseTemporalQuery(query);
    
    let memories;
    
    if (temporalContext.type === 'relative_day') {
      // "last Monday", "last Friday"
      memories = await getMemoriesByDayOfWeek(
        agentId,
        temporalContext.dayOfWeek!,
        temporalContext.weeksBack || 1
      );
    } else if (temporalContext.type === 'recent') {
      // "last week", "last month", "yesterday"
      memories = await getRecentMemories(
        agentId,
        temporalContext.daysAgo!
      );
    } else if (temporalContext.type === 'date_range') {
      // "in January", "in 2025"
      memories = await getMemoriesByDateRange(
        agentId,
        temporalContext.startDate!,
        temporalContext.endDate!
      );
    } else {
      // Fallback to recent memories
      memories = await getRecentMemories(agentId, 7);
    }
    
    return NextResponse.json({
      memories: memories || [],
      temporalContext: temporalContext
    });
    
  } catch (error: any) {
    console.error('Temporal search error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Parse natural language temporal queries
 */
function parseTemporalQuery(query: string): {
  type: 'relative_day' | 'recent' | 'date_range' | 'unknown';
  dayOfWeek?: string;
  weeksBack?: number;
  daysAgo?: number;
  startDate?: string;
  endDate?: string;
} {
  const lowerQuery = query.toLowerCase();
  
  // "last Monday", "last Tuesday", etc.
  const dayPattern = /last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
  const dayMatch = lowerQuery.match(dayPattern);
  if (dayMatch) {
    return {
      type: 'relative_day',
      dayOfWeek: dayMatch[1],
      weeksBack: 1
    };
  }
  
  // "yesterday"
  if (lowerQuery.includes('yesterday')) {
    return {
      type: 'recent',
      daysAgo: 1
    };
  }
  
  // "last week"
  if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
    return {
      type: 'recent',
      daysAgo: 7
    };
  }
  
  // "last month"
  if (lowerQuery.includes('last month') || lowerQuery.includes('past month')) {
    return {
      type: 'recent',
      daysAgo: 30
    };
  }
  
  // "last 2 weeks"
  const weeksPattern = /last\s+(\d+)\s+weeks?/i;
  const weeksMatch = lowerQuery.match(weeksPattern);
  if (weeksMatch) {
    return {
      type: 'recent',
      daysAgo: parseInt(weeksMatch[1]) * 7
    };
  }
  
  // "in January", "in January 2026"
  const monthPattern = /in\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i;
  const monthMatch = lowerQuery.match(monthPattern);
  if (monthMatch) {
    const monthName = monthMatch[1];
    const year = monthMatch[2] || new Date().getFullYear().toString();
    const monthNum = getMonthNumber(monthName);
    
    const startDate = new Date(parseInt(year), monthNum, 1).toISOString();
    const endDate = new Date(parseInt(year), monthNum + 1, 0).toISOString();
    
    return {
      type: 'date_range',
      startDate,
      endDate
    };
  }
  
  // "in 2025", "in 2026"
  const yearPattern = /in\s+(\d{4})/i;
  const yearMatch = lowerQuery.match(yearPattern);
  if (yearMatch) {
    const year = yearMatch[1];
    return {
      type: 'date_range',
      startDate: `${year}-01-01T00:00:00Z`,
      endDate: `${year}-12-31T23:59:59Z`
    };
  }
  
  return { type: 'unknown' };
}

function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  return months[monthName.toLowerCase()] || 0;
}

async function getMemoriesByDayOfWeek(
  agentId: string,
  dayOfWeek: string,
  weeksBack: number = 1
) {
  const { data, error } = await supabase.rpc('get_memories_by_day_of_week', {
    agent_uuid: agentId,
    day_name: dayOfWeek,
    weeks_back: weeksBack
  });
  
  if (error) {
    console.error('Error fetching memories by day:', error);
    return [];
  }
  
  return data || [];
}

async function getRecentMemories(
  agentId: string,
  daysAgo: number
) {
  const { data, error } = await supabase.rpc('get_recent_memories', {
    agent_uuid: agentId,
    days_ago: daysAgo
  });
  
  if (error) {
    console.error('Error fetching recent memories:', error);
    return [];
  }
  
  return data || [];
}

async function getMemoriesByDateRange(
  agentId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase.rpc('search_memories_by_date', {
    agent_uuid: agentId,
    start_date: startDate,
    end_date: endDate
  });
  
  if (error) {
    console.error('Error fetching memories by date range:', error);
    return [];
  }
  
  return data || [];
}
