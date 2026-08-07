'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { HoldTimeBucket } from './analyticsCompute';

interface Props { data: HoldTimeBucket[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const wins  = payload.find((p: any) => p.dataKey === 'wins')?.value  || 0;
  const losses = payload.find((p: any) => p.dataKey === 'losses')?.value || 0;
  const total = wins + losses;
  const wr = total > 0 ? ((wins / total) * 100).toFixed(0) : '—';
  return (
    <div className="bg-white dark:bg-[#0d0d14] border border-slate-200 dark:border-[#1e1e30] rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-xs font-bold text-slate-700 dark:text-[#e0e0e0] mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Wins</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{wins}</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4">
          <span className="text-red-500 dark:text-red-400 font-medium">Losses</span>
          <span className="font-bold text-slate-800 dark:text-[#ccc]">{losses}</span>
        </div>
        <div className="flex justify-between text-[11px] gap-4 pt-1 border-t border-slate-100 dark:border-[#1a1a28]">
          <span className="text-slate-500 dark:text-[#737373]">Win Rate</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{wr}%</span>
        </div>
      </div>
    </div>
  );
};

export function HoldTimeHistogram({ data }: Props) {
  const hasData = data.some((b) => b.wins + b.losses > 0);
  if (!hasData) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400 dark:text-[#555]">No hold time data — add close timestamps to trades</p>
      </div>
    );
  }

  // Find best/worst hold time by win rate
  const withData = data.filter((b) => b.wins + b.losses >= 2);
  const bestBucket  = [...withData].sort((a, b) => (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses)))[0];
  const worstBucket = [...withData].sort((a, b) => (a.wins / (a.wins + a.losses)) - (b.wins / (b.wins + b.losses)))[0];

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Hold Time Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Wins vs losses by holding duration</p>
        </div>
        <div className="flex gap-2 text-[10px]">
          {bestBucket && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-lg px-2 py-1">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Best: {bestBucket.label}</span>
            </div>
          )}
          {worstBucket && worstBucket.label !== bestBucket?.label && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg px-2 py-1">
              <span className="text-red-700 dark:text-red-400 font-bold">Worst: {worstBucket.label}</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="20%" margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, fontWeight: 700, color: 'currentColor' }}>{value === 'wins' ? 'Wins' : 'Losses'}</span>}
          />
          <Bar dataKey="wins"   fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          <Bar dataKey="losses" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
