import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';
import { getUserProfile, logSecurityEvent } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const profile = await getUserProfile(supabase);
    const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Trader';
    const email = user?.email || 'Registered User';

    // Log request to security_audit_logs & console for administrator review
    await logSecurityEvent(
      'access_code_requested',
      `Beta Access Code requested by ${fullName} (${email})`,
      supabase
    );

    console.log(`[BETA ACCESS REQUEST] User: ${fullName} (${email}) | UserID: ${userId} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Access request received for ${fullName} (${email}). The administrator has been notified!`,
      email,
      fullName,
    });
  } catch (err) {
    console.error('[POST /api/coach/request-code] Error:', err);
    return NextResponse.json({ error: 'Failed to process access code request' }, { status: 500 });
  }
}
