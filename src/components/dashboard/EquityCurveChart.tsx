'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { EquityPoint } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { Account } from '@/lib/types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface EquityCurveChartProps {
  data: EquityPoint[];
  accounts: Account[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as EquityPoint;
  const isPos  = point.cumulative_pnl >= 0;

  return (
    <div className="bg-[#0d0d14] border border-[#1e1e30] rounded-xl p-3 shadow-2xl min-w-[175px]">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1a1a28]">
        <span className="text-[11px] font-semibold text-[#555]">{label === 'Start' ? 'Starting Point' : label}</span>
        {point.trade_count > 0 ? (
          <span className="text-[9px] bg-[#1a1a28] text-[#555] px-1.5 py-0.5 rounded font-mono">
            #{point.trade_count}
          </span>
        ) : (
          <span className="text-[9px] bg-indigo-950/60 text-indigo-400 border border-indigo-800/30 px-1.5 py-0.5 rounded">
            Start
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#444]">Balance</span>
          <span className="font-bold text-[#e0e0e0]">{formatCurrency(point.balance)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#444]">Cumulative PnL</span>
          <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(point.cumulative_pnl, true)}
          </span>
        </div>
        {point.pct_return !== undefined && (
          <div className="flex justify-between text-[10px]">
            <span className="text-[#444]">Total Return</span>
            <span className={`font-semibold ${point.pct_return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {point.pct_return >= 0 ? '+' : ''}{point.pct_return}%
            </span>
          </div>
        )}
        {point.symbol && (
          <div className="flex justify-between text-[10px] pt-1.5 border-t border-[#1a1a28]">
            <span className="text-[#333] font-mono">{point.symbol}</span>
            <span className={point.pnl && point.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {point.pnl != null ? formatCurrency(point.pnl, true) : '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function EquityCurveChart({ data, accounts }: EquityCurveChartProps) {
  const [mode, setMode] = useState<'balance' | 'pnl'>('balance');

  const latestPoint    = data.length > 0 ? data[data.length - 1] : null;
  const currentBalance = latestPoint?.balance ?? (accounts[0]?.initial_balance ?? 1000);
  const cumulativePnl  = latestPoint?.cumulative_pnl ?? 0;
  const pctReturn      = latestPoint?.pct_return ?? 0;
  const isPos          = cumulativePnl >= 0;

  const strokeColor = isPos ? '#10b981' : '#f43f5e';
  const gradId      = isPos ? 'eqGreen' : 'eqRed';

  return (
    <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-bold text-[#e8e8e8] tracking-tight">Equity Curve</h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#111] text-[#333] border border-[#1e1e1e] font-mono">
              started ${(
                (accounts.find(a => a.account_type === 'live') ?? accounts[0])?.initial_balance ?? 1000
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-extrabold text-[#e8e8e8]">
              {mode === 'balance' ? formatCurrency(currentBalance) : formatCurrency(cumulativePnl, true)}
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {pctReturn >= 0 ? '+' : ''}{pctReturn}%
            </span>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#0d0d0d] p-0.5 rounded-xl border border-[#1a1a1a] self-start">
          {(['balance', 'pnl'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[#444] hover:text-[#888]'
              }`}>
              {m === 'balance' ? 'Balance' : 'Net PnL'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.length <= 1 ? (
        <div className="h-52 flex flex-col items-center justify-center gap-3 border border-dashed border-[#1a1a1a] rounded-xl">
          <Activity className="w-6 h-6 text-[#1e1e1e]" />
          <p className="text-[11px] text-[#2a2a2a]">Close your first trade to see the equity curve</p>
        </div>
      ) : (
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#333', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (!v || v === 'Start') return 'Start';
                  const p = v.split('-');
                  return p.length === 3 ? `${p[1]}/${p[2]}` : v;
                }}
              />
              <YAxis
                tick={{ fill: '#333', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={52}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              {mode === 'pnl' && (
                <ReferenceLine y={0} stroke="#2a2a2a" strokeDasharray="4 4" />
              )}
              <Area
                type="monotone"
                dataKey={mode === 'balance' ? 'balance' : 'cumulative_pnl'}
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradId})`}
                animationDuration={600}
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, stroke: '#0a0a0f', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
