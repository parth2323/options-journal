import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { duplicateTrade } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const duplicate = await duplicateTrade(id);
  if (!duplicate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/', 'layout');
  return NextResponse.json(duplicate, { status: 201 });
}
