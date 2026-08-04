import { getAccount, getAccountStats, getTrades, getEquityCurve } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TradesTable } from '@/components/trades/TradesTable';
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart';
import { getAccounts } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

function CircularRing({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 60 ? '#34d399' : clamped >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-progress">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2a2a2a" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
        {clamped.toFixed(0)}%
      </span>
    </div>
  );
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);
  if (!account) notFound();

  const [statsArr, trades, equity, accounts] = await Promise.all([
    getAccountStats(id),
    getTrades(id),
    getEquityCurve(id),
    getAccounts(),
  ]);
  const stats = statsArr[0];
  const isBacktest = account.account_type === 'backtest';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back */}
      <Link href="/accounts" className="flex items-center gap-1.5 text-xs text-[#4a4a4a] hover:text-[#a0a0a0] mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Accounts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <CircularRing value={stats?.win_rate ?? 0} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#e8e8e8]">{account.name}</h1>
              <Badge className={`text-[11px] ${isBacktest ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'}`}>
                {isBacktest ? 'Backtest' : 'Live'}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-[#e8e8e8] mt-1">{formatCurrency(stats?.current_balance ?? account.initial_balance)}</p>
            {account.goal > 0 && (
              <p className="text-xs text-[#4a4a4a] mt-0.5">Goal: {formatCurrency(account.goal)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Net PnL', value: formatCurrency(stats?.total_net_pnl ?? 0, true), color: (stats?.total_net_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Total Trades', value: String(stats?.total_trades ?? 0), color: 'text-[#e8e8e8]' },
          { label: 'Total Wins', value: String(stats?.total_wins ?? 0), color: 'text-emerald-400' },
          { label: 'Win Rate', value: formatPercent(stats?.win_rate ?? 0), color: 'text-[#e8e8e8]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-[11px] text-[#4a4a4a] uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div className="mb-6">
        <EquityCurveChart data={equity} accounts={accounts} />
      </div>

      {/* Trades table */}
      <div>
        <h2 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wide mb-3">Trades</h2>
        <TradesTable trades={trades} accounts={accounts} />
      </div>
    </div>
  );
}
