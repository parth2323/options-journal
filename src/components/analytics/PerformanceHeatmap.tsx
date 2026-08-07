'use client';

import { useMemo } from 'react';
import type { HeatmapCell } from './analyticsCompute';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: HeatmapCell[];
}

const HOUR_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
const DAY_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function pnlToColor(avgPnl: number, maxAbs: number): string {
  if (maxAbs === 0) return 'rgba(100,100,100,0.1)';
  const intensity = Math.min(Math.abs(avgPnl) / maxAbs, 1);
  if (avgPnl > 0) {
    const g = Math.round(80 + intensity * 95);
    const alpha = 0.15 + intensity * 0.75;
    return `rgba(16,${g},129,${alpha})`;
  } else {
    const r = Math.round(180 + intensity * 75);
    const alpha = 0.15 + intensity * 0.75;
    return `rgba(${r},68,68,${alpha})`;
  }
}

export function PerformanceHeatmap({ data }: Props) {
  const { grid, maxAbs, activeHours } = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    for (const cell of data) {
      map.set(`${cell.day}:${cell.hour}`, cell);
    }
    const allPnls = data.map((c) => Math.abs(c.avgPnl));
    const max = allPnls.length ? Math.max(...allPnls) : 0;

    // Only show hours 6am–8pm to reduce noise
    const hours = Array.from({ length: 15 }, (_, i) => i + 6);
    const days = [0, 1, 2, 3, 4, 5, 6];

    return { grid: { map, days, hours }, maxAbs: max, activeHours: hours };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400 dark:text-[#555]">No timing data yet. Trades need open & close timestamps.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#252525] rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8e8e8]">Performance Heatmap</h3>
        <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Average P&L by day × hour — hover for details</p>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-max">
          {/* Legend */}
          <div className="flex gap-2 mb-3 text-[10px] text-slate-500 dark:text-[#737373] items-center">
            <span>Scale:</span>
            <div className="flex gap-0.5">
              {[0.2, 0.5, 1].map((v) => (
                <div key={v} className="w-5 h-3 rounded-sm" style={{ background: pnlToColor(-(maxAbs * v), maxAbs) }} />
              ))}
            </div>
            <span>Loss</span>
            <div className="w-4" />
            <div className="flex gap-0.5">
              {[1, 0.5, 0.2].map((v) => (
                <div key={v} className="w-5 h-3 rounded-sm" style={{ background: pnlToColor(maxAbs * v, maxAbs) }} />
              ))}
            </div>
            <span>Profit</span>
          </div>

          {/* Hour header */}
          <div className="flex gap-0.5 mb-1 pl-7">
            {activeHours.map((h) => (
              <div key={h} className="w-7 text-center text-[9px] text-slate-400 dark:text-[#555] font-medium">
                {HOUR_LABELS[h]}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {grid.days.map((day) => (
            <div key={day} className="flex gap-0.5 mb-0.5 items-center">
              <div className="w-6 text-[10px] text-slate-500 dark:text-[#737373] font-bold text-right pr-1 flex-shrink-0">
                {DAY_SHORT[day]}
              </div>
              {activeHours.map((hour) => {
                const cell = grid.map.get(`${day}:${hour}`);
                const bg = cell ? pnlToColor(cell.avgPnl, maxAbs) : 'rgba(100,100,100,0.06)';
                return (
                  <div
                    key={hour}
                    className="w-7 h-7 rounded-sm flex items-center justify-center cursor-default group relative"
                    style={{ background: bg }}
                    title={cell ? `${DAY_SHORT[day]} ${HOUR_LABELS[hour]}: ${formatCurrency(cell.avgPnl, true)} avg (${cell.trades} trade${cell.trades !== 1 ? 's' : ''})` : '—'}
                  >
                    {cell && (
                      <span className="text-[8px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                        {cell.trades}
                      </span>
                    )}
                    {cell && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 dark:bg-[#0d0d14] text-white rounded-lg px-2.5 py-2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl border border-white/10">
                        <div className="font-bold mb-0.5">{DAY_SHORT[day]} {HOUR_LABELS[hour]}:00</div>
                        <div className={`${cell.avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          Avg: {formatCurrency(cell.avgPnl, true)}
                        </div>
                        <div className="text-slate-400">{cell.trades} trade{cell.trades !== 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
