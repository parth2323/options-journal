'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DayOfWeekStat } from './analyticsCompute';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  data: DayOfWeekStat[];
  showRisk?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d: DayOfWeekStat = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-[#1e1e30] rounded-xl shadow-xl p-3 min-w-[150px]">
      <p className="text-xs font-bold text-slate-700 dark:text-[#e0e0e0] mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Avg P&L</span>
          <span className={`font-bold ${d.avgPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCurrency(d.avgPnl, true)}
          </span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Win Rate</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{d.winRate.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Trades</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{d.trades}</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Total P&L</span>
          <span className={`font-bold ${d.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCurrency(d.totalPnl, true)}
          </span>
        </div>
      </div>
    </div>
  );
};

export function DayOfWeekChart({ data, showRisk }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400 dark:text-[#555]">No closed trades yet</p>
      </div>
    );
  }

  const bestDay = [...data].sort((a, b) => b.avgPnl - a.avgPnl)[0];
  const worstDay = [...data].sort((a, b) => a.avgPnl - b.avgPnl)[0];

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Day of Week Performance</h3>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Average P&L per day</p>
        </div>
        <div className="flex gap-3">
          {bestDay && bestDay.trades > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-lg px-2.5 py-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Best: {bestDay.day}</span>
            </div>
          )}
          {worstDay && worstDay.trades > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg px-2.5 py-1.5">
              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span className="text-[11px] font-bold text-red-700 dark:text-red-400">Worst: {worstDay.day}</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 mb-5">
        <div className="grid grid-cols-5 gap-3 min-w-[320px]">
          {data.map((d) => (
            <div key={d.day} className="text-center">
              <div className="text-[10px] font-bold text-slate-500 dark:text-[#737373] mb-1">{d.day}</div>
              <div className={`text-[11px] font-bold mb-0.5 ${d.trades === 0 ? 'text-slate-400 dark:text-[#555]' : d.avgPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {d.trades > 0 ? formatCurrency(d.avgPnl, true) : '—'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#737373]">{d.winRate > 0 ? `${d.winRate.toFixed(0)}% WR` : '—'}</div>
              <div className="text-[9px] text-slate-400 dark:text-[#555] mt-0.5">{d.trades} trades</div>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={32} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={48} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
          <Bar dataKey="avgPnl" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.avgPnl >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
