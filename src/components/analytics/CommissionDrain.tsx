'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CommissionData } from './analyticsCompute';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';

interface Props {
  data: CommissionData;
  detailed?: boolean;
}

export function CommissionDrain({ data, detailed = false }: Props) {
  const { totalCommission, totalGrossPnl, commissionAsPctOfGross, avgCommissionPerTrade, mostExpensiveDay, weeklyCommission } = data;

  const severity = commissionAsPctOfGross > 30 ? 'high' : commissionAsPctOfGross > 15 ? 'medium' : 'low';

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Commission Drain</h3>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">How much commissions eat into gross P&L</p>
        </div>
        {severity === 'high' && (
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg px-2.5 py-1.5 flex-shrink-0">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">High drain!</span>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide">Total Commission</span>
          </div>
          <p className="text-lg font-black text-red-500 dark:text-red-400">{formatCurrency(totalCommission)}</p>
          <p className="text-[10px] text-slate-400 dark:text-[#555] mt-0.5">{formatCurrency(avgCommissionPerTrade)}/trade avg</p>
        </div>
        <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide">% of Gross P&L</span>
          </div>
          <p className={`text-lg font-black ${severity === 'high' ? 'text-red-500 dark:text-red-400' : severity === 'medium' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {commissionAsPctOfGross.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 dark:text-[#555] mt-0.5">of {formatCurrency(totalGrossPnl)} gross</p>
        </div>
      </div>

      {/* Insight */}
      <div className={`rounded-xl p-3 border text-xs ${severity === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/20 text-red-700 dark:text-red-400' : severity === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/20 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/20 text-emerald-700 dark:text-emerald-400'}`}>
        {severity === 'high' && `⚠️ Commissions are consuming over 30% of your gross P&L. Consider reducing trade frequency or negotiating lower rates.`}
        {severity === 'medium' && `💡 Commissions are consuming ${commissionAsPctOfGross.toFixed(0)}% of gross P&L. Focus on higher-quality setups to improve net returns.`}
        {severity === 'low' && `✅ Commission-to-gross ratio is healthy at ${commissionAsPctOfGross.toFixed(0)}%. Your setup selectivity is paying off.`}
        {mostExpensiveDay !== '—' && ` Most expensive day: ${mostExpensiveDay}.`}
      </div>

      {/* Weekly chart (only in detailed mode or if there's data) */}
      {detailed && weeklyCommission.length > 1 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide mb-2">Weekly Commission (Last 12 Weeks)</p>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={weeklyCommission} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Commission']}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(100,100,100,0.2)' }}
              />
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="amount" stroke="#ef4444" fill="url(#commGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
