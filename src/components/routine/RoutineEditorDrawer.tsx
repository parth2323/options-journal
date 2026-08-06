'use client';

import { useState } from 'react';
import { RoutineData, RoutinePhase, RoutineRegime, RoutineRule } from '@/lib/types';
import { DEFAULT_ROUTINE_DATA } from '@/lib/routineData';
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  Sparkles,
  Clock,
  Layers,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface RoutineEditorDrawerProps {
  routine: RoutineData;
  onClose: () => void;
  onSave: (updated: RoutineData) => Promise<void>;
}

type Tab = 'phases' | 'regimes' | 'rules';

export function RoutineEditorDrawer({ routine: initialRoutine, onClose, onSave }: RoutineEditorDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('phases');
  const [data, setData] = useState<RoutineData>(JSON.parse(JSON.stringify(initialRoutine)));
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(data.phases[0]?.id ?? null);

  // ── Phase Helpers ────────────────────────────────────────────────────────────

  const addPhase = () => {
    const newPhaseNum = data.phases.length + 1;
    const newPhase: RoutinePhase = {
      id: `phase-${crypto.randomUUID().slice(0, 8)}`,
      phaseNumber: newPhaseNum,
      title: `PHASE ${newPhaseNum}: NEW PHASE`,
      timeWindow: '9:00 AM – 9:30 AM',
      startMinutes: 540,
      endMinutes: 570,
      description: '',
      items: [
        { time: '9:00 AM', action: 'Write your action step here.' },
      ],
    };
    setData((prev) => ({ ...prev, phases: [...prev.phases, newPhase] }));
    setExpandedPhaseId(newPhase.id);
  };

  const updatePhase = (id: string, fields: Partial<RoutinePhase>) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    }));
  };

  const deletePhase = (id: string) => {
    setData((prev) => {
      const updated = prev.phases.filter((p) => p.id !== id);
      const renumbered = updated.map((p, idx) => ({ ...p, phaseNumber: idx + 1 }));
      return { ...prev, phases: renumbered };
    });
  };

  const movePhase = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= data.phases.length) return;
    const newPhases = [...data.phases];
    const temp = newPhases[idx];
    newPhases[idx] = newPhases[targetIdx];
    newPhases[targetIdx] = temp;

    const renumbered = newPhases.map((p, i) => ({ ...p, phaseNumber: i + 1 }));
    setData((prev) => ({ ...prev, phases: renumbered }));
  };

  const addPhaseItem = (phaseId: string) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          items: [...p.items, { time: '', action: 'New action step' }],
        };
      }),
    }));
  };

  const updatePhaseItem = (phaseId: string, itemIdx: number, fields: Partial<{ time: string; tool: string; action: string }>) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        const newItems = [...p.items];
        newItems[itemIdx] = { ...newItems[itemIdx], ...fields };
        return { ...p, items: newItems };
      }),
    }));
  };

  const deletePhaseItem = (phaseId: string, itemIdx: number) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          items: p.items.filter((_, i) => i !== itemIdx),
        };
      }),
    }));
  };

  // ── Regime Helpers ───────────────────────────────────────────────────────────

  const addRegime = () => {
    const newRegime: RoutineRegime = {
      id: `regime-${crypto.randomUUID().slice(0, 8)}`,
      regime: 'New Market Regime',
      condition: 'Enter price condition here',
      action: 'Enter execution strategy here',
    };
    setData((prev) => ({ ...prev, regimes: [...prev.regimes, newRegime] }));
  };

  const updateRegime = (id: string, fields: Partial<RoutineRegime>) => {
    setData((prev) => ({
      ...prev,
      regimes: prev.regimes.map((r) => (r.id === id ? { ...r, ...fields } : r)),
    }));
  };

  const deleteRegime = (id: string) => {
    setData((prev) => ({
      ...prev,
      regimes: prev.regimes.filter((r) => r.id !== id),
    }));
  };

  // ── Rule Helpers ─────────────────────────────────────────────────────────────

  const addRule = () => {
    const nextNum = data.rules.length + 1;
    const newRule: RoutineRule = {
      id: nextNum,
      title: `Rule #${nextNum}`,
      text: 'Write your trading rule here.',
    };
    setData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const updateRule = (id: number, fields: Partial<RoutineRule>) => {
    setData((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === id ? { ...r, ...fields } : r)),
    }));
  };

  const deleteRule = (id: number) => {
    setData((prev) => {
      const updated = prev.rules.filter((r) => r.id !== id);
      const renumbered = updated.map((r, idx) => ({ ...r, id: idx + 1 }));
      return { ...prev, rules: renumbered };
    });
  };

  // ── Reset & Save Actions ─────────────────────────────────────────────────────

  const handleResetToDefault = () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_ROUTINE_DATA)));
    setConfirmReset(false);
    toast.success('Reset to default SPY A-Session template');
  };

  const handleClearAll = () => {
    setData((prev) => ({
      ...prev,
      title: 'MY CUSTOM TRADING ROUTINE',
      subtitle: 'PERSONAL EXECUTION PROTOCOL',
      phases: [],
      regimes: [],
      rules: [],
      resetCommitment: '',
    }));
    toast.info('Cleared routine. Build your custom phases!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch {
      toast.error('Failed to save routine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer Container */}
      <div
        className="relative w-full sm:w-[680px] h-full bg-white dark:bg-[#12121a] border-l border-slate-200 dark:border-[#1e1e2d] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-[#1e1e2d] flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Dynamic Routine Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#737373] font-medium mt-0.5">
              Customize phases, checklist steps, regimes, and golden rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e1e2d] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Metadata (Title / Subtitle) */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#161622] border-b border-slate-200 dark:border-[#1e1e2d] space-y-3 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Routine Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Subtitle / Hours</label>
              <input
                type="text"
                value={data.subtitle}
                onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                className="w-full bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-[#1e1e2d] bg-slate-100/60 dark:bg-[#14141f] flex-shrink-0">
          <button
            onClick={() => setActiveTab('phases')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'phases'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#12121a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Timeline & Steps ({data.phases.length})
          </button>
          <button
            onClick={() => setActiveTab('regimes')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'regimes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#12121a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Regimes ({data.regimes.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#12121a]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> Rules & Reset ({data.rules.length})
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: PHASES & CHECKLIST STEPS */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Manage timeline phases and step actions
                </span>
                <button
                  onClick={addPhase}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Phase
                </button>
              </div>

              {data.phases.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No phases created yet. Click "+ Add Phase" to start.
                </div>
              ) : (
                data.phases.map((phase, idx) => {
                  const isExpanded = expandedPhaseId === phase.id;

                  return (
                    <div
                      key={phase.id}
                      className="border border-slate-200 dark:border-[#1e1e2d] rounded-2xl bg-white dark:bg-[#161622] overflow-hidden"
                    >
                      {/* Accordion Phase Header */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#1a1a28] border-b border-slate-200 dark:border-[#1e1e2d]">
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                            {phase.phaseNumber}
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {phase.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {phase.timeWindow}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => movePhase(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePhase(idx, 'down')}
                            disabled={idx === data.phases.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePhase(phase.id)}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-1"
                            title="Delete Phase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Phase Content */}
                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          {/* Phase Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phase Title</label>
                              <input
                                type="text"
                                value={phase.title}
                                onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Time Window Text</label>
                              <input
                                type="text"
                                value={phase.timeWindow}
                                onChange={(e) => updatePhase(phase.id, { timeWindow: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Start Minutes (e.g. 8:00 AM = 480)</label>
                              <input
                                type="number"
                                value={phase.startMinutes}
                                onChange={(e) => updatePhase(phase.id, { startMinutes: parseInt(e.target.value, 10) || 0 })}
                                className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">End Minutes (e.g. 8:30 AM = 510)</label>
                              <input
                                type="number"
                                value={phase.endMinutes}
                                onChange={(e) => updatePhase(phase.id, { endMinutes: parseInt(e.target.value, 10) || 0 })}
                                className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Optional Banner Description</label>
                            <input
                              type="text"
                              value={phase.description ?? ''}
                              onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                              placeholder="e.g. Do not place a single order during this window."
                              className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Checklist Steps */}
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1e1e2d]">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                                Checklist Steps ({phase.items.length})
                              </span>
                              <button
                                onClick={() => addPhaseItem(phase.id)}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Step
                              </button>
                            </div>

                            {phase.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="flex items-center gap-2 bg-slate-50 dark:bg-[#12121a] p-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a3c]"
                              >
                                <input
                                  type="text"
                                  value={item.time ?? ''}
                                  onChange={(e) => updatePhaseItem(phase.id, itemIdx, { time: e.target.value })}
                                  placeholder="Time tag"
                                  className="w-24 bg-white dark:bg-[#1a1a26] border border-slate-200 dark:border-[#2a2a3c] rounded-lg px-2 py-1 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0"
                                />
                                <input
                                  type="text"
                                  value={item.tool ?? ''}
                                  onChange={(e) => updatePhaseItem(phase.id, itemIdx, { tool: e.target.value })}
                                  placeholder="Tool (optional)"
                                  className="w-28 bg-white dark:bg-[#1a1a26] border border-slate-200 dark:border-[#2a2a3c] rounded-lg px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 flex-shrink-0"
                                />
                                <input
                                  type="text"
                                  value={item.action}
                                  onChange={(e) => updatePhaseItem(phase.id, itemIdx, { action: e.target.value })}
                                  placeholder="Action step description"
                                  className="flex-1 bg-white dark:bg-[#1a1a26] border border-slate-200 dark:border-[#2a2a3c] rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 dark:text-white"
                                />
                                <button
                                  onClick={() => deletePhaseItem(phase.id, itemIdx)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: OPENING REGIMES */}
          {activeTab === 'regimes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Define morning market regimes & strategy rules
                </span>
                <button
                  onClick={addRegime}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Regime
                </button>
              </div>

              {data.regimes.map((regime) => (
                <div
                  key={regime.id}
                  className="p-4 bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={regime.regime}
                      onChange={(e) => updateRegime(regime.id, { regime: e.target.value })}
                      placeholder="Regime Name (e.g. Inside Range)"
                      className="flex-1 bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => deleteRegime(regime.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Condition</label>
                      <input
                        type="text"
                        value={regime.condition}
                        onChange={(e) => updateRegime(regime.id, { condition: e.target.value })}
                        placeholder="Condition (e.g. PMH & PML both between PDL & PDH)"
                        className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-mono text-indigo-700 dark:text-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Action / Strategy</label>
                      <input
                        type="text"
                        value={regime.action}
                        onChange={(e) => updateRegime(regime.id, { action: e.target.value })}
                        placeholder="Action (e.g. Wait for breakout)"
                        className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: GOLDEN RULES & RESET */}
          {activeTab === 'rules' && (
            <div className="space-y-5">
              {/* Rules Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Non-negotiable trading rules
                  </span>
                  <button
                    onClick={addRule}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </button>
                </div>

                {data.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-2xl flex items-start gap-3"
                  >
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 pt-2 flex-shrink-0 font-mono">
                      #{rule.id}
                    </span>
                    <input
                      type="text"
                      value={rule.text}
                      onChange={(e) => updateRule(rule.id, { text: e.target.value })}
                      className="flex-1 bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reset Commitment Statement */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1e1e2d] space-y-2">
                <label className="text-xs font-black text-slate-900 dark:text-white block">
                  Daily Reset Commitment Statement
                </label>
                <textarea
                  rows={4}
                  value={data.resetCommitment}
                  onChange={(e) => setData({ ...data, resetCommitment: e.target.value })}
                  placeholder="Enter your personal daily reset commitment statement..."
                  className="w-full bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3c] rounded-xl p-3 text-xs italic font-semibold text-slate-800 dark:text-indigo-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-[#1e1e2d] bg-white dark:bg-[#12121a] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex gap-2">
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Confirm Reset to Template
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-slate-500 font-bold hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3 py-2 border border-slate-200 dark:border-[#2a2a3c] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a28] rounded-xl text-xs font-bold flex items-center gap-1.5"
                title="Restore default SPY A-Session template"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Template
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-3 py-2 border border-slate-200 dark:border-[#2a2a3c] text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-xl text-xs font-bold"
            >
              Start Blank
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save & Apply to Supabase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
