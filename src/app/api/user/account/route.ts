import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { confirmation } = await req.json();
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation phrase does not match' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Delete user trades, accounts, routine, observations, tags, profile, preferences
    await Promise.allSettled([
      supabase.from('trades').delete().eq('user_id', userId),
      supabase.from('accounts').delete().eq('user_id', userId),
      supabase.from('routine').delete().eq('user_id', userId),
      supabase.from('chart_observations').delete().eq('user_id', userId),
      supabase.from('confluence_tags').delete().eq('user_id', userId),
      supabase.from('user_profiles').delete().eq('user_id', userId),
      supabase.from('coach_preferences').delete().eq('user_id', userId),
      supabase.from('security_audit_logs').delete().eq('user_id', userId),
    ]);

    // Sign user out
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: 'Account and all data purged' });
  } catch (err) {
    console.error('[DELETE /api/user/account] Error:', err);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
