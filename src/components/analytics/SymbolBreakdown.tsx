'use client';

import type { SymbolStat } from './analyticsCompute';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props { data: SymbolStat[] }

function PfBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[#252525] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 1 ? 'bg-indigo-500' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-[#bbb] w-8 text-right flex-shrink-0">
        {value === 99 ? '∞' : value.toFixed(2)}
      </span>
    </div>
  );
}

export function SymbolBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400 dark:text-[#555]">No symbol data yet</p>
      </div>
    );
  }

  const maxPf = Math.min(Math.max(...data.map((s) => s.profitFactor), 0), 10);
  const best  = data[0];
  const worst = data[data.length - 1];

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Symbol Performance</h3>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Ranked by total P&L — includes profit factor</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {best && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-lg px-2.5 py-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Best: {best.symbol}</span>
            </div>
          )}
          {worst && worst.symbol !== best?.symbol && (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg px-2.5 py-1.5">
              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400">Worst: {worst.symbol}</span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop table — scrollable if needed */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="grid grid-cols-[90px_1fr_60px_88px_88px] gap-2 px-3 mb-2 min-w-[420px]">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wide">Symbol</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wide">Profit Factor</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wide text-right">WR%</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wide text-right">Avg P&L</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wide text-right">Total P&L</span>
        </div>
        <div className="space-y-1.5 min-w-[420px]">
          {data.map((s, i) => {
            const Icon = s.totalPnl > 0 ? TrendingUp : s.totalPnl < 0 ? TrendingDown : Minus;
            const pnlColor = s.totalPnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : s.totalPnl < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500';
            return (
              <div key={s.symbol} className="grid grid-cols-[90px_1fr_60px_88px_88px] gap-2 items-center bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#222] rounded-xl px-3 py-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#555] w-4">{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <Icon className={`w-3 h-3 flex-shrink-0 ${pnlColor}`} />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-[#e8e8e8]">{s.symbol}</span>
                  </div>
                </div>
                <PfBar value={s.profitFactor} max={maxPf} />
                <span className={`text-xs font-bold text-right ${s.winRate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{s.winRate.toFixed(0)}%</span>
                <span className={`text-xs font-bold text-right ${pnlColor}`}>{formatCurrency(s.avgPnl, true)}</span>
                <span className={`text-xs font-bold text-right ${pnlColor}`}>{formatCurrency(s.totalPnl, true)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {data.map((s, i) => {
          const Icon = s.totalPnl > 0 ? TrendingUp : s.totalPnl < 0 ? TrendingDown : Minus;
          const pnlColor = s.totalPnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : s.totalPnl < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500';
          return (
            <div key={s.symbol} className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#555]">#{i + 1}</span>
                  <Icon className={`w-3.5 h-3.5 ${pnlColor}`} />
                  <span className="text-sm font-extrabold text-slate-900 dark:text-[#e8e8e8]">{s.symbol}</span>
                </div>
                <span className={`text-sm font-extrabold ${pnlColor}`}>{formatCurrency(s.totalPnl, true)}</span>
              </div>
              <PfBar value={s.profitFactor} max={maxPf} />
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#737373]">Win Rate</span>
                <span className={`font-bold ${s.winRate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{s.winRate.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#737373]">Avg P&L</span>
                <span className={`font-bold ${pnlColor}`}>{formatCurrency(s.avgPnl, true)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#737373]">Trades</span>
                <span className="font-bold text-slate-700 dark:text-[#bbb]">{s.trades}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-[#555] mt-3 text-center">
        {data.length} symbol{data.length !== 1 ? 's' : ''} tracked · Profit Factor = gross wins ÷ gross losses
      </p>
    </div>
  );
}
