'use client';

import { Trade, Account } from '@/lib/types';
import { formatCurrency, formatTimeOnly, getDirectionLabel, getStatusLabel, isEvaluatedTrade } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { TradeDrawer } from '@/components/trades/TradeDrawer';

interface TodaysTradesSectionProps {
  trades: Trade[];
  accounts: Account[];
}

export function TodaysTradesSection({ trades, accounts }: TodaysTradesSectionProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Use local date (not UTC) so trades logged at 11pm ET are counted today
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

  const todaysTrades = trades.filter((t) => {
    const openDate  = t.opened_at ? new Date(t.opened_at).toLocaleDateString('en-CA') : '';
    const closeDate = t.closed_at ? new Date(t.closed_at).toLocaleDateString('en-CA') : '';
    return openDate === todayStr || closeDate === todayStr;
  });

  const accountMap     = new Map(accounts.map((a) => [a.id, a]));
  const todaysClosed   = todaysTrades.filter(isEvaluatedTrade);
  const todaysNetPnl   = todaysClosed.reduce((s, t) => s + (t.net_pnl || 0), 0);
  const todaysWins     = todaysClosed.filter((t) => t.net_pnl > 0 || t.result === 'win').length;
  const todaysLosses   = todaysClosed.filter((t) => t.net_pnl < 0 || t.result === 'loss').length;
  const todaysWinRate  = todaysClosed.length > 0
    ? Math.round((todaysWins / todaysClosed.length) * 100) : 0;

  const pnlUp = todaysNetPnl >= 0;

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  /* Result pill colours */
  const resultStyle = (result: string) => {
    if (result === 'win')       return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' };
    if (result === 'loss')      return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' };
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="kpi-icon-indigo p-1.5 rounded-lg border">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-[13px] font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Today's Trades</h2>
            <p className="text-[10px] text-slate-500 dark:text-[#737373]">{formattedToday}</p>
          </div>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs bg-indigo-600 hover:bg-indigo-700 active:scale-95"
        >
          <Plus className="w-3 h-3" /> Log
        </Link>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-slate-50 border border-slate-200/80 dark:bg-[#0d0d14] dark:border-[#1a1a28] rounded-xl">
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#737373] block mb-0.5">PnL</span>
          <span className={`text-sm font-black font-mono flex items-center gap-1 ${todaysClosed.length === 0 ? 'text-slate-400 dark:text-[#737373]' : pnlUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {todaysClosed.length > 0 ? (
              <>{pnlUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{formatCurrency(todaysNetPnl, true)}</>
            ) : '—'}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#737373] block mb-0.5">Win Rate</span>
          <span className="text-sm font-black text-slate-900 dark:text-[#e0e0e0]">
            {todaysClosed.length > 0 ? `${todaysWinRate}%` : '—'}
            {todaysClosed.length > 0 && (
              <span className="text-[9px] font-normal text-slate-500 dark:text-[#737373] ml-1">
                {todaysWins}W/{todaysLosses}L
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#737373] block mb-0.5">Trades</span>
          <span className="text-sm font-black text-slate-900 dark:text-[#e0e0e0]">
            {todaysTrades.length}
            {todaysTrades.length > todaysClosed.length && (
              <span className="text-[9px] text-amber-600 dark:text-amber-400 ml-1 font-bold">{todaysTrades.length - todaysClosed.length} open</span>
            )}
          </span>
        </div>
      </div>

      {/* Trade list */}
      {todaysTrades.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-200 dark:border-[#1a1a1a] rounded-xl bg-slate-50/50 dark:bg-transparent">
          <p className="text-[11px] text-slate-500 dark:text-[#737373] mb-2">No trades logged today.</p>
          <Link href="/trades/new"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Log your first trade <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {todaysTrades.map((trade) => {
            const rs = resultStyle(trade.result);
            const isOpen = trade.status === 'open';
            return (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all bg-white border border-slate-100 hover:bg-slate-50 dark:bg-transparent dark:border-[#1a1a28] dark:hover:bg-[#111] group shadow-xs"
              >
                {/* Result indicator */}
                <div className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: isOpen ? '#94a3b8' : rs.color, opacity: isOpen ? 0.6 : 1 }} />

                {/* Symbol + contract */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-extrabold text-slate-900 dark:text-[#e0e0e0] font-mono">{trade.symbol}</span>
                    {trade.contract_label && (
                      <span className="text-[9px] text-slate-500 dark:text-[#737373] font-mono truncate hidden sm:block">{trade.contract_label}</span>
                    )}
                    {isOpen && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30">OPEN</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-[#737373] font-medium">{getDirectionLabel(trade.direction)}</span>
                    {trade.confluences.slice(0, 2).map((c) => (
                      <span key={c} className="tag-pill-selected !py-0 !px-1.5 !text-[9px]">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <span className="text-[10px] text-slate-500 dark:text-[#737373] hidden sm:block whitespace-nowrap font-mono">
                  {formatTimeOnly(trade.opened_at)}
                </span>

                {/* PnL */}
                <div className="text-right flex-shrink-0">
                  {isOpen ? (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">open</span>
                  ) : (
                    <>
                      <p className="text-[13px] font-black font-mono" style={{ color: trade.net_pnl >= 0 ? '#059669' : '#dc2626' }}>
                        {formatCurrency(trade.net_pnl, true)}
                      </p>
                      <p className="text-[9px] font-bold" style={{ color: rs.color }}>
                        {getStatusLabel(trade.status)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTrade && (
        <TradeDrawer
          trade={selectedTrade}
          account={accountMap.get(selectedTrade.account_id)}
          open={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}
