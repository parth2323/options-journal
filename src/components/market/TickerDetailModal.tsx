'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { MarketQuoteItem } from '@/app/api/market/quotes/route';
import { TrendingUp, TrendingDown, Plus, Lightbulb, Loader2, Activity, ExternalLink, ShieldCheck, Zap, X } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';

interface TickerDetailModalProps {
  quote: MarketQuoteItem | null;
  open: boolean;
  onClose: () => void;
}

type TimeframeOption = '1d' | '5d' | '1m' | '6m' | 'ytd' | '1y';

interface CandlePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function TickerDetailModal({ quote, open, onClose }: TickerDetailModalProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('5d');
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<CandlePoint | null>(null);

  useEffect(() => {
    if (!quote || !open) return;

    let isMounted = true;
    setLoadingChart(true);
    setHoveredPoint(null);

    fetch(`/api/market/chart?symbol=${quote.symbol}&timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.candles)) {
          setCandles(data.candles);
        }
      })
      .catch((err) => console.error('[TickerDetailModal] Chart fetch error:', err))
      .finally(() => {
        if (isMounted) setLoadingChart(false);
      });

    return () => {
      isMounted = false;
    };
  }, [quote, open, timeframe]);

  /* ── Computed SVG Chart Geometry with Price (Y) and Date/Time (X) Axes ─────── */
  const chartData = useMemo(() => {
    if (candles.length < 2) return null;

    const prices = candles.map((c) => c.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const totalWidth = 800;
    const totalHeight = 300;
    const rightMargin = 65;  // Space for Y-axis price labels
    const bottomMargin = 28; // Space for X-axis date/time labels
    const paddingTop = 20;

    const chartWidth = totalWidth - rightMargin;
    const chartHeight = totalHeight - bottomMargin - paddingTop;

    const points = candles.map((c, idx) => {
      const x = (idx / (candles.length - 1)) * chartWidth;
      const normalizedY = (c.close - minPrice) / priceRange;
      const y = paddingTop + (1 - normalizedY) * chartHeight;
      return { x, y, candle: c };
    });

    const isUp = prices[prices.length - 1] >= prices[0];
    const pathD = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
    const areaD = `${pathD} L ${chartWidth},${paddingTop + chartHeight} L 0,${paddingTop + chartHeight} Z`;

    // Horizontal Y-Axis Ticks (4 price levels)
    const gridTicks = [1.0, 0.66, 0.33, 0.0].map((ratio) => {
      const price = minPrice + ratio * priceRange;
      const y = paddingTop + (1 - ratio) * chartHeight;
      return { y, price };
    });

    // Vertical X-Axis Ticks (5 date/time points)
    const tickIndices = [
      0,
      Math.floor(candles.length * 0.25),
      Math.floor(candles.length * 0.5),
      Math.floor(candles.length * 0.75),
      candles.length - 1,
    ];

    const xTicks = tickIndices.map((idx) => {
      const c = candles[idx];
      const p = points[idx];
      if (!c || !p) return null;

      const dateObj = new Date(c.timestamp);
      let label = '';
      if (timeframe === '1d') {
        label = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '5d' || timeframe === '1m') {
        label = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        label = dateObj.toLocaleDateString([], { month: 'short', day: '2-digit' });
      }
      return { x: p.x, label };
    }).filter((t): t is { x: number; label: string } => t !== null);

    return {
      points,
      minPrice,
      maxPrice,
      isUp,
      pathD,
      areaD,
      totalWidth,
      totalHeight,
      chartWidth,
      chartHeight,
      gridTicks,
      xTicks,
      paddingTop,
      bottomMargin,
    };
  }, [candles, timeframe]);

  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const isVix = quote.symbol === 'VIX';

  // Day Range Calculations
  const dayLow = quote.dayLow || quote.price;
  const dayHigh = quote.dayHigh || quote.price;
  const dayRangePct = dayHigh > dayLow ? Math.min(100, Math.max(0, ((quote.price - dayLow) / (dayHigh - dayLow)) * 100)) : 50;

  // 52-Week Range Calculations
  const week52Low = quote.fiftyTwoWeekLow || dayLow;
  const week52High = quote.fiftyTwoWeekHigh || dayHigh;
  const week52RangePct = week52High > week52Low ? Math.min(100, Math.max(0, ((quote.price - week52Low) / (week52High - week52Low)) * 100)) : 50;

  const ytdVal = quote.ytdReturn ?? quote.fiftyTwoWeekChangePercent ?? 0;
  const ytdPositive = ytdVal >= 0;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] max-w-[96vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 overflow-hidden bg-white dark:bg-[#0b0c12] border border-slate-200/90 dark:border-[#1c1d2e] rounded-3xl shadow-2xl transition-all font-sans max-h-[92vh] flex flex-col"
      >
        {/* ── MODAL TOP BANNER WITH CLEAN UNCLUTTERED CLOSE BUTTON ──────────────── */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-[#171826] bg-slate-50/80 dark:bg-[#11121d] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Real-Time Market Terminal</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
              {quote.displaySymbol} · {quote.marketState || 'REGULAR'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:text-white dark:hover:bg-[#1f2032] transition-all cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN GRID BODY ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* ── LEFT COLUMN (65%): HERO HEADER + CHART WITH DATES & PRICES ────── */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Header Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {quote.symbol}
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {quote.name}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {isVix ? quote.price.toFixed(2) : formatCurrency(quote.price)}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 text-xs sm:text-sm font-mono font-bold px-2.5 py-0.5 rounded-xl border">
                    <span
                      className={cn(
                        'flex items-center gap-0.5',
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isPositive ? '+' : ''}
                      {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                      {quote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeframe Selector Pills */}
              <div className="flex items-center justify-between gap-1.5 mt-5 bg-slate-100 dark:bg-[#161726] p-1.5 rounded-2xl border border-slate-200/60 dark:border-[#1e1f32]">
                {(
                  [
                    { label: '1D', value: '1d' },
                    { label: '5D', value: '5d' },
                    { label: '1M', value: '1m' },
                    { label: '6M', value: '6m' },
                    { label: 'YTD', value: 'ytd' },
                    { label: '1Y', value: '1y' },
                  ] as { label: string; value: TimeframeOption }[]
                ).map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTimeframe(value)}
                    className={cn(
                      'flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center',
                      timeframe === value
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Definition SVG Chart Box with Price (Y) & Date/Time (X) Axes */}
            <div className="relative bg-slate-50 dark:bg-[#0f1019] border border-slate-200/80 dark:border-[#1c1d2e] rounded-2xl p-4 sm:p-5 flex-1 min-h-[300px] flex flex-col justify-between overflow-hidden shadow-xs">
              {/* Tooltip Bar displaying active price & timestamp */}
              {(() => {
                const activePoint = hoveredPoint || (candles.length > 0 ? candles[candles.length - 1] : null);
                if (!activePoint) return null;

                return (
                  <div className="flex items-center justify-between text-xs font-mono mb-2 z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(activePoint.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        Close: ${activePoint.close.toFixed(2)}
                      </span>
                    </div>

                    {chartData && (
                      <span className="text-slate-500 dark:text-slate-400 font-extrabold hidden sm:inline">
                        High: ${chartData.maxPrice.toFixed(2)} — Low: ${chartData.minPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Chart SVG with X and Y Axes */}
              {loadingChart ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">Fetching market candles...</span>
                </div>
              ) : chartData ? (
                <div className="relative h-64 w-full">
                  <svg
                    viewBox={`0 0 ${chartData.totalWidth} ${chartData.totalHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`chart-grad-hero-${quote.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={chartData.isUp ? '#10b981' : '#ef4444'}
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor={chartData.isUp ? '#10b981' : '#ef4444'}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines & Y-Axis Price Labels (Right Side) */}
                    {chartData.gridTicks.map((tick, idx) => (
                      <g key={idx}>
                        <line
                          x1="0"
                          y1={tick.y}
                          x2={chartData.chartWidth}
                          y2={tick.y}
                          stroke="currentColor"
                          className="text-slate-200 dark:text-[#1a1b2b]"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={chartData.chartWidth + 8}
                          y={tick.y + 4}
                          fill="currentColor"
                          className="text-[10px] font-mono font-bold fill-slate-400 dark:fill-slate-500"
                        >
                          ${tick.price.toFixed(2)}
                        </text>
                      </g>
                    ))}

                    {/* Area Gradient Fill */}
                    <path d={chartData.areaD} fill={`url(#chart-grad-hero-${quote.symbol})`} />

                    {/* Line Stroke */}
                    <path
                      d={chartData.pathD}
                      fill="none"
                      stroke={chartData.isUp ? '#10b981' : '#ef4444'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* X-Axis Date/Time Labels (Bottom Axis) */}
                    {chartData.xTicks.map((t, idx) => (
                      <text
                        key={idx}
                        x={t.x}
                        y={chartData.totalHeight - 6}
                        textAnchor={idx === 0 ? 'start' : idx === chartData.xTicks.length - 1 ? 'end' : 'middle'}
                        fill="currentColor"
                        className="text-[10px] font-mono font-semibold fill-slate-400 dark:fill-slate-500"
                      >
                        {t.label}
                      </text>
                    ))}

                    {/* Hover Reticle & Interactive Columns */}
                    {chartData.points.map((p, idx) => (
                      <g key={idx}>
                        <rect
                          x={Math.max(0, p.x - chartData.chartWidth / (chartData.points.length * 2))}
                          y={0}
                          width={chartData.chartWidth / chartData.points.length}
                          height={chartData.chartHeight + chartData.paddingTop}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredPoint(p.candle)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {hoveredPoint?.timestamp === p.candle.timestamp && (
                          <>
                            <line
                              x1={p.x}
                              y1="0"
                              x2={p.x}
                              y2={chartData.paddingTop + chartData.chartHeight}
                              stroke={chartData.isUp ? '#10b981' : '#ef4444'}
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="6"
                              fill={chartData.isUp ? '#10b981' : '#ef4444'}
                              className="animate-ping opacity-75"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4.5"
                              fill="#ffffff"
                              stroke={chartData.isUp ? '#10b981' : '#ef4444'}
                              strokeWidth="3"
                            />
                          </>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No historical candles available for this timeframe
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN (35%): RANGE SLIDERS + STATS GRID + ACTIONS ─────── */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            {/* Range Bars Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Price Extremes & Ranges</span>
              </h3>

              {/* Day's Range Bar */}
              <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Day's Range</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black">${quote.price.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#202133] h-3 rounded-full relative overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${dayRangePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
                  <span>Low: ${dayLow.toFixed(2)}</span>
                  <span>High: ${dayHigh.toFixed(2)}</span>
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>52-Week Range</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black">${quote.price.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#202133] h-3 rounded-full relative overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${week52RangePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
                  <span>52W Low: ${week52Low.toFixed(2)}</span>
                  <span>52W High: ${week52High.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Key Statistics 2x2 Grid */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Key Market Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-3.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    Open Price
                  </span>
                  <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {isVix ? quote.open.toFixed(2) : formatCurrency(quote.open)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-3.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    Prev Close
                  </span>
                  <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {isVix ? quote.previousClose.toFixed(2) : formatCurrency(quote.previousClose)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-3.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    YTD Return
                  </span>
                  <p
                    className={cn(
                      'text-base font-black font-mono',
                      ytdPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {ytdPositive ? '+' : ''}
                    {ytdVal.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#12131f] border border-slate-200/80 dark:border-[#1d1e30] rounded-2xl p-3.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                    Volume
                  </span>
                  <p className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {quote.volume ? (quote.volume / 1000000).toFixed(1) + 'M' : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#171826]">
              <Link
                href={`/trades/new?symbol=${quote.symbol}`}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wide"
              >
                <Plus className="w-4 h-4" />
                Log {quote.symbol} Trade
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href={`/ideas?symbol=${quote.symbol}`}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#161726] dark:hover:bg-[#202136] text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Add Observation
                </Link>

                <a
                  href={`https://finance.yahoo.com/quote/${quote.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161726] dark:hover:bg-[#202136] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                  title="View on Yahoo Finance"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
