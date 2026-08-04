'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '@/lib/types';
import { formatCurrency, isEvaluatedTrade } from '@/lib/utils';

interface ResultDonutProps { trades: Trade[]; }

const PALETTE = {
  win:       { stroke: '#34d399', bg: 'rgba(52,211,153,0.12)', label: '#34d399', border: 'rgba(52,211,153,0.25)' },
  loss:      { stroke: '#f87171', bg: 'rgba(248,113,113,0.12)', label: '#f87171', border: 'rgba(248,113,113,0.25)' },
  breakeven: { stroke: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const p = PALETTE[d.key as keyof typeof PALETTE];
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-3 shadow-2xl min-w-[140px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
        <span className="text-[12px] font-bold text-[#e0e0e0]">{d.name}</span>
      </div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[#555]">Trades</span>
          <span className="font-bold text-[#ddd]">{d.count}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[#555]">Net PnL</span>
          <span className="font-bold" style={{ color: p.stroke }}>{formatCurrency(d.pnl, true)}</span>
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
    <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-[#e8e8e8] tracking-tight">Results</h2>
        {total > 0 && (
          <span className="text-[10px] text-[#333] font-mono">{total} closed</span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-36 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#1e1e1e]" />
          <p className="text-[11px] text-[#2a2a2a]">No closed trades yet</p>
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
              <span className={`text-base font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </span>
              <span className="text-[9px] text-[#333] mt-0.5">net PnL</span>
            </div>
          </div>

          {/* Legend rows */}
          <div className="space-y-2 mt-1">
            {data.map((d) => {
              const p = PALETTE[d.key as keyof typeof PALETTE];
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.key} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
                  <span className="text-[11px] font-semibold flex-1" style={{ color: p.label }}>{d.name}</span>
                  <span className="text-[11px] text-[#555] font-mono">{d.count}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ color: p.stroke, background: p.bg }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
