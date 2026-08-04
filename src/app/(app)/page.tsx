import { getTrades, getAccounts, getAccountStats, getEquityCurve } from '@/lib/db';
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart';
import { ResultDonutChart } from '@/components/dashboard/ResultDonutChart';
import { TodaysTradesSection } from '@/components/dashboard/TodaysTradesSection';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { formatCurrency, formatPercent, isEvaluatedTrade } from '@/lib/utils';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, DollarSign, Award, Calendar, BarChart2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [trades, accounts] = await Promise.all([getTrades(), getAccounts()]);
  const accountStats = await getAccountStats(undefined, accounts, trades);
  const equityCurve  = await getEquityCurve(undefined, accounts, trades);

  /* ─── Core numbers (using unified evaluated trades filter) ─────────── */
  const closedTrades  = trades.filter(isEvaluatedTrade);
  const wins          = closedTrades.filter((t) => t.net_pnl > 0 || t.result === 'win');
  const losses        = closedTrades.filter((t) => t.net_pnl < 0 || t.result === 'loss');

  const totalNetPnl   = closedTrades.reduce((s, t) => s + (t.net_pnl || 0), 0);
  const winRate       = closedTrades.length > 0
    ? Math.round((wins.length / closedTrades.length) * 1000) / 10
    : 0;

  /* Starting capital = primary live account's initial_balance (never sum across accounts) */
  const liveAccounts   = accounts.filter((a) => a.account_type === 'live');
  const primaryAccount = liveAccounts[0] ?? accounts[0];
  const initialCapital = primaryAccount?.initial_balance || 1000;

  const currentBalance  = initialCapital + totalNetPnl;
  const totalReturnPct  = initialCapital > 0
    ? Math.round(((currentBalance - initialCapital) / initialCapital) * 10000) / 100
    : 0;

  /* ─── Avg win / avg loss / profit factor ─────────────────────────────── */
  const avgWin  = wins.length > 0 ? wins.reduce((s, t) => s + t.net_pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? Math.round((avgWin / avgLoss) * 100) / 100 : null;

  /* ─── Best trade ──────────────────────────────────────────────────────── */
  const bestTrade = closedTrades.length > 0 ? closedTrades.reduce((best, t) => t.net_pnl > best.net_pnl ? t : best) : null;

  /* ─── Today's trades (using local date string) ───────────────────────── */
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const todaysTrades = trades.filter((t) => {
    const openDate  = t.opened_at ? new Date(t.opened_at).toLocaleDateString('en-CA') : '';
    const closeDate = t.closed_at ? new Date(t.closed_at).toLocaleDateString('en-CA') : '';
    return openDate === todayStr || closeDate === todayStr;
  });
  const todaysClosed = todaysTrades.filter(isEvaluatedTrade);
  const todaysNetPnl = todaysClosed.reduce((s, t) => s + (t.net_pnl || 0), 0);

  const isUp = totalNetPnl >= 0;
  const todayUp = todaysNetPnl >= 0;

  return (
    <div className="p-5 max-w-full space-y-5">

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#e8e8e8] tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5 font-medium">
            Primary account starting capital:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(initialCapital)} USD</span>
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center justify-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Trade
        </Link>
      </div>

      {/* ─── KPI Cards Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Account Balance */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md dark:bg-[#0d0d14] dark:border-indigo-900/30 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373]">Balance</span>
            <div className="kpi-icon-indigo p-1.5 rounded-lg border">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-[#e8e8e8] tracking-tight">{formatCurrency(currentBalance)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${isUp ? 'badge-win' : 'badge-loss'}`}>
              {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct}%
            </span>
            <span className="text-[10px] text-slate-400 dark:text-[#737373] font-mono">vs {formatCurrency(initialCapital)}</span>
          </div>
        </div>

        {/* Total Net PnL */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373]">Net PnL</span>
            <div className={`p-1.5 rounded-lg border ${isUp ? 'kpi-icon-green' : 'kpi-icon-red'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </div>
          </div>
          <p className={`text-2xl font-black font-mono tracking-tight ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalNetPnl, true)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-[#737373] mt-2 font-mono">{closedTrades.length} closed trade{closedTrades.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Win Rate */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373]">Win Rate</span>
            <div className="kpi-icon-amber p-1.5 rounded-lg border">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-[#e8e8e8] tracking-tight">{formatPercent(winRate)}</p>
          <div className="flex items-center gap-2 mt-2 font-mono">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">{wins.length}W</span>
            <span className="text-[10px] text-slate-300 dark:text-[#333]">·</span>
            <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold">{losses.length}L</span>
            {closedTrades.length - wins.length - losses.length > 0 && (
              <>
                <span className="text-[10px] text-slate-300 dark:text-[#333]">·</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">{closedTrades.length - wins.length - losses.length}BE</span>
              </>
            )}
          </div>
        </div>

        {/* Today's PnL */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373]">Today</span>
            <div className="kpi-icon-indigo p-1.5 rounded-lg border">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono tracking-tight ${todaysClosed.length === 0 ? 'text-slate-400 dark:text-[#737373]' : todayUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {todaysClosed.length === 0 ? '—' : formatCurrency(todaysNetPnl, true)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-[#737373] mt-2 font-mono">
            {todaysTrades.length} trade{todaysTrades.length !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* ─── KPI Cards Row 2 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Avg Win */}
        <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373] block mb-1.5">Avg Win</span>
          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{wins.length > 0 ? formatCurrency(avgWin) : '—'}</p>
          <p className="text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">per winning trade</p>
        </div>

        {/* Avg Loss */}
        <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373] block mb-1.5">Avg Loss</span>
          <p className="text-xl font-black font-mono text-red-600 dark:text-red-400">{losses.length > 0 ? formatCurrency(avgLoss) : '—'}</p>
          <p className="text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">per losing trade</p>
        </div>

        {/* Profit Factor */}
        <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373]">Profit Factor</span>
            <BarChart2 className="w-3.5 h-3.5 text-slate-400 dark:text-[#737373]" />
          </div>
          <p className={`text-xl font-black font-mono ${profitFactor === null ? 'text-slate-400 dark:text-[#737373]' : profitFactor >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {profitFactor !== null ? profitFactor.toFixed(2) : '—'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">avg win ÷ avg loss</p>
        </div>

        {/* Best Trade */}
        <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0d0d0d] dark:border-white/10 rounded-2xl p-4">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-[#737373] block mb-1.5">Best Trade</span>
          {bestTrade ? (
            <>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(bestTrade.net_pnl, true)}</p>
              <p className="text-[10px] text-slate-500 dark:text-[#737373] mt-1 font-mono truncate">{bestTrade.symbol} {bestTrade.contract_label ?? ''}</p>
            </>
          ) : (
            <p className="text-xl font-black text-slate-400 dark:text-[#737373]">—</p>
          )}
        </div>
      </div>

      {/* ─── Main Chart + Side Column ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left 2/3: Equity Curve + Today's Trades */}
        <div className="lg:col-span-2 space-y-4">
          <EquityCurveChart data={equityCurve} accounts={accounts} />
          <TodaysTradesSection trades={trades} accounts={accounts} />
        </div>

        {/* Right 1/3: Donut + Accounts */}
        <div className="space-y-4">
          <ResultDonutChart trades={trades} />

          {/* Accounts Overview */}
          <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Accounts Overview</h2>
              <Link href="/accounts" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-colors">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              {accountStats.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-[#737373] text-center py-4">No accounts created yet</p>
              ) : (
                accountStats.map((stats) => <AccountCard key={stats.account_id} stats={stats} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
