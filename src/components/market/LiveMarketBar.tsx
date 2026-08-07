'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketQuoteItem } from '@/app/api/market/quotes/route';
import { TrendingUp, TrendingDown, RefreshCw, Activity, ExternalLink } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { TickerDetailModal } from './TickerDetailModal';

interface LiveMarketBarProps {
  symbols?: string[];
  className?: string;
}

export function LiveMarketBar({ symbols = ['SPY', 'QQQ', 'VIX', 'IWM'], className = '' }: LiveMarketBarProps) {
  const [quotes, setQuotes] = useState<MarketQuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<MarketQuoteItem | null>(null);

  const fetchQuotes = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const res = await fetch(`/api/market/quotes?symbols=${symbols.join(',')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.quotes)) {
        setQuotes(data.quotes);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('[LiveMarketBar] Fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [symbols]);

  useEffect(() => {
    fetchQuotes(false);
    // Silent background refresh every 60s (no spinner animation)
    const interval = setInterval(() => fetchQuotes(false), 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return (
    <>
      <div className={cn('bg-white border border-slate-200/80 dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-2.5 sm:p-3.5 shadow-xs space-y-2.5 transition-colors', className)}>
        {/* Header row */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>Market Ticker</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-600 dark:text-[#737373] font-mono hidden sm:inline truncate">
              Yahoo Finance · Click ticker for chart & stats
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {lastRefreshed && (
              <span className="text-[9px] text-slate-600 dark:text-[#737373] font-mono hidden md:inline">
                Updated {lastRefreshed}
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchQuotes(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#14141f] dark:border-[#252538] dark:text-[#a3a3a3] dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Live Quotes"
            >
              <RefreshCw className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform', isRefreshing && 'animate-spin text-indigo-600 dark:text-indigo-400')} />
            </button>
          </div>
        </div>

        {/* Quote Ticker Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
          {loading && quotes.length === 0
            ? symbols.map((sym) => (
                <div
                  key={sym}
                  className="bg-slate-50 border border-slate-200 dark:bg-[#12121a] dark:border-[#1f1f2e] rounded-xl p-2 sm:p-2.5 animate-pulse space-y-1.5"
                >
                  <div className="h-2.5 w-10 sm:w-12 bg-slate-200 dark:bg-[#252538] rounded" />
                  <div className="h-4 sm:h-5 w-14 sm:w-20 bg-slate-200 dark:bg-[#252538] rounded" />
                </div>
              ))
            : quotes.map((q) => {
                const isPositive = q.change >= 0;
                const isVix = q.symbol === 'VIX';

                return (
                  <button
                    key={q.symbol}
                    type="button"
                    onClick={() => setSelectedQuote(q)}
                    className="bg-slate-50/80 border border-slate-200/80 hover:border-indigo-500/60 dark:bg-[#12121a] dark:border-[#1f1f2e] dark:hover:border-indigo-500/60 rounded-xl p-2 sm:p-2.5 transition-all shadow-2xs hover:shadow-md space-y-1 group overflow-hidden text-left cursor-pointer active:scale-[0.98]"
                  >
                    {/* Symbol + % badge row */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-[#e8e8e8] font-mono group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1">
                        {q.symbol}
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0',
                          isPositive
                            ? 'text-emerald-700 bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                            : 'text-red-700 bg-red-100 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20'
                        )}
                      >
                        {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {isPositive ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight truncate">
                        {isVix ? q.price.toFixed(2) : formatCurrency(q.price)}
                      </span>
                      <span
                        className={cn(
                          'text-[9px] sm:text-[10px] font-mono font-semibold hidden xs:inline',
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {isPositive ? '+' : ''}{q.change.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>

      {/* Interactive Ticker Modal */}
      <TickerDetailModal
        quote={selectedQuote}
        open={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
      />
    </>
  );
}
