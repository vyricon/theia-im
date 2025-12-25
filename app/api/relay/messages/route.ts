import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/client';

/**
 * GET /api/relay/messages
 * Get relay message history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('theia_relay_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (from) {
      query = query.eq('from_user', from);
    }

    if (to) {
      query = query.eq('to_user', to);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ messages: data });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
