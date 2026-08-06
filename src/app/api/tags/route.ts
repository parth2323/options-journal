import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getConfluenceTags, createConfluenceTag, updateConfluenceTag, deleteConfluenceTag } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tags = await getConfluenceTags();
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const tag = await createConfluenceTag({
    user_id: userId,
    label: body.label,
    color: body.color ?? 'gray',
  });
  revalidatePath('/', 'layout');
  return NextResponse.json(tag, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const tag = await updateConfluenceTag(body.id, { label: body.label, color: body.color });
  if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/', 'layout');
  return NextResponse.json(tag);
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = await deleteConfluenceTag(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
