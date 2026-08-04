'use client';

import { AccountStats } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface AccountCardProps { stats: AccountStats; }

function WinRing({ value, size = 48 }: { value: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circ   = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset  = circ - (clamped / 100) * circ;
  const color   = clamped >= 60 ? '#34d399' : clamped >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1a1a1a" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color}
          strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
        {clamped.toFixed(0)}%
      </span>
    </div>
  );
}

export function AccountCard({ stats }: AccountCardProps) {
  const isLive     = stats.account_type === 'live';
  const isPositive = stats.total_net_pnl >= 0;

  // Goal progress: how much of the gap (goal - initial) has been closed
  // Clamped [0, 100] — never negative even if underwater
  const goalGap      = stats.goal > stats.initial_balance ? stats.goal - stats.initial_balance : 0;
  const goalProgress = goalGap > 0
    ? Math.min(100, Math.max(0, ((stats.current_balance - stats.initial_balance) / goalGap) * 100))
    : 0;

  const returnPct = stats.initial_balance > 0
    ? Math.round(((stats.current_balance - stats.initial_balance) / stats.initial_balance) * 10000) / 100
    : 0;

  return (
    <Link
      href={`/accounts/${stats.account_id}`}
      className="block rounded-xl p-3.5 border transition-all duration-200 group bg-[#0d0d14] border-[#1a1a28] hover:border-[#2a2a40]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[13px] font-bold text-[#e0e0e0] truncate">{stats.name}</h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
              isLive
                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30'
                : 'text-indigo-400 bg-indigo-950/40 border-indigo-800/30'
            }`}>
              {isLive ? 'LIVE' : 'BACKTEST'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-black text-[#e8e8e8]">{formatCurrency(stats.current_balance)}</p>
            <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {returnPct >= 0 ? '+' : ''}{returnPct}%
            </span>
          </div>
        </div>
        <WinRing value={stats.win_rate} />
      </div>

      {/* PnL + stats row */}
      <div className="flex items-center gap-1.5 mb-2.5">
        {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
        <span className={`text-[12px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(stats.total_net_pnl, true)}
        </span>
        <span className="text-[10px] text-[#2a2a2a] ml-1">
          {stats.total_wins}W / {stats.total_trades - stats.total_wins}L · {stats.total_trades} total
        </span>
      </div>

      {/* Goal progress */}
      {stats.goal > stats.initial_balance && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] text-[#333]">
              <Target className="w-2.5 h-2.5" />
              <span>Goal {formatCurrency(stats.goal)}</span>
            </div>
            <span className="text-[10px] text-[#444] font-mono">{goalProgress.toFixed(0)}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${goalProgress}%`,
                background: goalProgress >= 60 ? '#34d399' : goalProgress >= 30 ? '#fbbf24' : '#6366f1',
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-[#2a2a2a]">
            <span>{formatCurrency(stats.current_balance)}</span>
            <span>{formatCurrency(stats.goal)}</span>
          </div>
        </div>
      )}
    </Link>
  );
}
