'use client';

import { Trade, Account } from '@/lib/types';
import { formatCurrency, formatDateTime, getDirectionLabel, getStatusLabel, isEvaluatedTrade } from '@/lib/utils';
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
    if (result === 'win')       return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' };
    if (result === 'loss')      return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' };
    return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' };
  };

  return (
    <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-950/50 border border-indigo-800/40 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-[#e8e8e8] tracking-tight">Today's Trades</h2>
            <p className="text-[10px] text-[#333]">{formattedToday}</p>
          </div>
        </div>
        <Link
          href="/trades/new"
          className="flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}
        >
          <Plus className="w-3 h-3" /> Log
        </Link>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-[#0d0d14] border border-[#1a1a28] rounded-xl">
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#333] block mb-0.5">PnL</span>
          <span className={`text-sm font-black flex items-center gap-1 ${todaysClosed.length === 0 ? 'text-[#333]' : pnlUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {todaysClosed.length > 0 ? (
              <>{pnlUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{formatCurrency(todaysNetPnl, true)}</>
            ) : '—'}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#333] block mb-0.5">Win Rate</span>
          <span className="text-sm font-black text-[#e0e0e0]">
            {todaysClosed.length > 0 ? `${todaysWinRate}%` : '—'}
            {todaysClosed.length > 0 && (
              <span className="text-[9px] font-normal text-[#333] ml-1">
                {todaysWins}W/{todaysLosses}L
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#333] block mb-0.5">Trades</span>
          <span className="text-sm font-black text-[#e0e0e0]">
            {todaysTrades.length}
            {todaysTrades.length > todaysClosed.length && (
              <span className="text-[9px] text-amber-400 ml-1">{todaysTrades.length - todaysClosed.length} open</span>
            )}
          </span>
        </div>
      </div>

      {/* Trade list */}
      {todaysTrades.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[#1a1a1a] rounded-xl">
          <p className="text-[11px] text-[#2a2a2a] mb-2">No trades logged today.</p>
          <Link href="/trades/new"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-[#111] group"
                style={{ border: '1px solid #111' }}
              >
                {/* Result indicator */}
                <div className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: isOpen ? '#3a3a3a' : rs.color, opacity: isOpen ? 0.5 : 1 }} />

                {/* Symbol + contract */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#e0e0e0] font-mono">{trade.symbol}</span>
                    {trade.contract_label && (
                      <span className="text-[9px] text-[#333] font-mono truncate hidden sm:block">{trade.contract_label}</span>
                    )}
                    {isOpen && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950/40 text-amber-400 border border-amber-800/30">OPEN</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#444]">{getDirectionLabel(trade.direction)}</span>
                    {trade.confluences.slice(0, 2).map((c) => (
                      <span key={c} className="text-[9px] text-indigo-400 bg-indigo-950/30 px-1.5 py-0.5 rounded-md border border-indigo-800/20">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <span className="text-[10px] text-[#333] hidden sm:block whitespace-nowrap">
                  {formatDateTime(trade.opened_at).split(',').slice(-1)[0]?.trim() ?? ''}
                </span>

                {/* PnL */}
                <div className="text-right flex-shrink-0">
                  {isOpen ? (
                    <span className="text-[11px] text-[#444] font-mono">open</span>
                  ) : (
                    <>
                      <p className="text-[13px] font-black font-mono" style={{ color: trade.net_pnl >= 0 ? '#34d399' : '#f87171' }}>
                        {formatCurrency(trade.net_pnl, true)}
                      </p>
                      <p className="text-[9px]" style={{ color: rs.color }}>
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
