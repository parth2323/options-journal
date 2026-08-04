import { NextRequest, NextResponse } from 'next/server';
import { getRoutine, updateRoutine } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routine = await getRoutine();
    return NextResponse.json(routine);
  } catch (error) {
    console.error('Error fetching routine:', error);
    return NextResponse.json({ error: 'Failed to fetch routine' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateRoutine(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
  }
}
