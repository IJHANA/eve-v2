// app/api/rate-limit/route.ts
// Check if user can send a message

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Call database function to check rate limit
    const { data, error } = await supabase.rpc('can_send_message', {
      p_user_id: userId
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.allowed) {
      return NextResponse.json({
        allowed: false,
        reason: result.reason,
        waitSeconds: result.wait_seconds,
        messagesRemaining: result.messages_remaining
      });
    }

    return NextResponse.json({
      allowed: true,
      messagesRemaining: result.messages_remaining
    });

  } catch (error: any) {
    console.error('Rate limit API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
