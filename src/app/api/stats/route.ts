import { NextRequest, NextResponse } from 'next/server';
import { getAccountStats, getEquityCurve } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id') ?? undefined;

  const stats = await getAccountStats(accountId);
  const equity = await getEquityCurve(accountId);

  return NextResponse.json({ stats, equity });
}
