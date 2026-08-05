'use client';

import { useState, useMemo } from 'react';
import { ChartObservation, ObservationResult } from '@/lib/types';
import { ObservationDrawer } from './ObservationDrawer';
import { ObservationForm } from './ObservationForm';
import {
  Plus, Search, X, Lightbulb, LayoutGrid, List,
  TrendingUp, TrendingDown, HelpCircle, ImageIcon, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface IdeasPageProps {
  initialObservations: ChartObservation[];
}

const MOOD_EMOJI: Record<string, string> = {
  confident: '😤', uncertain: '😟', neutral: '😐', excited: '🤩', regret: '😔',
};

const RESULT_CONFIG: Record<ObservationResult, { icon: React.ReactNode; label: string; badge: string }> = {
  profit: {
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    label: 'Profit',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  loss: {
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    label: 'Loss',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
  },
  unknown: {
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    label: 'Unknown',
    badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600',
  },
};

type FilterResult = 'all' | ObservationResult;
type ViewMode = 'grid' | 'list';

export function IdeasPage({ initialObservations }: IdeasPageProps) {
  const [observations, setObservations] = useState(initialObservations);
  const [selected, setSelected] = useState<ChartObservation | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState<FilterResult>('all');
  const [view, setView] = useState<ViewMode>('grid');

  // Filter + search
  const filtered = useMemo(() => {
    return observations.filter((o) => {
      if (filterResult !== 'all' && o.would_have_result !== filterResult) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.symbol.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        (o.body ?? '').toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [observations, search, filterResult]);

  const handleCreate = async (data: Partial<ChartObservation>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'local', ...data }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setObservations([created, ...observations]);
      setCreating(false);
      toast.success('Observation saved! 💡');
    } catch {
      toast.error('Failed to save observation');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = (updated: ChartObservation) => {
    setObservations(observations.map((o) => o.id === updated.id ? updated : o));
    setSelected(updated);
  };

  const handleDelete = (id: string) => {
    setObservations(observations.filter((o) => o.id !== id));
    setSelected(null);
  };

  const stats = useMemo(() => ({
    total: observations.length,
    profit: observations.filter((o) => o.would_have_result === 'profit').length,
    loss: observations.filter((o) => o.would_have_result === 'loss').length,
  }), [observations]);

  return (
    <div className="p-5 max-w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-indigo-500" />
            Chart Ideas & Observations
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5 font-medium">
            After-hours reflections — setups you spotted, missed, or want to remember
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Observation
        </button>
      </div>

      {/* Stats Row */}
      {observations.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-4 shadow-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373] mb-1">Total Ideas</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-4 shadow-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373] mb-1">Would Profit</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{stats.profit}</p>
          </div>
          <div className="bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-4 shadow-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373] mb-1">Would Loss</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{stats.loss}</p>
          </div>
        </div>
      )}

      {/* Search + Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, title, notes, tags…"
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(['all', 'profit', 'loss', 'unknown'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterResult(f)}
              className={`px-3 py-2 text-xs font-black rounded-xl border transition-all capitalize ${
                filterResult === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#1e1e2d] text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex border border-slate-200 dark:border-[#1e1e2d] rounded-xl overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-2 transition-all ${view === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 transition-all ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-[#12121a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161622]'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {search || filterResult !== 'all' ? 'No matching observations' : 'No observations yet'}
            </p>
            <p className="text-sm text-slate-500 dark:text-[#737373] mt-1 font-medium max-w-sm">
              {search || filterResult !== 'all'
                ? 'Try clearing your search or filters'
                : 'Next time you spot a setup after hours, capture it here — no entry/exit required.'}
            </p>
          </div>
          {!search && filterResult === 'all' && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add First Observation
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((obs) => (
            <ObservationCard key={obs.id} observation={obs} onClick={() => setSelected(obs)} />
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((obs) => (
            <ObservationListRow key={obs.id} observation={obs} onClick={() => setSelected(obs)} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setCreating(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#1e1e2d] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-[#2a2a40]" />
            </div>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-[#1e1e2d]">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">New Chart Observation</h2>
                <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">No entry/exit needed — just what you saw</p>
              </div>
              <button onClick={() => setCreating(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e1e2d] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <ObservationForm onSave={handleCreate} onCancel={() => setCreating(false)} saving={saving} />
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <ObservationDrawer
          observation={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ── Observation Card (Grid) ───────────────────────────────────────────────────

function ObservationCard({ observation: o, onClick }: { observation: ChartObservation; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all space-y-3"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            {o.symbol}
          </span>
          {o.timeframe && (
            <span className="text-xs font-bold bg-slate-100 dark:bg-[#1e1e2d] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#2a2a3c] px-1.5 py-0.5 rounded-full">
              {o.timeframe}
            </span>
          )}
          {o.mood && <span className="text-sm">{MOOD_EMOJI[o.mood]}</span>}
        </div>
        {o.would_have_result && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${RESULT_CONFIG[o.would_have_result].badge}`}>
            {RESULT_CONFIG[o.would_have_result].icon}
            {RESULT_CONFIG[o.would_have_result].label}
          </span>
        )}
      </div>

      {/* Screenshot thumbnail */}
      {o.screenshot_urls?.length > 0 ? (
        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0f0f18] border border-slate-200/80 dark:border-[#1e1e2d] aspect-video relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={o.screenshot_urls[0]} alt="Chart" className="w-full h-full object-cover" />
          {o.screenshot_urls.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 text-[10px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded-md">
              +{o.screenshot_urls.length - 1}
            </span>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 dark:bg-[#14141f] border border-slate-200/80 dark:border-[#1e1e2d] aspect-video flex flex-col items-center justify-center gap-1 text-slate-300 dark:text-slate-700">
          <ImageIcon className="w-6 h-6" />
          <span className="text-[10px]">No screenshot</span>
        </div>
      )}

      {/* Title + Body */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {o.title}
        </h3>
        {o.body && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3 font-medium">
            {o.body}
          </p>
        )}
      </div>

      {/* Tags */}
      {o.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {o.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
          {o.tags.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600">+{o.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Date footer */}
      <div className="text-[10px] text-slate-400 dark:text-[#4a4a4a] font-mono pt-0.5 border-t border-slate-100 dark:border-[#1a1a28]">
        {format(new Date(o.observed_at), 'MMM d, yyyy · h:mm a')}
      </div>
    </div>
  );
}

// ── Observation List Row ──────────────────────────────────────────────────────

function ObservationListRow({ observation: o, onClick }: { observation: ChartObservation; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-[#12121a] border border-slate-200/80 dark:border-[#1e1e2d] rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all flex items-center gap-4"
    >
      {/* Thumbnail */}
      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#0f0f18] border border-slate-200 dark:border-[#1e1e2d] flex-shrink-0">
        {o.screenshot_urls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={o.screenshot_urls[0]} alt="Chart" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">{o.symbol}</span>
          {o.timeframe && (
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{o.timeframe}</span>
          )}
          {o.mood && <span className="text-sm">{MOOD_EMOJI[o.mood]}</span>}
        </div>
        <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {o.title}
        </p>
      </div>

      {/* Result + Date */}
      <div className="text-right flex-shrink-0 space-y-1">
        {o.would_have_result && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 justify-end ${RESULT_CONFIG[o.would_have_result].badge}`}>
            {RESULT_CONFIG[o.would_have_result].icon}
            {RESULT_CONFIG[o.would_have_result].label}
          </span>
        )}
        <p className="text-[10px] text-slate-400 dark:text-[#4a4a4a] font-mono">
          {format(new Date(o.observed_at), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}
