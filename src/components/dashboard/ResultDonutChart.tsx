'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '@/lib/types';
import { formatCurrency, isEvaluatedTrade } from '@/lib/utils';

interface ResultDonutProps { trades: Trade[]; }

const PALETTE = {
  win:       { stroke: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '#047857', border: 'rgba(16,185,129,0.25)' },
  loss:      { stroke: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '#b91c1c', border: 'rgba(239,68,68,0.25)' },
  breakeven: { stroke: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '#b45309', border: 'rgba(245,158,11,0.25)' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const p = PALETTE[d.key as keyof typeof PALETTE];
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 min-w-[140px] dark:bg-[#111] dark:border-[#222]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
        <span className="text-[12px] font-bold text-slate-900 dark:text-[#e0e0e0]">{d.name}</span>
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-slate-500 dark:text-[#737373]">Trades</span>
          <span className="font-bold text-slate-900 dark:text-[#ddd] font-mono">{d.count}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-slate-500 dark:text-[#737373]">Net PnL</span>
          <span className="font-bold font-mono" style={{ color: p.stroke }}>{formatCurrency(d.pnl, true)}</span>
        </div>
      </div>
    </div>
  );
};

export function ResultDonutChart({ trades }: ResultDonutProps) {
  const closed = trades.filter(isEvaluatedTrade);
  const winTrades  = closed.filter((t) => t.net_pnl > 0 || t.result === 'win');
  const lossTrades = closed.filter((t) => t.net_pnl < 0 || t.result === 'loss');
  const beTrades   = closed.filter((t) => (t.net_pnl === 0 && t.result === 'breakeven') || (t.net_pnl === 0 && t.result !== 'win' && t.result !== 'loss'));

  const winPnl  = winTrades.reduce((s, t) => s + t.net_pnl, 0);
  const lossPnl = lossTrades.reduce((s, t) => s + t.net_pnl, 0);
  const bePnl   = beTrades.reduce((s, t) => s + t.net_pnl, 0);

  const data = [
    { key: 'win',       name: 'Win',       count: winTrades.length,  pnl: winPnl  },
    { key: 'loss',      name: 'Loss',      count: lossTrades.length, pnl: lossPnl },
    { key: 'breakeven', name: 'Breakeven', count: beTrades.length,   pnl: bePnl   },
  ].filter((d) => d.count > 0);

  const total = closed.length;
  const totalPnl = closed.reduce((s, t) => s + t.net_pnl, 0);

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Results breakdown</h2>
        {total > 0 && (
          <span className="text-[10px] text-slate-500 dark:text-[#737373] font-mono font-semibold">{total} closed</span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-36 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-[#1e1e1e] rounded-xl bg-slate-50/50 dark:bg-transparent">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-[#1e1e1e]" />
          <p className="text-[11px] text-slate-500 dark:text-[#737373]">No closed trades logged yet</p>
        </div>
      ) : (
        <>
          {/* Donut */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="count"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={PALETTE[entry.key as keyof typeof PALETTE].stroke}
                      opacity={0.85}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-base font-black font-mono ${totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-[#737373] uppercase font-extrabold mt-0.5 tracking-wider">Net PnL</span>
            </div>
          </div>

          {/* Legend rows */}
          <div className="space-y-2 mt-1">
            {data.map((d) => {
              const p = PALETTE[d.key as keyof typeof PALETTE];
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.key} className="flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all"
                  style={{ background: p.bg, borderColor: p.border }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
                  <span className="text-[11px] font-extrabold flex-1 dark:text-white" style={{ color: p.label }}>{d.name}</span>
                  <span className="text-[11px] text-slate-600 dark:text-[#a0a0a0] font-mono font-bold">{d.count}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ color: p.label, background: p.bg }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
