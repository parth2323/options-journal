import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTrade, updateTrade, deleteTrade } from '@/lib/db';
import { calculateGrossPnl, calculatePercentRisk, suggestResult } from '@/lib/utils';
import { getAuthenticatedUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const trade = await getTrade(id);
  if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(trade);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const current = await getTrade(id);

  if (current) {
    const entryPrice = body.entry_price !== undefined ? body.entry_price : current.entry_price;
    const exitPrice = body.exit_price !== undefined ? body.exit_price : current.exit_price;
    const quantity = body.quantity !== undefined ? body.quantity : current.quantity;
    const direction = body.direction !== undefined ? body.direction : current.direction;
    const instrumentType = body.instrument_type !== undefined ? body.instrument_type : current.instrument_type;
    const commission = body.commission !== undefined ? Number(body.commission) : current.commission;

    if (body.gross_pnl === undefined && entryPrice != null && exitPrice != null) {
      const computedGross = calculateGrossPnl({
        entryPrice: Number(entryPrice),
        exitPrice: Number(exitPrice),
        quantity: Number(quantity),
        direction,
        instrumentType,
      });
      if (computedGross !== null) {
        body.gross_pnl = computedGross;
      }
    }

    if (body.percent_risk === undefined && entryPrice != null && exitPrice != null) {
      const computedRisk = calculatePercentRisk({
        entryPrice: Number(entryPrice),
        exitPrice: Number(exitPrice),
        quantity: Number(quantity),
        commission,
        direction,
        instrumentType,
      });
      if (computedRisk !== null) {
        body.percent_risk = computedRisk;
      }
    }

    const gross = body.gross_pnl !== undefined ? Number(body.gross_pnl) : current.gross_pnl;
    body.net_pnl = gross - commission;
    if (!body.result) {
      body.result = suggestResult(body.net_pnl);
    }
  }

  const trade = await updateTrade(id, body);
  if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/', 'layout');
  return NextResponse.json(trade);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const ok = await deleteTrade(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
