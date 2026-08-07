import { NextRequest, NextResponse } from 'next/server';
import { getRoutine, updateRoutine } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createSupabaseServerClient();
    const routine = await getRoutine(supabase);
    return NextResponse.json(routine);
  } catch (error) {
    console.error('Error fetching routine:', error);
    return NextResponse.json({ error: 'Failed to fetch routine' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const updated = await updateRoutine(body, supabase);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
  }
}
