'use client';

import { useState, useEffect, useMemo } from 'react';
import { RoutineData } from '@/lib/types';
import {
  Clock,
  CheckSquare,
  Square,
  AlertOctagon,
  Flame,
  Layers,
  Zap,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { RoutineEditorDrawer } from './RoutineEditorDrawer';

interface RoutineDashboardProps {
  initialRoutine: RoutineData;
}

export function RoutineDashboard({ initialRoutine }: RoutineDashboardProps) {
  const [routine, setRoutine] = useState<RoutineData>(initialRoutine);
  const [estTime, setEstTime] = useState<string>('');
  const [currentMinutes, setCurrentMinutes] = useState<number>(0);
  const [selectedRegime, setSelectedRegime] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Live EST clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const estStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setEstTime(estStr);

      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).formatToParts(now);

      let h = 0, m = 0;
      parts.forEach((p) => {
        if (p.type === 'hour') h = parseInt(p.value, 10);
        if (p.type === 'minute') m = parseInt(p.value, 10);
      });
      setCurrentMinutes(h * 60 + m);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleStep = (stepKey: string) => {
    setCheckedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const handleSaveRoutine = async (updated: RoutineData) => {
    const res = await fetch('/api/routine', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update routine');
    const data = await res.json();
    setRoutine(data);
    setIsEditing(false);
    toast.success('Routine updated & saved to Supabase!');
  };

  // Calculate overall checklist progress
  const totalItems = useMemo(() => {
    return routine.phases.reduce((sum, phase) => sum + phase.items.length, 0);
  }, [routine]);

  const completedItemsCount = useMemo(() => {
    return Object.values(checkedSteps).filter(Boolean).length;
  }, [checkedSteps]);

  const progressPercent = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* ── TOP HEADER CONTROLS & LIVE CLOCK ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-700 border border-orange-500/25 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              Disciplined Execution
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              America/New_York (EST)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
            {routine.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
            {routine.subtitle}
          </p>
        </div>

        {/* Right side live clock, progress & edit button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          {/* Daily Routine Progress */}
          <div className="bg-indigo-50/80 border border-indigo-200/80 dark:bg-indigo-950/30 dark:border-indigo-500/30 rounded-xl px-4 py-2 text-left sm:text-right w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-[11px] font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                Daily Completion
              </span>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 font-mono">
                {completedItemsCount}/{totalItems}
              </span>
            </div>
            <div className="w-full bg-indigo-200/60 dark:bg-indigo-950 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Live EST Clock */}
          <div className="bg-slate-50 border border-slate-200 dark:bg-[#191926] dark:border-[#2a2a3e] rounded-xl px-4 py-2 text-left sm:text-right w-full sm:w-auto">
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Current EST Time
            </p>
            <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-500 leading-tight">
              {estTime || '10:00:00 AM'}
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-900 dark:bg-[#202030] dark:border-[#333348] dark:text-white dark:hover:bg-[#2a2a40] rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 w-full sm:w-auto"
          >
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isEditing ? 'Close Editor' : 'Edit Routine'}
          </button>
        </div>
      </div>

      {/* ── EDIT ROUTINE DRAWER ────────────────────────────────────────────── */}
      {isEditing && (
        <RoutineEditorDrawer
          routine={routine}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveRoutine}
        />
      )}

      {/* ── MACRO SCRUB QUICK LAUNCHER WIDGETS ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="https://www.forexfactory.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50/80 hover:border-amber-400 dark:bg-[#12121a] dark:border-[#1e1e2d] dark:hover:bg-[#181824] dark:hover:border-amber-500 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📅</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                ForexFactory.com
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Check Red Folder Events</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </a>

        <a
          href="https://www.tradingview.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50/80 hover:border-indigo-400 dark:bg-[#12121a] dark:border-[#1e1e2d] dark:hover:bg-[#181824] dark:hover:border-indigo-500 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📈</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                TradingView Charts
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">DXY, US10Y, USOIL & SPY</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </a>

        <a
          href="https://www.financialjuice.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50/80 hover:border-purple-400 dark:bg-[#12121a] dark:border-[#1e1e2d] dark:hover:bg-[#181824] dark:hover:border-purple-500 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📰</span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                FinancialJuice Live
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scan Geopolitical News</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
        </a>
      </div>

      {/* ── THE SIX OPENING REGIMES CLASSIFICATION MATRIX ──────────────────── */}
      <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#1f1f2e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                The Six Opening Regimes (Classify Every Morning at 8:50 AM)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Click today's regime to highlight your exact morning bias and execution strategy.
              </p>
            </div>
          </div>
          {selectedRegime && (
            <button
              onClick={() => setSelectedRegime(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline self-start md:self-auto cursor-pointer"
            >
              Clear Selected Regime
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {routine.regimes.map((r) => {
            const isSelected = selectedRegime === r.regime;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRegime(isSelected ? null : r.regime)}
                className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 space-y-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-600/40'
                    : 'border-slate-200/90 bg-white hover:bg-slate-50/80 dark:hover:bg-[#1a1a28] shadow-xs hover:border-indigo-400 dark:border-[#1e1e2d] dark:bg-[#161622] dark:hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                    {r.regime}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                      ACTIVE TODAY
                    </span>
                  )}
                </div>

                {/* Condition Tag Pill */}
                <div className="bg-slate-100/90 border border-slate-200 dark:bg-[#191926] dark:border-white/10 rounded-xl px-3 py-1.5 inline-block w-full">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-400 block mb-0.5">Condition</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 block">
                    {r.condition}
                  </span>
                </div>

                {/* Bias & Action Strategy */}
                <div className="text-xs leading-relaxed">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 mr-1.5">🎯 Strategy:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {r.action}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PHASE 6 & BLACKOUT WARNING BANNER ─────────────────────────────── */}
      <div className="bg-red-50/90 border-2 border-red-300 text-red-950 dark:bg-red-950/40 dark:border-red-500/40 rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-red-400 dark:hover:border-red-400">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-3 py-0.5 rounded-full border border-red-300 dark:border-red-800/60">
              Phase 6: Blackout & Data Rules
            </span>
            <h3 className="text-base font-black text-red-950 dark:text-red-200">
              9:55 AM Sticky Note Rule: Tier-1 Event @ 10:00 AM → FLAT BY 9:55
            </h3>
            <p className="text-xs md:text-sm font-bold text-red-900 dark:text-red-200/90">
              Do not jump into the first violent candle after data. If a Fed speaker is scheduled, be flat 2 minutes before they start.
            </p>
          </div>
        </div>
      </div>

      {/* ── ROUTINE PHASES TIMELINE GRID (2-COLUMN RESPONSIVE GRID) ──────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e1e2d] pb-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Execution Timeline (Phases 1 through {routine.phases.length})
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
            Track & check off completed steps
          </span>
        </div>

        {/* 2-Column Responsive Layout for Phases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {routine.phases.map((phase) => {
            const isActive =
              currentMinutes >= phase.startMinutes && currentMinutes < phase.endMinutes;

            return (
              <div
                key={phase.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'border-indigo-500 bg-white dark:bg-gradient-to-r dark:from-indigo-500/10 dark:via-purple-50/5 dark:to-transparent shadow-lg ring-2 ring-indigo-400/30 dark:border-indigo-600'
                    : 'border-slate-200/80 bg-white shadow-sm hover:border-indigo-400 dark:border-[#1e1e2d] dark:bg-[#12121a] dark:hover:border-indigo-500'
                }`}
              >
                {/* Phase Header — left border accent strip */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3.5 border-b border-slate-200 dark:border-[#1c1c2b] ${isActive ? 'bg-indigo-50/80 dark:bg-indigo-950/30' : 'bg-slate-50 dark:bg-[#161622]'}`}>
                  <div className="flex items-center gap-3">
                    {/* Phase Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl text-sm font-black flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-md'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-[#202030] dark:text-indigo-300 dark:border-indigo-500/20'
                      }`}
                    >
                      {phase.phaseNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2 leading-snug">
                        {phase.title}
                        {isActive && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                            ● LIVE NOW
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold mt-0.5">
                        {phase.timeWindow}
                      </p>
                    </div>
                  </div>

                  {phase.description && (
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-bold italic bg-amber-50 border border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
                      {phase.description}
                    </span>
                  )}
                </div>

                {/* Phase Items Checklist */}
                <div className="p-3.5 space-y-2.5">
                  {phase.items.map((item, idx) => {
                    const stepKey = `${phase.id}-step-${idx}`;
                    const isChecked = !!checkedSteps[stepKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(stepKey)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 opacity-75'
                            : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/90 dark:hover:bg-[#1f1f32] hover:border-indigo-400 dark:bg-[#171724] dark:border-[#222234] dark:hover:border-indigo-500'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="mt-0.5 flex-shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Time + Tool tag row */}
                          {(item.time || item.tool) && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {item.time && (
                                <span className="font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md text-[11px] border border-indigo-200 dark:border-indigo-500/20">
                                  {item.time}
                                </span>
                              )}
                              {item.tool && (
                                <span className="font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px] border border-amber-200 dark:border-amber-500/20">
                                  🛠 {item.tool}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Action text */}
                          <span className={`text-xs sm:text-sm font-semibold leading-relaxed ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-200'}`}>
                            {item.action}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── THE GOLDEN RULES & RESET COMMITMENT ────────────────────────────── */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1f1f2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                The Golden Rules (Read Aloud Every Morning)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                Non-negotiable trading principles for risk control and emotional control.
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-3.5 py-1 rounded-full self-start sm:self-auto shadow-xs">
            90 Paper‑Trading Days Commitment
          </span>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {routine.rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-slate-50/70 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] hover:bg-slate-100/80 dark:hover:bg-[#1a1a28] hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-4.5 space-y-2 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                  Rule #{rule.id}
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500/60 dark:bg-indigo-400/60" />
              </div>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-bold leading-relaxed">
                {rule.text}
              </p>
            </div>
          ))}
        </div>

        {/* Commitment Footer Note */}
        <div className="bg-indigo-50/80 dark:bg-[#191926] border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4.5 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed font-bold shadow-xs">
          <span className="text-indigo-700 dark:text-indigo-400 font-extrabold mr-1">💬 Daily Reset Commitment:</span>
          <span className="italic">"{routine.resetCommitment}"</span>
        </div>
      </div>
    </div>
  );
}
