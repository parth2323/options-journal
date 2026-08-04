import { NextRequest, NextResponse } from 'next/server';
import { getAccount, updateAccount, deleteAccount } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(account);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const account = await updateAccount(id, body);
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(account);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await deleteAccount(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
