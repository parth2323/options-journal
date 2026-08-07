import { NextResponse } from 'next/server';
import { getSecurityAuditLogs } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createSupabaseServerClient();
    const logs = await getSecurityAuditLogs(supabase);
    return NextResponse.json(logs);
  } catch (err) {
    console.error('[GET /api/user/security-logs] Error:', err);
    return NextResponse.json([]);
  }
}
