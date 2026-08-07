'use client';

import { EconomicCalendar } from '@/components/market/EconomicCalendar';
import { NewsFeed } from '@/components/market/NewsFeed';
import { LiveMarketBar } from '@/components/market/LiveMarketBar';
import { BarChart2, CalendarDays, Newspaper } from 'lucide-react';
import { useState } from 'react';

type Tab = 'calendar' | 'news';

export default function MarketPage() {
  const [mobileTab, setMobileTab] = useState<Tab>('calendar');

  return (
    <div className="px-3 py-4 sm:p-5 max-w-full min-h-screen flex flex-col space-y-3 sm:space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 flex-shrink-0" />
            <span className="truncate">Market</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-[#737373] mt-0.5 font-medium hidden sm:block">
            Economic calendar · Market news · Live data
          </p>
        </div>
      </div>

      {/* Live Yahoo Finance Market Quotes Ticker */}
      <LiveMarketBar className="flex-shrink-0" />

      {/* Mobile tab toggle */}
      <div className="lg:hidden flex border border-slate-200 dark:border-[#1e1e2d] rounded-xl overflow-hidden flex-shrink-0">
        <button
          onClick={() => setMobileTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${mobileTab === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
        >
          <CalendarDays className="w-4 h-4" /> Economic Calendar
        </button>
        <button
          onClick={() => setMobileTab('news')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${mobileTab === 'news' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
        >
          <Newspaper className="w-4 h-4" /> News Feed
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 min-h-0 flex gap-5">
        {/* Economic Calendar Panel */}
        <div className={`flex flex-col min-h-0 ${mobileTab === 'calendar' ? 'flex' : 'hidden'} lg:flex lg:flex-1`}>
          {/* Panel header — desktop only */}
          <div className="hidden lg:flex items-center gap-2 mb-3 flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Economic Calendar
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-[#1e1e2d] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#2a2a3c] px-2 py-0.5 rounded-full">
              via ForexFactory
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <EconomicCalendar />
          </div>
        </div>

        {/* Vertical divider — desktop */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-[#1e1e2d] flex-shrink-0" />

        {/* News Feed Panel */}
        <div className={`flex flex-col min-h-0 ${mobileTab === 'news' ? 'flex' : 'hidden'} lg:flex lg:w-[380px] xl:w-[420px] flex-shrink-0`}>
          <div className="flex-1 min-h-0 overflow-hidden">
            <NewsFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
