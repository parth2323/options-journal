import { NextResponse } from 'next/server';
import { getTrades, getAccounts } from '@/lib/db';

export async function GET() {
  const trades = await getTrades();
  const accounts = await getAccounts();
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

  const headers = [
    'ID', 'Account', 'Symbol', 'Contract', 'Type', 'Direction',
    'Opened At', 'Closed At', 'Timezone', 'Quantity', 'Entry Price',
    'Exit Price', 'Gross PnL', 'Commission', 'Net PnL', 'Result',
    'Status', 'Session', '% Risk', 'Confluences', 'Notes',
  ];

  const rows = trades.map((t) => [
    t.id,
    accountMap.get(t.account_id) ?? t.account_id,
    t.symbol,
    t.contract_label ?? '',
    t.instrument_type,
    t.direction ?? '',
    t.opened_at,
    t.closed_at ?? '',
    t.timezone,
    t.quantity,
    t.entry_price ?? '',
    t.exit_price ?? '',
    t.gross_pnl,
    t.commission,
    t.net_pnl,
    t.result,
    t.status,
    t.session ?? '',
    t.percent_risk ?? '',
    t.confluences.join('; '),
    (t.notes ?? '').replace(/,/g, ' '),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="trades-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
