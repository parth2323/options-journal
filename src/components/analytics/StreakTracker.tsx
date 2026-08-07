'use client';

import { Flame, Snowflake, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';
import type { StreakData } from './analyticsCompute';
import { cn } from '@/lib/utils';

interface Props { data: StreakData }

export function StreakTracker({ data }: Props) {
  const { currentStreak, currentType, longestWinStreak, longestLossStreak, totalWins, totalLosses, winRate } = data;
  const totalTrades = totalWins + totalLosses;

  const isWinStreak  = currentType === 'win';
  const isLossStreak = currentType === 'loss';

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Streak Tracker</h3>
        <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Current momentum & best records</p>
      </div>

      {totalTrades === 0 ? (
        <p className="text-sm text-slate-400 dark:text-[#555] text-center py-6">No trades yet</p>
      ) : (
        <>
          {/* Current streak hero */}
          <div className={cn(
            'rounded-xl p-4 flex items-center gap-4',
            isWinStreak  ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30' :
            isLossStreak ? 'bg-red-50   dark:bg-red-950/30   border border-red-200   dark:border-red-800/30'   :
                           'bg-slate-50 dark:bg-[#1a1a1a]   border border-slate-200 dark:border-[#252525]'
          )}>
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              isWinStreak  ? 'bg-emerald-100 dark:bg-emerald-900/40' :
              isLossStreak ? 'bg-red-100   dark:bg-red-900/40' :
                             'bg-slate-100 dark:bg-[#252525]'
            )}>
              {isWinStreak  && <Flame    className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              {isLossStreak && <Snowflake className="w-6 h-6 text-red-500 dark:text-red-400" />}
              {!isWinStreak && !isLossStreak && <TrendingUp className="w-6 h-6 text-slate-500" />}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide">Current Streak</p>
              <p className={cn(
                'text-3xl font-black leading-tight',
                isWinStreak  ? 'text-emerald-600 dark:text-emerald-400' :
                isLossStreak ? 'text-red-500 dark:text-red-400' :
                               'text-slate-600 dark:text-[#aaa]'
              )}>
                {currentStreak}
                <span className="text-base font-bold ml-1">
                  {isWinStreak ? ' wins 🔥' : isLossStreak ? ' losses ❄️' : ''}
                </span>
              </p>
              {isLossStreak && currentStreak >= 3 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400">Consider a trading break</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide">Best Win Streak</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{longestWinStreak}</p>
              <p className="text-[10px] text-slate-400 dark:text-[#555]">consecutive wins</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#737373] uppercase tracking-wide">Worst Loss Streak</span>
              </div>
              <p className="text-2xl font-black text-red-500 dark:text-red-400">{longestLossStreak}</p>
              <p className="text-[10px] text-slate-400 dark:text-[#555]">consecutive losses</p>
            </div>
          </div>

          {/* Win/Loss bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-[#aaa] mb-1.5">
              <span className="text-emerald-600 dark:text-emerald-400">{totalWins} W · {winRate.toFixed(1)}%</span>
              <span className="text-red-500 dark:text-red-400">{totalLosses} L · {(100 - winRate).toFixed(1)}%</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
              <div className="bg-emerald-500" style={{ width: `${winRate}%` }} />
              <div className="bg-red-500 flex-1" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
