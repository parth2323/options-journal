'use client';

import { useState } from 'react';
import { BarChart3, Grid3X3, Clock, TrendingDown, Trophy, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsData } from './analyticsCompute';

// Lazy-loaded chart components
import { PerformanceHeatmap } from './PerformanceHeatmap';
import { DayOfWeekChart } from './DayOfWeekChart';
import { SessionBreakdown } from './SessionBreakdown';
import { HoldTimeHistogram } from './HoldTimeHistogram';
import { StreakTracker } from './StreakTracker';
import { SymbolBreakdown } from './SymbolBreakdown';
import { CommissionDrain } from './CommissionDrain';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'timing', label: 'Timing', icon: Clock },
  { id: 'symbols', label: 'Symbols', icon: TrendingDown },
  { id: 'risk', label: 'Risk & Costs', icon: DollarSign },
] as const;

type TabId = typeof tabs[number]['id'];

interface Props {
  data: AnalyticsData;
}

export function AnalyticsClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="space-y-5">
      {/* Tab bar — horizontally scrollable on mobile */}
      <div className="overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
        <div className="flex gap-1 bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl w-max min-w-full sm:w-fit sm:min-w-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0',
                activeTab === id
                  ? 'bg-white dark:bg-[#252525] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-[#737373] hover:text-slate-700 dark:hover:text-[#e8e8e8]'
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <StreakTracker data={data.streaks} />
            <CommissionDrain data={data.commission} />
          </div>
          <DayOfWeekChart data={data.dayOfWeek} />
        </div>
      )}

      {activeTab === 'timing' && (
        <div className="space-y-5">
          <PerformanceHeatmap data={data.heatmap} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SessionBreakdown data={data.sessions} />
            <HoldTimeHistogram data={data.holdTime} />
          </div>
        </div>
      )}

      {activeTab === 'symbols' && (
        <div className="space-y-5">
          <SymbolBreakdown data={data.symbols} />
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-5">
          <CommissionDrain data={data.commission} detailed />
          <DayOfWeekChart data={data.dayOfWeek} showRisk />
        </div>
      )}
    </div>
  );
}
