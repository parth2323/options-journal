'use client';

import { Trade, ChartObservation } from '@/lib/types';
import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { formatCurrency, getPnlColor } from '@/lib/utils';
import Link from 'next/link';

interface CalendarViewProps {
  trades: Trade[];
  observations: ChartObservation[];
}

const MOOD_EMOJI: Record<string, string> = {
  confident: '😤', uncertain: '😟', neutral: '😐', excited: '🤩', regret: '😔',
};

export function CalendarView({ trades, observations }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Group trades by day
  const tradesByDay = new Map<string, Trade[]>();
  trades.forEach((t) => {
    const key = (t.closed_at ?? t.opened_at).split('T')[0];
    if (!tradesByDay.has(key)) tradesByDay.set(key, []);
    tradesByDay.get(key)!.push(t);
  });

  // Group observations by day
  const observationsByDay = new Map<string, ChartObservation[]>();
  observations.forEach((o) => {
    const key = o.observed_at.split('T')[0];
    if (!observationsByDay.has(key)) observationsByDay.set(key, []);
    observationsByDay.get(key)!.push(o);
  });

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedTrades = selectedKey ? (tradesByDay.get(selectedKey) ?? []) : [];
  const selectedObservations = selectedKey ? (observationsByDay.get(selectedKey) ?? []) : [];

  const getDayPnl = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const dayTrades = tradesByDay.get(key) ?? [];
    return dayTrades.reduce((s, t) => s + t.net_pnl, 0);
  };

  const prev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const next = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="flex gap-4 flex-col lg:flex-row">
      {/* Calendar */}
      <div className="flex-1 bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-[#e8e8e8]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button onClick={prev} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg text-slate-500 dark:text-[#737373] hover:text-slate-900 dark:hover:text-[#e8e8e8] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg text-slate-500 dark:text-[#737373] hover:text-slate-900 dark:hover:text-[#e8e8e8] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mb-3 text-[10px] text-slate-500 dark:text-[#4a4a4a] font-bold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Win trade</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Loss trade</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rotate-45 bg-indigo-500 inline-block rounded-sm" />Observation</span>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 dark:text-[#3a3a3a] uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTrades = tradesByDay.get(key) ?? [];
            const dayObs = observationsByDay.get(key) ?? [];
            const pnl = getDayPnl(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const isTodayDate = isToday(day);

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={`
                  relative p-1.5 min-h-[64px] rounded-xl text-left transition-all
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-400 dark:border-indigo-800/60 shadow-xs' : 'hover:bg-slate-50 dark:hover:bg-[#161622] border border-transparent hover:border-slate-200 dark:hover:border-[#1e1e2d]'}
                `}
              >
                <span className={`
                  text-xs font-medium block mb-1
                  ${isTodayDate ? 'text-indigo-600 dark:text-indigo-400 font-bold' : isCurrentMonth ? 'text-slate-700 dark:text-[#a0a0a0]' : 'text-slate-300 dark:text-[#3a3a3a]'}
                `}>
                  {format(day, 'd')}
                </span>

                {dayTrades.length > 0 && (
                  <div className="space-y-0.5">
                    <div className={`text-[10px] font-bold ${getPnlColor(pnl)}`}>
                      {formatCurrency(pnl, true)}
                    </div>
                    <div className="flex gap-0.5 flex-wrap">
                      {dayTrades.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.result === 'win' ? 'bg-emerald-500' :
                            t.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        />
                      ))}
                      {dayTrades.length > 3 && (
                        <span className="text-[9px] text-slate-400 dark:text-[#4a4a4a]">+{dayTrades.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Observation diamonds (distinct from trade dots) */}
                {dayObs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap">
                    {dayObs.slice(0, 2).map((o) => (
                      <div
                        key={o.id}
                        title={o.title}
                        className="w-2 h-2 rotate-45 rounded-sm bg-indigo-500 dark:bg-indigo-400"
                      />
                    ))}
                    {dayObs.length > 2 && (
                      <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold">+{dayObs.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="lg:w-80 bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-5 shadow-sm">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-[#e8e8e8]">
                {format(selectedDay, 'EEEE, MMM d')}
              </h3>
              {selectedTrades.length > 0 && (
                <span className={`text-sm font-bold ${getPnlColor(getDayPnl(selectedDay))}`}>
                  {formatCurrency(getDayPnl(selectedDay), true)}
                </span>
              )}
            </div>

            {/* Trades section */}
            {selectedTrades.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#4a4a4a] mb-2">Trades</p>
                <div className="space-y-2">
                  {selectedTrades.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trades/${t.id}/edit`}
                      className="block bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl p-3 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-[#e8e8e8]">{t.symbol}</span>
                        <span className={`text-xs font-bold ${getPnlColor(t.net_pnl)}`}>
                          {formatCurrency(t.net_pnl, true)}
                        </span>
                      </div>
                      {t.contract_label && <p className="text-[10px] text-slate-500 dark:text-[#4a4a4a]">{t.contract_label}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.result === 'win' ? 'bg-emerald-500' : t.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="text-[10px] text-slate-500 dark:text-[#4a4a4a]">{t.status.replace(/_/g, ' ')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Observations section */}
            {selectedObservations.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Chart Observations
                </p>
                <div className="space-y-2">
                  {selectedObservations.map((o) => (
                    <Link
                      key={o.id}
                      href="/ideas"
                      className="block bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-3 hover:border-indigo-400 dark:hover:border-indigo-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{o.symbol}</span>
                          {o.mood && <span className="text-xs">{MOOD_EMOJI[o.mood]}</span>}
                        </div>
                        <div className="w-2 h-2 rotate-45 rounded-sm bg-indigo-500 dark:bg-indigo-400 flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-indigo-200 line-clamp-2 leading-snug">{o.title}</p>
                      {o.timeframe && (
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{o.timeframe}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedTrades.length === 0 && selectedObservations.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-[#3a3a3a]">Nothing recorded this day.</p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-32 text-center gap-2">
            <p className="text-sm font-bold text-slate-400 dark:text-[#3a3a3a]">Select a day</p>
            <p className="text-xs text-slate-300 dark:text-[#2a2a2a]">to see trades and observations</p>
          </div>
        )}
      </div>
    </div>
  );
}
