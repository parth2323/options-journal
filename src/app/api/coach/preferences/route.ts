import { NextRequest, NextResponse } from 'next/server';
import { getCoachPreferences, updateCoachPreferences } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CoachPreferences, CoachFocusArea, DEFAULT_COACH_PREFS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createSupabaseServerClient();
    const prefs = await getCoachPreferences(supabase);
    return NextResponse.json(prefs);
  } catch (err) {
    console.error('[GET /api/coach/preferences] Error:', err);
    return NextResponse.json(DEFAULT_COACH_PREFS);
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    // Validate + sanitize each field before saving
    const prefs: CoachPreferences = {
      persona:         ['elite_options_coach','scalper_coach','swing_trader','risk_manager','psychologist'].includes(body.persona)
                         ? body.persona
                         : DEFAULT_COACH_PREFS.persona,
      tone:            ['tough_love','balanced','encouraging'].includes(body.tone)
                         ? body.tone
                         : DEFAULT_COACH_PREFS.tone,
      model:           ['deepseek-chat','deepseek-reasoner'].includes(body.model)
                         ? body.model
                         : DEFAULT_COACH_PREFS.model,
      leakMultiplier:  Math.min(5.0, Math.max(1.0, Number(body.leakMultiplier) || DEFAULT_COACH_PREFS.leakMultiplier)),
      maxRiskPercent:  Math.min(10.0, Math.max(0.5, Number(body.maxRiskPercent) || DEFAULT_COACH_PREFS.maxRiskPercent)),
      temperature:     Math.min(1.0, Math.max(0.0, Number(body.temperature) || DEFAULT_COACH_PREFS.temperature)),
      tradeSampleSize: Math.min(50, Math.max(5, parseInt(body.tradeSampleSize) || DEFAULT_COACH_PREFS.tradeSampleSize)),
      focusAreas:      Array.isArray(body.focusAreas)
                         ? (body.focusAreas as string[]).filter((f): f is CoachFocusArea =>
                             ['risk','timing','psychology','commissions','consistency'].includes(f))
                         : DEFAULT_COACH_PREFS.focusAreas,
    };

    const supabase = await createSupabaseServerClient();
    const updated = await updateCoachPreferences(prefs, supabase);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/coach/preferences] Error:', err);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
