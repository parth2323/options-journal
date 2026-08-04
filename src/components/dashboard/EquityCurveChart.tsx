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
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 min-w-[175px] dark:bg-[#0d0d14] dark:border-[#1e1e30]">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#1a1a28]">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-[#555]">{label === 'Start' ? 'Starting Point' : label}</span>
        {point.trade_count > 0 ? (
          <span className="text-[9px] bg-slate-100 text-slate-600 dark:bg-[#1a1a28] dark:text-[#555] px-1.5 py-0.5 rounded font-mono font-bold">
            #{point.trade_count}
          </span>
        ) : (
          <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 px-1.5 py-0.5 rounded font-bold">
            Start
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500 dark:text-[#737373]">Balance</span>
          <span className="font-bold text-slate-900 dark:text-[#e0e0e0]">{formatCurrency(point.balance)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500 dark:text-[#737373]">Cumulative PnL</span>
          <span className={`font-bold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(point.cumulative_pnl, true)}
          </span>
        </div>
        {point.pct_return !== undefined && (
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 dark:text-[#737373]">Total Return</span>
            <span className={`font-semibold ${point.pct_return >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {point.pct_return >= 0 ? '+' : ''}{point.pct_return}%
            </span>
          </div>
        )}
        {point.symbol && (
          <div className="flex justify-between text-[10px] pt-1.5 border-t border-slate-100 dark:border-[#1a1a28]">
            <span className="text-slate-500 dark:text-[#737373] font-mono font-bold">{point.symbol}</span>
            <span className={point.pnl && point.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold' : 'text-red-600 dark:text-red-400 font-mono font-bold'}>
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
    <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Equity Curve</h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold badge-started">
              started ${(
                (accounts.find(a => a.account_type === 'live') ?? accounts[0])?.initial_balance ?? 1000
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-[#e8e8e8]">
              {mode === 'balance' ? formatCurrency(currentBalance) : formatCurrency(cumulativePnl, true)}
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-extrabold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {pctReturn >= 0 ? '+' : ''}{pctReturn}%
            </span>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl dark:bg-[#0d0d0d] dark:border-[#1a1a1a] self-start">
          {(['balance', 'pnl'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-[#737373] dark:hover:text-[#a0a0a0]'
              }`}>
              {m === 'balance' ? 'Balance' : 'Net PnL'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[210px] w-full">
        {data.length <= 1 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-[#333] border border-dashed border-slate-200 dark:border-[#1a1a1a] rounded-xl bg-slate-50/50 dark:bg-transparent">
            <Activity className="w-6 h-6 mb-2 opacity-40 text-indigo-500" />
            <p className="text-xs font-semibold">Log more trades to visualize equity progression</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="eqGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="eqRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={6}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(v) => mode === 'balance' ? `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}` : `${v >= 0 ? '+' : ''}$${v}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {mode === 'pnl' && <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.4} />}

              <Area
                type="monotone"
                dataKey={mode === 'balance' ? 'balance' : 'cumulative_pnl'}
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 4, stroke: strokeColor, strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
