import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile, logSecurityEvent } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createSupabaseServerClient();
    const profile = await getUserProfile(supabase);
    return NextResponse.json(profile);
  } catch (err) {
    console.error('[GET /api/user/profile] Error:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = await createSupabaseServerClient();

    const updated = await updateUserProfile(body, supabase);
    await logSecurityEvent('profile_update', 'Updated profile identity & market preferences', supabase);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/user/profile] Error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
