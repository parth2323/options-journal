import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getTrades, createTrade } from '@/lib/db';
import { TradeResult, TradeStatus } from '@/lib/types';
import { calculateGrossPnl, calculatePercentRisk, suggestResult } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id') ?? undefined;
  const trades = await getTrades(accountId);
  return NextResponse.json(trades);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let grossPnl = Number(body.gross_pnl) || 0;
  if (!body.gross_pnl && body.entry_price != null && body.exit_price != null) {
    const computed = calculateGrossPnl({
      entryPrice: Number(body.entry_price),
      exitPrice: Number(body.exit_price),
      quantity: Number(body.quantity) || 1,
      direction: body.direction,
      instrumentType: body.instrument_type,
    });
    if (computed !== null) {
      grossPnl = computed;
    }
  }

  const commission = Number(body.commission) || 0;
  const netPnl = grossPnl - commission;

  let percentRisk = body.percent_risk ? Number(body.percent_risk) : undefined;
  if (percentRisk === undefined && body.entry_price != null && body.exit_price != null) {
    const computedRisk = calculatePercentRisk({
      entryPrice: Number(body.entry_price),
      exitPrice: Number(body.exit_price),
      quantity: Number(body.quantity) || 1,
      commission,
      direction: body.direction,
      instrumentType: body.instrument_type,
    });
    if (computedRisk !== null) {
      percentRisk = computedRisk;
    }
  }

  // Auto-suggest result if not explicitly set
  let result: TradeResult = body.result || suggestResult(netPnl);

  const trade = await createTrade({
    user_id: 'local',
    account_id: body.account_id,
    symbol: body.symbol,
    contract_label: body.contract_label,
    instrument_type: body.instrument_type ?? 'options',
    direction: body.direction,
    opened_at: body.opened_at,
    closed_at: body.closed_at || undefined,
    timezone: body.timezone ?? 'America/New_York',
    quantity: Number(body.quantity) || 1,
    entry_price: body.entry_price ? Number(body.entry_price) : undefined,
    exit_price: body.exit_price ? Number(body.exit_price) : undefined,
    gross_pnl: grossPnl,
    commission: commission,
    result,
    status: (body.status as TradeStatus) ?? 'open',
    session: body.session,
    percent_risk: percentRisk,
    confluences: Array.isArray(body.confluences) ? body.confluences : [],
    notes: body.notes,
    screenshot_url: body.screenshot_url,
  });

  revalidatePath('/', 'layout');
  return NextResponse.json(trade, { status: 201 });
}
