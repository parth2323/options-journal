import { NextRequest, NextResponse } from 'next/server';
import { getAccountStats, getEquityCurve } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id') ?? undefined;

  const stats = await getAccountStats(accountId);
  const equity = await getEquityCurve(accountId);

  return NextResponse.json({ stats, equity });
}
