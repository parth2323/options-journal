import { NextRequest, NextResponse } from 'next/server';
import { getObservation, updateObservation, deleteObservation } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const observation = await getObservation(id);
  if (!observation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(observation);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const observation = await updateObservation(id, body);
  if (!observation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(observation);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await deleteObservation(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true }, { status: 200 });
}
