import { getTrades, getAccounts, getAccountStats, getEquityCurve } from '@/lib/db';
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart';
import { ResultDonutChart } from '@/components/dashboard/ResultDonutChart';
import { TodaysTradesSection } from '@/components/dashboard/TodaysTradesSection';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { formatCurrency, formatPercent, isEvaluatedTrade } from '@/lib/utils';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Award, Calendar, Zap, BarChart2 } from 'lucide-react';

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

  /* ─── Best / worst trade ──────────────────────────────────────────────── */
  const bestTrade  = closedTrades.length > 0 ? closedTrades.reduce((best, t) => t.net_pnl > best.net_pnl ? t : best) : null;
  const worstTrade = closedTrades.length > 0 ? closedTrades.reduce((worst, t) => t.net_pnl < worst.net_pnl ? t : worst) : null;

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
          <h1 className="text-xl font-extrabold text-[#e8e8e8] tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-[#3a3a3a] mt-0.5">
            Account started at{' '}
            <span className="font-semibold text-indigo-400">{formatCurrency(initialCapital)} USD</span>
          </p>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg"
          style={{
            background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
            boxShadow: '0 0 20px rgba(99,102,241,0.35)',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Log Trade
        </Link>
      </div>

      {/* ─── KPI Cards Row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Account Balance */}
        <div className="relative overflow-hidden bg-[#0d0d14] border border-indigo-900/30 rounded-2xl p-4">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-600/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a]">Balance</span>
            <div className="p-1.5 bg-indigo-950/60 border border-indigo-800/40 rounded-lg">
              <DollarSign className="w-3 h-3 text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#e8e8e8] tracking-tight">{formatCurrency(currentBalance)}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'}`}>
              {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct}%
            </span>
            <span className="text-[10px] text-[#333]">vs {formatCurrency(initialCapital)} start</span>
          </div>
        </div>

        {/* Total Net PnL */}
        <div className={`relative overflow-hidden bg-[#0d0d0d] border rounded-2xl p-4 ${isUp ? 'border-emerald-900/30' : 'border-red-900/30'}`}>
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl ${isUp ? 'bg-emerald-600/10' : 'bg-red-600/10'}`} />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a]">Net PnL</span>
            <div className={`p-1.5 rounded-lg border ${isUp ? 'bg-emerald-950/60 border-emerald-800/40' : 'bg-red-950/60 border-red-800/40'}`}>
              {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
            </div>
          </div>
          <p className={`text-2xl font-black tracking-tight ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(totalNetPnl, true)}
          </p>
          <p className="text-[10px] text-[#333] mt-1.5">{closedTrades.length} closed trade{closedTrades.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Win Rate */}
        <div className="relative overflow-hidden bg-[#0d0d0d] border border-amber-900/30 rounded-2xl p-4">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-600/8 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a]">Win Rate</span>
            <div className="p-1.5 bg-amber-950/60 border border-amber-800/40 rounded-lg">
              <Award className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#e8e8e8] tracking-tight">{formatPercent(winRate)}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-emerald-400 font-bold">{wins.length}W</span>
            <span className="text-[10px] text-[#2a2a2a]">·</span>
            <span className="text-[10px] text-red-400 font-bold">{losses.length}L</span>
            {closedTrades.length - wins.length - losses.length > 0 && (
              <>
                <span className="text-[10px] text-[#2a2a2a]">·</span>
                <span className="text-[10px] text-amber-400 font-bold">{closedTrades.length - wins.length - losses.length}BE</span>
              </>
            )}
          </div>
        </div>

        {/* Today's PnL */}
        <div className={`relative overflow-hidden bg-[#0d0d0d] border rounded-2xl p-4 ${todayUp ? 'border-sky-900/30' : 'border-red-900/30'}`}>
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl ${todayUp ? 'bg-sky-600/8' : 'bg-red-600/10'}`} />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a]">Today</span>
            <div className="p-1.5 bg-sky-950/60 border border-sky-800/40 rounded-lg">
              <Calendar className="w-3 h-3 text-sky-400" />
            </div>
          </div>
          <p className={`text-2xl font-black tracking-tight ${todaysClosed.length === 0 ? 'text-[#333]' : todayUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {todaysClosed.length === 0 ? '—' : formatCurrency(todaysNetPnl, true)}
          </p>
          <p className="text-[10px] text-[#333] mt-1.5">
            {todaysTrades.length} trade{todaysTrades.length !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* ─── KPI Cards Row 2 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Avg Win */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a] block mb-2">Avg Win</span>
          <p className="text-lg font-black text-emerald-400">{wins.length > 0 ? formatCurrency(avgWin) : '—'}</p>
          <p className="text-[10px] text-[#333] mt-1">per winning trade</p>
        </div>

        {/* Avg Loss */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a] block mb-2">Avg Loss</span>
          <p className="text-lg font-black text-red-400">{losses.length > 0 ? formatCurrency(avgLoss) : '—'}</p>
          <p className="text-[10px] text-[#333] mt-1">per losing trade</p>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a]">Profit Factor</span>
            <BarChart2 className="w-3 h-3 text-[#2a2a2a]" />
          </div>
          <p className={`text-lg font-black ${profitFactor === null ? 'text-[#333]' : profitFactor >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
            {profitFactor !== null ? profitFactor.toFixed(2) : '—'}
          </p>
          <p className="text-[10px] text-[#333] mt-1">avg win ÷ avg loss</p>
        </div>

        {/* Best Trade */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#3a3a3a] block mb-2">Best Trade</span>
          {bestTrade ? (
            <>
              <p className="text-lg font-black text-emerald-400">{formatCurrency(bestTrade.net_pnl, true)}</p>
              <p className="text-[10px] text-[#333] mt-1 font-mono truncate">{bestTrade.symbol} {bestTrade.contract_label ?? ''}</p>
            </>
          ) : (
            <p className="text-lg font-black text-[#333]">—</p>
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
          <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-[#e8e8e8] tracking-tight">Accounts</h2>
              <Link href="/accounts" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Manage →
              </Link>
            </div>
            <div className="space-y-2.5">
              {accountStats.length === 0 ? (
                <p className="text-[12px] text-[#333] text-center py-4">No accounts yet</p>
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
