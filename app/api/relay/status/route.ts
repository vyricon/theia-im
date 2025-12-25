import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { UserStatusEnum } from '@/lib/types/relay';

/**
 * GET /api/relay/status
 * Get current user status
 */
export async function GET(request: NextRequest) {
  try {
    const userPhone = process.env.YOUR_PHONE_NUMBER;

    if (!userPhone) {
      return Response.json(
        { error: 'YOUR_PHONE_NUMBER not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('theia_user_status')
      .select('*')
      .eq('user_phone', userPhone)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ status: data });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relay/status
 * Update user status
 */
export async function POST(request: NextRequest) {
  try {
    const userPhone = process.env.YOUR_PHONE_NUMBER;

    if (!userPhone) {
      return Response.json(
        { error: 'YOUR_PHONE_NUMBER not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parseResult = UserStatusEnum.safeParse(body.status);

    if (!parseResult.success) {
      return Response.json(
        { error: 'Invalid status. Must be: available, busy, away, sleep, or dnd' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('theia_user_status').upsert(
      {
        user_phone: userPhone,
        status: parseResult.data,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_phone',
      }
    );

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, status: parseResult.data });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
