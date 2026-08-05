import { NextRequest, NextResponse } from 'next/server';
import { getObservation, updateObservation, deleteObservation } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const observation = await getObservation(id);
  if (!observation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(observation);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    if (body.symbol) body.symbol = String(body.symbol).toUpperCase();
    const updated = await updateObservation(id, body);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update observation' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await deleteObservation(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
