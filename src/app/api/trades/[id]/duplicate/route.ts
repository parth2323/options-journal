import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { duplicateTrade } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const copy = await duplicateTrade(id);
  if (!copy) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json(copy, { status: 201 });
}
