'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { SessionStat } from './analyticsCompute';
import { formatCurrency } from '@/lib/utils';

interface Props { data: SessionStat[] }

const COLORS: Record<string, string> = {
  'New York': '#6366f1',
  'London':   '#10b981',
  'Asia':     '#f59e0b',
  'Sydney':   '#ec4899',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d: SessionStat = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-[#1e1e30] rounded-xl shadow-xl p-3 min-w-[150px]">
      <p className="text-xs font-bold text-slate-700 dark:text-[#e0e0e0] mb-2">{label} Session</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Total P&L</span>
          <span className={`font-bold ${d.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{formatCurrency(d.totalPnl, true)}</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Avg P&L</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{formatCurrency(d.avgPnl, true)}</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Win Rate</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{d.winRate.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-slate-500 dark:text-[#737373]">Trades</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{d.trades}</span>
        </div>
      </div>
    </div>
  );
};

export function SessionBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400 dark:text-[#555]">No session data — tag trades with a session</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Session Breakdown</h3>
        <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Total P&L by trading session</p>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.slice(0, 4).map((s) => (
          <div key={s.session} className="flex items-center gap-2 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-2.5">
            <div className="w-2 h-full min-h-[32px] rounded-full flex-shrink-0" style={{ background: COLORS[s.session] || '#6366f1' }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 dark:text-[#aaa]">{s.session}</p>
              <p className={`text-xs font-extrabold ${s.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {formatCurrency(s.totalPnl, true)}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-[#555]">{s.trades} trades · {s.winRate.toFixed(0)}% WR</p>
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <YAxis type="category" dataKey="session" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
          <Bar dataKey="totalPnl" radius={[0, 6, 6, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[entry.session] || '#6366f1'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
