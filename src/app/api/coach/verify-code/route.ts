import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { accessCode } = await req.json();
    const envCode = process.env.AI_BETA_ACCESS_CODE
      ? process.env.AI_BETA_ACCESS_CODE.replace(/^['"]|['"]$/g, '').trim()
      : '';
    const validCodes = ['SPYLONG2026$p', envCode].filter(Boolean);
    const supplied = (accessCode || '').trim();

    if (supplied && validCodes.includes(supplied)) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid Beta Access Code. Please check your password.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[POST /api/coach/verify-code] Error:', err);
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
