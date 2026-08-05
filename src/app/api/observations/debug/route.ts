import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check table exists
    const { data, error } = await supabase
      .from('chart_observations')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }, { status: 200 });
    }

    // 2. Try a test insert
    const testPayload = {
      user_id: 'debug-test',
      symbol: 'TEST',
      title: 'Debug test observation',
      observed_at: new Date().toISOString(),
      screenshot_urls: [],
      tags: [],
    };

    const insertRes = await supabase
      .from('chart_observations')
      .insert(testPayload)
      .select()
      .single();

    if (insertRes.error) {
      return NextResponse.json({
        status: 'insert_error',
        message: insertRes.error.message,
        code: insertRes.error.code,
        hint: insertRes.error.hint,
      }, { status: 200 });
    }

    // 3. Clean up the test row
    await supabase.from('chart_observations').delete().eq('id', insertRes.data.id);

    return NextResponse.json({
      status: 'ok',
      table_accessible: true,
      insert_works: true,
      sample_row: insertRes.data,
    });

  } catch (err) {
    return NextResponse.json({ status: 'exception', error: String(err) }, { status: 200 });
  }
}
