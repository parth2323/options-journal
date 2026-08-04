'use client';

import { Trade } from '@/lib/types';
import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getPnlColor } from '@/lib/utils';
import Link from 'next/link';

interface CalendarViewProps {
  trades: Trade[];
}

export function CalendarView({ trades }: CalendarViewProps) {
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

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedTrades = selectedKey ? (tradesByDay.get(selectedKey) ?? []) : [];

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
      <div className="flex-1 bg-[#202020] border border-[#2a2a2a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#e8e8e8]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button onClick={prev} className="p-1.5 hover:bg-[#2a2a2a] rounded-md text-[#737373] hover:text-[#e8e8e8] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="p-1.5 hover:bg-[#2a2a2a] rounded-md text-[#737373] hover:text-[#e8e8e8] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[#3a3a3a] uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTrades = tradesByDay.get(key) ?? [];
            const pnl = getDayPnl(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const isTodayDate = isToday(day);

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={`
                  relative p-1.5 min-h-[64px] rounded-lg text-left transition-colors
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-indigo-950/40 border border-indigo-800/40' : 'hover:bg-[#252525] border border-transparent'}
                `}
              >
                <span className={`
                  text-xs font-medium block mb-1
                  ${isTodayDate ? 'text-indigo-400 font-bold' : isCurrentMonth ? 'text-[#a0a0a0]' : 'text-[#3a3a3a]'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayTrades.length > 0 && (
                  <div className="space-y-0.5">
                    <div className={`text-[10px] font-medium ${getPnlColor(pnl)}`}>
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
                        <span className="text-[9px] text-[#4a4a4a]">+{dayTrades.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="lg:w-72 bg-[#202020] border border-[#2a2a2a] rounded-xl p-5">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8e8e8]">
                {format(selectedDay, 'EEEE, MMM d')}
              </h3>
              <span className={`text-sm font-bold ${getPnlColor(getDayPnl(selectedDay))}`}>
                {formatCurrency(getDayPnl(selectedDay), true)}
              </span>
            </div>
            {selectedTrades.length === 0 ? (
              <p className="text-xs text-[#3a3a3a]">No trades this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedTrades.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trades/${t.id}/edit`}
                    className="block bg-[#191919] border border-[#2a2a2a] rounded-lg p-3 hover:border-[#3a3a3a] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-[#e8e8e8]">{t.symbol}</span>
                      <span className={`text-xs font-medium ${getPnlColor(t.net_pnl)}`}>
                        {formatCurrency(t.net_pnl, true)}
                      </span>
                    </div>
                    {t.contract_label && <p className="text-[10px] text-[#4a4a4a]">{t.contract_label}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        t.result === 'win' ? 'bg-emerald-500' :
                        t.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-[10px] text-[#4a4a4a]">{t.status.replace('_', ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-32 text-center">
            <p className="text-sm text-[#3a3a3a]">Click a day to see trades</p>
          </div>
        )}
      </div>
    </div>
  );
}
