import { getTrades } from '@/lib/db';
import { isEvaluatedTrade, formatCurrency, formatPercent } from '@/lib/utils';
import { computeAnalytics } from '@/components/analytics/analyticsCompute';
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient';
import { TrendingUp, TrendingDown, Award, Target, BarChart3, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const trades = await getTrades();
  const closed = trades.filter(isEvaluatedTrade);

  const analytics = computeAnalytics(trades);

  /* ── Top-line KPIs ─────────────────────────────────────────────────── */
  const wins   = closed.filter((t) => t.net_pnl > 0);
  const losses = closed.filter((t) => t.net_pnl < 0);

  const totalNetPnl   = closed.reduce((s, t) => s + t.net_pnl, 0);
  const grossPnl      = closed.reduce((s, t) => s + (t.gross_pnl || 0), 0);
  const winRate       = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgWin        = wins.length  > 0 ? wins.reduce((s, t) => s + t.net_pnl, 0) / wins.length : 0;
  const avgLoss       = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0) / losses.length) : 0;
  const profitFactor  = avgLoss > 0 ? avgWin / avgLoss : null;
  const expectancy    = closed.length > 0
    ? (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss
    : 0;

  const largestWin    = wins.length  > 0 ? Math.max(...wins.map((t)   => t.net_pnl)) : 0;
  const largestLoss   = losses.length > 0 ? Math.min(...losses.map((t) => t.net_pnl)) : 0;

  const kpis = [
    {
      label: 'Total Trades',
      value: closed.length.toString(),
      sub: `${wins.length}W / ${losses.length}L`,
      icon: BarChart3,
      color: 'indigo',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      sub: winRate >= 50 ? 'Above 50% ✓' : 'Below 50% ✗',
      icon: Target,
      color: winRate >= 50 ? 'emerald' : 'red',
    },
    {
      label: 'Profit Factor',
      value: profitFactor !== null ? profitFactor.toFixed(2) : '—',
      sub: profitFactor !== null ? (profitFactor >= 1.5 ? 'Strong edge' : profitFactor >= 1 ? 'Break even+' : 'Losing system') : 'No losses yet',
      icon: TrendingUp,
      color: profitFactor === null ? 'slate' : profitFactor >= 1.5 ? 'emerald' : profitFactor >= 1 ? 'amber' : 'red',
    },
    {
      label: 'Expectancy',
      value: formatCurrency(expectancy, true),
      sub: 'Per trade (avg net)',
      icon: Zap,
      color: expectancy >= 0 ? 'emerald' : 'red',
    },
    {
      label: 'Avg Win',
      value: formatCurrency(avgWin),
      sub: `Largest: ${formatCurrency(largestWin)}`,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Avg Loss',
      value: formatCurrency(avgLoss),
      sub: `Worst: ${formatCurrency(largestLoss)}`,
      icon: TrendingDown,
      color: 'red',
    },
  ];

  const colorMap: Record<string, string> = {
    indigo:  'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400',
    amber:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400',
    slate:   'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#2a2a2a] text-slate-500 dark:text-[#737373]',
  };
  const iconBgMap: Record<string, string> = {
    indigo:  'bg-indigo-100 dark:bg-indigo-900/40',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40',
    red:     'bg-red-100 dark:bg-red-900/40',
    amber:   'bg-amber-100 dark:bg-amber-900/40',
    slate:   'bg-slate-100 dark:bg-[#252525]',
  };

  return (
    <div className="p-5 max-w-full space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#e8e8e8] tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5 font-medium">
            Deep-dive stats across {closed.length} closed trade{closed.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30 rounded-xl px-3 py-2">
          <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {analytics.symbols.length} symbol{analytics.symbols.length !== 1 ? 's' : ''} tracked
          </span>
        </div>
      </div>

      {/* Empty state */}
      {closed.length === 0 && (
        <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-[#333] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-[#aaa] mb-2">No Closed Trades Yet</h2>
          <p className="text-sm text-slate-500 dark:text-[#737373] max-w-sm mx-auto">
            Log and close some trades to unlock your performance analytics — day-of-week breakdowns, timing heatmaps, symbol rankings, and more.
          </p>
        </div>
      )}

      {/* KPI Grid */}
      {closed.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map(({ label, value, sub, icon: Icon, color }) => (
            <div
              key={label}
              className={`flex flex-col gap-2.5 p-3.5 rounded-2xl border ${colorMap[color]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBgMap[color]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-xl font-black leading-tight">{value}</p>
                <p className="text-[10px] opacity-60 mt-0.5 font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed analytics tabs */}
      {closed.length > 0 && <AnalyticsClient data={analytics} />}
    </div>
  );
}
