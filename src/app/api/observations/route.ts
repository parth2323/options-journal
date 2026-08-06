import { NextRequest, NextResponse } from 'next/server';
import { getObservations, createObservation } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const observations = await getObservations();
    return NextResponse.json(observations);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { symbol, title, observed_at } = body;
    if (!symbol || !title || !observed_at) {
      return NextResponse.json(
        { error: 'symbol, title, and observed_at are required' },
        { status: 400 }
      );
    }

    const payload: Parameters<typeof createObservation>[0] = {
      user_id: userId,
      symbol: String(symbol).toUpperCase(),
      title: String(title).trim(),
      observed_at: String(observed_at),
      screenshot_urls: Array.isArray(body.screenshot_urls) ? body.screenshot_urls : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
    };

    if (body.timeframe)          payload.timeframe          = body.timeframe;
    if (body.body)               payload.body               = body.body;
    if (body.mood)               payload.mood               = body.mood;
    if (body.would_have_result)  payload.would_have_result  = body.would_have_result;

    const observation = await createObservation(payload);
    return NextResponse.json(observation, { status: 201 });
  } catch (err) {
    console.error('[POST /api/observations]', err);
    return NextResponse.json({ error: 'Failed to create observation' }, { status: 500 });
  }
}
