'use client';

import { useState } from 'react';
import { ChartObservation } from '@/lib/types';
import { ObservationForm } from './ObservationForm';
import { X, Edit3, Trash2, ChevronLeft, ChevronRight, Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ObservationDrawerProps {
  observation: ChartObservation;
  onClose: () => void;
  onUpdate: (updated: ChartObservation) => void;
  onDelete: (id: string) => void;
}

const MOOD_EMOJI: Record<string, string> = {
  confident: '😤',
  uncertain: '😟',
  neutral: '😐',
  excited: '🤩',
  regret: '😔',
};

const RESULT_STYLES: Record<string, string> = {
  profit: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  loss: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  unknown: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
};

const RESULT_LABELS: Record<string, string> = {
  profit: '✅ Would Profit',
  loss: '❌ Would Loss',
  unknown: '❓ Unknown',
};

export function ObservationDrawer({ observation, onClose, onUpdate, onDelete }: ObservationDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleUpdate = async (data: Partial<ChartObservation>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/observations/${observation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
      toast.success('Observation updated!');
    } catch {
      toast.error('Failed to update observation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/observations/${observation.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error();
      onDelete(observation.id);
      toast.success('Observation deleted');
    } catch {
      toast.error('Failed to delete observation');
      setDeleting(false);
    }
  };

  const imgs = (observation.screenshot_urls ?? []).filter((url) => !url.startsWith('blob:'));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <div
        className="relative w-full sm:w-[520px] h-[92dvh] sm:h-full bg-white dark:bg-[#12121a] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-[#1e1e2d] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS grab handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-[#2a2a40]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-[#1e1e2d] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xs font-black bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                {observation.symbol}
              </span>
              {observation.timeframe && (
                <span className="text-xs font-bold bg-slate-100 dark:bg-[#1e1e2d] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#2a2a3c] px-2 py-0.5 rounded-full">
                  {observation.timeframe}
                </span>
              )}
              {observation.would_have_result && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${RESULT_STYLES[observation.would_have_result]}`}>
                  {RESULT_LABELS[observation.would_have_result]}
                </span>
              )}
              {observation.mood && (
                <span className="text-sm" title={observation.mood}>{MOOD_EMOJI[observation.mood]}</span>
              )}
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug truncate">
              {observation.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e1e2d] rounded-lg transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {editing ? (
            <div className="p-5">
              <ObservationForm
                initial={observation}
                onSave={handleUpdate}
                onCancel={() => setEditing(false)}
                saving={saving}
              />
            </div>
          ) : (
            <div className="space-y-5 p-5">
              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(observation.observed_at), 'EEEE, MMM d yyyy')}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(observation.observed_at), 'h:mm a')}
                </span>
              </div>

              {/* Screenshot viewer */}
              {imgs.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#1e1e2d] bg-slate-100 dark:bg-[#0f0f18] relative aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgs[imgIdx]}
                    alt={`Screenshot ${imgIdx + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                        disabled={imgIdx === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full disabled:opacity-30 hover:bg-black/70 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))}
                        disabled={imgIdx === imgs.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full disabled:opacity-30 hover:bg-black/70 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {imgs.map((_, i) => (
                          <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Body text */}
              {observation.body && (
                <div className="bg-slate-50/80 dark:bg-[#14141f] border border-slate-200/80 dark:border-[#1e1e2d] rounded-2xl p-4">
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {observation.body}
                  </p>
                </div>
              )}

              {/* Tags */}
              {observation.tags?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <Tag className="w-3.5 h-3.5" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {observation.tags.map((tag) => (
                      <span key={tag} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!editing && (
          <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-200 dark:border-[#1e1e2d] bg-white dark:bg-[#12121a] flex-shrink-0">
            <button
              onClick={() => { setEditing(true); setConfirmDelete(false); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-[#2a2a3c] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a28] transition-all"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                confirmDelete
                  ? 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
                  : 'border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
