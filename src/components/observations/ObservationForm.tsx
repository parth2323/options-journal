'use client';

import { useState, useRef } from 'react';
import { ChartObservation, ObservationMood, ObservationResult } from '@/lib/types';
import { X, Upload, Loader2, Plus, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ObservationFormProps {
  initial?: Partial<ChartObservation>;
  onSave: (data: Partial<ChartObservation>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', 'Daily', 'Weekly'];

const MOODS: { value: ObservationMood; emoji: string; label: string }[] = [
  { value: 'confident', emoji: '😤', label: 'Confident' },
  { value: 'uncertain', emoji: '😟', label: 'Uncertain' },
  { value: 'neutral',   emoji: '😐', label: 'Neutral' },
  { value: 'excited',   emoji: '🤩', label: 'Excited' },
  { value: 'regret',    emoji: '😔', label: 'Regret' },
];

const RESULT_OPTIONS: { value: ObservationResult; label: string; color: string }[] = [
  { value: 'profit',  label: '✅ Would Profit',  color: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { value: 'loss',    label: '❌ Would Loss',    color: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  { value: 'unknown', label: '❓ Unknown',       color: 'border-slate-400 bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300' },
];

function todayLocalISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function compressImageToBase64(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve('');
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function ObservationForm({ initial, onSave, onCancel, saving }: ObservationFormProps) {
  const [symbol, setSymbol] = useState(initial?.symbol ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [observedAt, setObservedAt] = useState(
    initial?.observed_at ? initial.observed_at.slice(0, 16) : todayLocalISO()
  );
  const [timeframe, setTimeframe] = useState(initial?.timeframe ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [mood, setMood] = useState<ObservationMood | ''>(initial?.mood ?? '');
  const [wouldHaveResult, setWouldHaveResult] = useState<ObservationResult | ''>(
    initial?.would_have_result ?? ''
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(
    (initial?.screenshot_urls ?? []).filter((url) => !url.startsWith('blob:'))
  );
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB limit`); continue; }
      const form = new FormData();
      form.append('file', file);
      form.append('observationId', initial?.id ?? 'tmp');
      try {
        const res = await fetch('/api/observations/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { url } = await res.json();
          newUrls.push(url);
        } else {
          // Fallback to compressed Base64 data URL (persists in DB, works everywhere)
          const base64 = await compressImageToBase64(file);
          if (base64) newUrls.push(base64);
        }
      } catch {
        // Fallback to compressed Base64 data URL
        const base64 = await compressImageToBase64(file);
        if (base64) newUrls.push(base64);
      }
    }
    setScreenshotUrls((prev) => [...prev, ...newUrls].slice(0, 4));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !title.trim() || !observedAt) {
      toast.error('Symbol, title, and date are required');
      return;
    }
    await onSave({
      symbol: symbol.toUpperCase(),
      title: title.trim(),
      observed_at: new Date(observedAt).toISOString(),
      timeframe: timeframe || undefined,
      body: body.trim() || undefined,
      mood: (mood as ObservationMood) || undefined,
      would_have_result: (wouldHaveResult as ObservationResult) || undefined,
      tags,
      screenshot_urls: screenshotUrls,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      {/* Row 1: Symbol + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Symbol <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="SPY, QQQ…"
            className="w-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Observed At <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={observedAt}
            onChange={(e) => setObservedAt(e.target.value)}
            className="w-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            required
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Title / What You Saw <span className="text-red-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400">{title.length}/120</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          placeholder="e.g. SPY bounced off PDL with confluence at 8:55 AM…"
          className="w-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          required
        />
      </div>

      {/* Timeframe + Would-have-Result */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">— Select —</option>
            {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Hypothetical Outcome</label>
          <div className="flex gap-1.5">
            {RESULT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setWouldHaveResult(wouldHaveResult === value ? '' : value)}
                className={`flex-1 text-[10px] font-black px-1.5 py-2 rounded-xl border-2 transition-all ${
                  wouldHaveResult === value
                    ? value === 'profit' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : value === 'loss' ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                    : 'border-slate-400 bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300'
                    : 'border-slate-200 dark:border-[#2a2a3c] text-slate-500 dark:text-slate-500 hover:border-indigo-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mood picker */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">How Did You Feel?</label>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map(({ value, emoji, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMood(mood === value ? '' : value)}
              title={label}
              className={`px-3 py-1.5 rounded-xl text-sm border-2 transition-all flex items-center gap-1.5 font-bold ${
                mood === value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 shadow-xs'
                  : 'border-slate-200 dark:border-[#2a2a3c] text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              {emoji} <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes / Body */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Detailed Notes <span className="text-slate-400 font-medium">(optional)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe the setup, what confluences you saw, why you didn't take it, what you'd do differently…"
          rows={4}
          className="w-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none leading-relaxed"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="missed setup, supply zone… (Enter to add)"
            className="flex-1 bg-white dark:bg-[#161622] border border-slate-200 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-black hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screenshot Upload */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Chart Screenshots <span className="text-slate-400 font-medium">(max 4, up to 5MB each)</span>
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {screenshotUrls.map((url, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#2a2a3c] aspect-video bg-slate-100 dark:bg-[#161622]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setScreenshotUrls(screenshotUrls.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {screenshotUrls.length < 4 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-[#2a2a3c] flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500/50 transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-[10px] font-bold">{uploading ? 'Uploading…' : 'Upload Chart'}</span>
            </button>
          )}
          {screenshotUrls.length === 0 && (
            <div className="aspect-video rounded-xl border border-slate-200/80 dark:border-[#1e1e2d] flex flex-col items-center justify-center gap-1 text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-[#14141f]">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[10px]">No screenshots yet</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-[#1e1e2d]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-200 dark:border-[#2a2a3c] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a28] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all shadow-xs active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving…' : initial?.id ? 'Update Observation' : 'Save Observation'}
        </button>
      </div>
    </form>
  );
}
