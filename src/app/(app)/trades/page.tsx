import { getTrades, getAccounts } from '@/lib/db';
import { TradesTable } from '@/components/trades/TradesTable';
import Link from 'next/link';
import { Download, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

function fmt(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `-${formatted}` : `+${formatted}`;
}

export default async function TradesPage() {
  const trades = await getTrades();
  const accounts = await getAccounts();

  // Quick stats
  const wins = trades.filter((t) => t.result === 'win');
  const losses = trades.filter((t) => t.result === 'loss');
  const netPnl = trades.reduce((s, t) => s + t.net_pnl, 0);
  const winRate = trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : '0.0';
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.net_pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.net_pnl)) : 0;
  const isProfit = netPnl >= 0;

  return (
    <div className="px-3 py-4 sm:p-5 max-w-full space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-[#e8e8e8] tracking-tight truncate">Trade Journal</h1>
          <p className="text-[10px] sm:text-xs text-[#737373] mt-0.5 font-medium">
            {trades.length} trade{trades.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/api/export"
            className="hidden sm:flex items-center gap-2 bg-[#0a0a0f] border border-[#1a1a28] text-[#a0a0a0] hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <a
            href="/api/export"
            className="sm:hidden flex items-center gap-1.5 bg-[#0a0a0f] border border-[#1a1a28] text-[#a0a0a0] hover:text-white text-xs font-bold px-2.5 py-2 rounded-xl transition-all active:scale-95"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/trades/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 sm:px-4 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">New </span>Trade
          </Link>
        </div>
      </div>

      {/* Stats Banner */}
      {trades.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Net PnL */}
          <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-4 relative overflow-hidden transition-all shadow-sm">
            <p className="text-[10px] font-extrabold tracking-wider uppercase text-[#737373] mb-1.5">Net PnL</p>
            <p
              className={`text-2xl font-black font-mono tracking-tight ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {fmt(netPnl)}
            </p>
            <p className="text-[10px] text-[#737373] mt-1.5 font-mono">{trades.length} trades total</p>
          </div>

          {/* Win Rate */}
          <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-4 relative overflow-hidden transition-all shadow-sm">
            <p className="text-[10px] font-extrabold tracking-wider uppercase text-[#737373] mb-1.5">Win Rate</p>
            <p className="text-2xl font-black font-mono text-[#e8e8e8] tracking-tight">{winRate}%</p>
            <p className="text-[10px] mt-1.5 font-mono font-bold">
              <span className="text-emerald-400">{wins.length}W</span>
              <span className="text-[#333] mx-1.5">·</span>
              <span className="text-red-400">{losses.length}L</span>
            </p>
          </div>

          {/* Best Trade */}
          <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-4 relative overflow-hidden transition-all shadow-sm">
            <p className="text-[10px] font-extrabold tracking-wider uppercase text-[#737373] mb-1.5">Best Trade</p>
            <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {bestTrade >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(bestTrade)}
            </p>
            <p className="text-[10px] text-[#737373] mt-1.5 font-mono">single trade</p>
          </div>

          {/* Worst Trade */}
          <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-4 relative overflow-hidden transition-all shadow-sm">
            <p className="text-[10px] font-extrabold tracking-wider uppercase text-[#737373] mb-1.5">Worst Trade</p>
            <p className="text-2xl font-black text-red-400 font-mono tracking-tight">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(worstTrade)}
            </p>
            <p className="text-[10px] text-[#737373] mt-1.5 font-mono">single trade</p>
          </div>
        </div>
      )}

      <TradesTable trades={trades} accounts={accounts} />
    </div>
  );
}
