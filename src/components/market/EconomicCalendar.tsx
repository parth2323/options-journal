'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, parse } from 'date-fns';

interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  time: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
  url: string;
}

type ImpactFilter = 'High' | 'Medium' | 'Low';
type CurrencyFilter = 'USD' | 'ALL';
type WeekView = 'this' | 'next';

const IMPACT_CONFIG: Record<string, { dot: string; badge: string; label: string; order: number }> = {
  High:    { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',     label: 'High',    order: 1 },
  Medium:  { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30', label: 'Med',  order: 2 },
  Low:     { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600', label: 'Low',  order: 3 },
  Holiday: { dot: 'bg-indigo-400',badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30', label: 'Holiday', order: 4 },
};

const CURRENCY_FLAG: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦',
  AUD: '🇦🇺', NZD: '🇳🇿', CHF: '🇨🇭', CNY: '🇨🇳', All: '🌍',
};

function parseDateStr(dateStr: string): Date | null {
  try { return parse(dateStr, 'MM-dd-yyyy', new Date()); } catch { return null; }
}

function getCountdownToNext(events: CalendarEvent[]): string {
  const now = new Date();
  for (const e of events) {
    if (e.impact !== 'High' || !e.time) continue;
    const dt = parseDateStr(e.date);
    if (!dt) continue;
    const [timePart, period] = e.time.match(/(\d+:\d+)(am|pm)/i)?.slice(1) ?? [];
    if (!timePart || !period) continue;
    const [h, m] = timePart.split(':').map(Number);
    const hour = period.toLowerCase() === 'pm' && h !== 12 ? h + 12 : h === 12 && period.toLowerCase() === 'am' ? 0 : h;
    dt.setHours(hour, m, 0, 0);
    if (dt > now) {
      const diff = dt.getTime() - now.getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }
  }
  return '';
}

export function EconomicCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [week, setWeek] = useState<WeekView>('this');
  const [currency, setCurrency] = useState<CurrencyFilter>('USD');
  const [impactFilter, setImpactFilter] = useState<ImpactFilter[]>(['High', 'Medium']);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/market/calendar?week=${week}&currency=${currency}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        else setError(data.error ?? 'Unknown error');
      })
      .catch(() => setError('Failed to load calendar'))
      .finally(() => setLoading(false));
  }, [week, currency, refreshKey]);

  const nextHighImpact = useMemo(() => getCountdownToNext(events), [events]);

  // Group filtered events by date
  const grouped = useMemo(() => {
    const filtered = events.filter((e) =>
      impactFilter.length === 0 || impactFilter.includes(e.impact as ImpactFilter) || e.impact === 'Holiday'
    );
    const map = new Map<string, CalendarEvent[]>();
    filtered.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      const da = parseDateStr(a)?.getTime() ?? 0;
      const db = parseDateStr(b)?.getTime() ?? 0;
      return da - db;
    });
  }, [events, impactFilter]);

  const toggleImpact = (impact: ImpactFilter) => {
    setImpactFilter((prev) =>
      prev.includes(impact) ? prev.filter((i) => i !== impact) : [...prev, impact]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Week nav */}
        <div className="flex border border-slate-200 dark:border-[#1e1e2d] rounded-xl overflow-hidden">
          <button
            onClick={() => setWeek('this')}
            className={`px-3 py-2 text-xs font-black transition-all ${week === 'this' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
          >
            <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />This Week
          </button>
          <button
            onClick={() => setWeek('next')}
            className={`px-3 py-2 text-xs font-black transition-all ${week === 'next' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
          >
            Next Week<ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>

        {/* Currency filter */}
        <div className="flex border border-slate-200 dark:border-[#1e1e2d] rounded-xl overflow-hidden">
          {(['USD', 'ALL'] as CurrencyFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-2 text-xs font-black transition-all ${currency === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
            >
              {c === 'USD' ? '🇺🇸 USD' : '🌍 All'}
            </button>
          ))}
        </div>

        {/* Impact pills */}
        {(['High', 'Medium', 'Low'] as ImpactFilter[]).map((impact) => {
          const cfg = IMPACT_CONFIG[impact];
          return (
            <button
              key={impact}
              onClick={() => toggleImpact(impact)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                impactFilter.includes(impact)
                  ? `${cfg.badge} border-current`
                  : 'border-slate-200 dark:border-[#1e1e2d] text-slate-400 dark:text-slate-600 bg-white dark:bg-[#12121a]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${impactFilter.includes(impact) ? cfg.dot : 'bg-slate-300 dark:bg-slate-700'}`} />
              {impact}
            </button>
          );
        })}

        {/* Refresh */}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="ml-auto p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e1e2d] border border-slate-200 dark:border-[#1e1e2d] transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Countdown banner */}
      {nextHighImpact && !loading && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-2.5 mb-4 text-xs font-black text-red-700 dark:text-red-400">
          <Clock className="w-4 h-4 flex-shrink-0" />
          Next High-Impact USD event in <span className="font-mono text-sm">{nextHighImpact}</span>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading economic calendar…</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Calendar table */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {grouped.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 dark:text-[#4a4a4a]">
              No events match your filters this week.
            </div>
          ) : (
            grouped.map(([dateStr, dayEvents]) => {
              const dt = parseDateStr(dateStr);
              const isCurrentDay = dt ? isToday(dt) : false;
              const dayLabel = dt ? format(dt, 'EEEE, MMMM d') : dateStr;

              return (
                <div key={dateStr} className={`rounded-2xl overflow-hidden border transition-all ${isCurrentDay ? 'border-indigo-400 dark:border-indigo-500/60 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/20' : 'border-slate-200/80 dark:border-[#1e1e2d]'}`}>
                  {/* Day header */}
                  <div className={`px-4 py-2.5 flex items-center gap-2 ${isCurrentDay ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-[#14141f] border-b border-slate-200/80 dark:border-[#1e1e2d]'}`}>
                    <span className={`text-xs font-black ${isCurrentDay ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {dayLabel}
                    </span>
                    {isCurrentDay && (
                      <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                        TODAY
                      </span>
                    )}
                    <span className={`ml-auto text-[10px] font-bold ${isCurrentDay ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-600'}`}>
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="bg-white dark:bg-[#12121a] divide-y divide-slate-100 dark:divide-[#1a1a28]">
                    {dayEvents.map((event, idx) => {
                      const cfg = IMPACT_CONFIG[event.impact] ?? IMPACT_CONFIG['Low'];
                      return (
                        <a
                          key={idx}
                          href={event.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#161622] transition-colors group cursor-pointer"
                        >
                          {/* Time */}
                          <span className="w-14 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 text-right">
                            {event.time || 'All Day'}
                          </span>

                          {/* Currency flag */}
                          <span className="text-base flex-shrink-0" title={event.country}>
                            {CURRENCY_FLAG[event.country] ?? '🏳️'}
                          </span>

                          {/* Impact dot */}
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} title={event.impact} />

                          {/* Title */}
                          <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {event.title}
                          </span>

                          {/* Forecast / Previous / Actual */}
                          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-[11px] font-mono">
                            {event.forecast && (
                              <span className="text-slate-500 dark:text-slate-400">
                                <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-600 mr-1">F</span>
                                {event.forecast}
                              </span>
                            )}
                            {event.previous && (
                              <span className="text-slate-500 dark:text-slate-400">
                                <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-600 mr-1">P</span>
                                {event.previous}
                              </span>
                            )}
                            {event.actual && (
                              <span className={`font-black ${event.actual > (event.forecast || event.previous) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                <span className="text-[9px] font-bold uppercase mr-1">A</span>
                                {event.actual}
                              </span>
                            )}
                          </div>

                          {/* Impact badge */}
                          <span className={`hidden md:flex text-[10px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
