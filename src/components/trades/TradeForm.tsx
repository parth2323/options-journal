'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Account, ConfluenceTag, Trade } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import {
  suggestResult,
  calculateGrossPnl,
  calculatePercentRisk,
  calculateAmountRisked,
  calculateRoiPercent,
  formatCurrency,
  formatPercent,
} from '@/lib/utils';
import { X, Plus, TrendingUp, ShieldAlert, Zap, Hash } from 'lucide-react';

const tradeSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  contract_label: z.string().optional(),
  instrument_type: z.enum(['options', 'stock', 'futures', 'crypto']),
  direction: z.enum(['call_long', 'call_short', 'put_long', 'put_short']).optional(),
  opened_at: z.string().min(1, 'Open time is required'),
  closed_at: z.string().optional(),
  timezone: z.string().default('America/New_York'),
  quantity: z.coerce.number().min(0.01),
  entry_price: z.coerce.number().optional(),
  exit_price: z.coerce.number().optional(),
  gross_pnl: z.coerce.number().default(0),
  commission: z.coerce.number().min(0).default(0),
  result: z.enum(['win', 'loss', 'breakeven']),
  status: z.enum(['open', 'closed_tp', 'closed_sl', 'closed_manual']),
  session: z.enum(['new_york', 'london', 'asia', 'sydney']).optional(),
  percent_risk: z.coerce.number().optional(),
  notes: z.string().optional(),
  screenshot_url: z.string().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;
interface TradeFormProps { accounts: Account[]; tags: ConfluenceTag[]; existing?: Trade; }

/* ─── Shared style atoms ─────────────────────────────────────────────────── */
const inp =
  'w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-3 py-2 text-[13px] text-[var(--t-fg)] ' +
  'placeholder-[#2e2e2e] focus:outline-none focus:border-indigo-500/70 focus:bg-[#101018] ' +
  'focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200';

const sel = `${inp} cursor-pointer appearance-none`;

/* Floating label wrapper */
const Fld = ({
  label, error, badge, children, className = '',
}: {
  label: string; error?: string; badge?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`group relative ${className}`}>
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#3a3a3a] group-focus-within:text-indigo-400/80 transition-colors duration-200">
        {label}
      </span>
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {badge}
        </span>
      )}
    </div>
    {children}
    {error && <p className="text-[9px] text-red-400/80 mt-1">{error}</p>}
  </div>
);

/* Section divider with label */
const Section = ({ label, icon: Icon }: { label: string; icon?: React.ComponentType<{ className?: string }> }) => (
  <div className="flex items-center gap-2 pt-1 pb-0.5">
    {Icon && <Icon className="w-3 h-3 text-indigo-400/60" />}
    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-indigo-400/60">{label}</span>
    <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
  </div>
);

export function TradeForm({ accounts, tags, existing }: TradeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.confluences ?? []);
  const [newTag, setNewTag] = useState('');

  const defaultAccount =
    accounts.find((a) => a.name.toLowerCase() === 'live trades') ??
    accounts.find((a) => a.account_type === 'live') ??
    accounts[0];

  const get10AMToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T10:00`;
  };

  const defaults: Partial<TradeFormValues> = existing ? {
    account_id: existing.account_id,
    symbol: existing.symbol,
    contract_label: existing.contract_label,
    instrument_type: existing.instrument_type,
    direction: existing.direction,
    opened_at: existing.opened_at ? existing.opened_at.slice(0, 16) : get10AMToday(),
    closed_at: existing.closed_at ? existing.closed_at.slice(0, 16) : get10AMToday(),
    timezone: existing.timezone,
    quantity: existing.quantity,
    entry_price: existing.entry_price,
    exit_price: existing.exit_price,
    gross_pnl: existing.gross_pnl,
    commission: existing.commission,
    result: existing.result,
    status: existing.status,
    session: existing.session,
    percent_risk: existing.percent_risk,
    notes: existing.notes,
    screenshot_url: existing.screenshot_url,
  } : {
    account_id: defaultAccount?.id ?? '',
    symbol: 'SPY',
    session: 'new_york',
    instrument_type: 'options',
    status: 'open',
    result: 'breakeven',
    commission: 0,
    quantity: 1,
    timezone: 'America/New_York',
    opened_at: get10AMToday(),
    closed_at: get10AMToday(),
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: defaults as TradeFormValues,
  });

  const entryPrice = watch('entry_price');
  const exitPrice = watch('exit_price');
  const quantity = watch('quantity');
  const direction = watch('direction');
  const instrumentType = watch('instrument_type');
  const grossPnl = watch('gross_pnl');
  const commission = watch('commission');

  const netPnl = (Number(grossPnl) || 0) - (Number(commission) || 0);
  const amountRisked = calculateAmountRisked({ entryPrice: Number(entryPrice) || null, quantity: Number(quantity) || 1, instrumentType });
  const roiPercent = calculateRoiPercent({ netPnl, amountRisked });

  useEffect(() => {
    const ep = Number(entryPrice), xp = Number(exitPrice);
    if (!ep || !xp) return;
    const gross = calculateGrossPnl({ entryPrice: ep, exitPrice: xp, quantity: Number(quantity) || 1, direction, instrumentType });
    if (gross !== null) { setValue('gross_pnl', gross); setValue('result', suggestResult(gross - (Number(commission) || 0))); }
    const risk = calculatePercentRisk({ entryPrice: ep, exitPrice: xp, quantity: Number(quantity) || 1, commission: Number(commission) || 0, direction, instrumentType });
    if (risk !== null) setValue('percent_risk', risk);
  }, [entryPrice, exitPrice, quantity, direction, instrumentType, commission, setValue]);

  const onSubmit = async (data: TradeFormValues) => {
    setSaving(true);
    try {
      const ar = calculateAmountRisked({ entryPrice: Number(data.entry_price) || null, quantity: Number(data.quantity) || 1, instrumentType: data.instrument_type });
      const net = (Number(data.gross_pnl) || 0) - (Number(data.commission) || 0);
      const roi = calculateRoiPercent({ netPnl: net, amountRisked: ar });
      const res = await fetch(existing ? `/api/trades/${existing.id}` : '/api/trades', {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, confluences: selectedTags, amount_risked: ar ?? undefined, roi_percent: roi ?? undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success(existing ? 'Trade updated!' : 'Trade logged!');
      router.push('/trades');
      router.refresh();
    } catch { toast.error('Failed to save trade'); }
    finally { setSaving(false); }
  };

  const addTag = (label: string) => {
    const t = label.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags([...selectedTags, t]);
    setNewTag('');
  };
  const removeTag = (tag: string) => setSelectedTags(selectedTags.filter((t) => t !== tag));

  /* Derived colours */
  const netPositive = netPnl > 0, netNegative = netPnl < 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">

      {/* ── TRADE IDENTITY ─────────────────────────────────────────────── */}
      <Section label="Trade Identity" icon={Hash} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Account" error={errors.account_id?.message}>
          <div className="relative">
            <select {...register('account_id')} className={sel}>
              <option value="">Select account…</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="Symbol" error={errors.symbol?.message}>
          <input {...register('symbol')} placeholder="SPY, TSLA, QQQ…" className={`${inp} font-mono`} />
        </Fld>
        <Fld label="Contract Label">
          <input {...register('contract_label')} placeholder="SPY 747P 0110…" className={`${inp} font-mono`} />
        </Fld>
        <Fld label="Instrument">
          <div className="relative">
            <select {...register('instrument_type')} className={sel}>
              <option value="options">Options</option>
              <option value="stock">Stock</option>
              <option value="futures">Futures</option>
              <option value="crypto">Crypto</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]">▾</div>
          </div>
        </Fld>
      </div>

      {/* ── TRADE SETUP ────────────────────────────────────────────────── */}
      <Section label="Setup" icon={Zap} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Direction">
          <div className="relative">
            <select {...register('direction')} className={sel}>
              <option value="">— None —</option>
              <option value="call_long">📈 Call Long</option>
              <option value="call_short">📉 Call Short</option>
              <option value="put_long">📈 Put Long</option>
              <option value="put_short">📉 Put Short</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="Session">
          <div className="relative">
            <select {...register('session')} className={sel}>
              <option value="">— None —</option>
              <option value="new_york">🗽 New York</option>
              <option value="london">🇬🇧 London</option>
              <option value="asia">🏯 Asia</option>
              <option value="sydney">🦘 Sydney</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="Opened At" error={errors.opened_at?.message}>
          <input type="datetime-local" {...register('opened_at')} className={inp} />
        </Fld>
        <Fld label="Closed At">
          <input type="datetime-local" {...register('closed_at')} className={inp} />
        </Fld>
      </div>

      {/* ── PRICING & PNL ──────────────────────────────────────────────── */}
      <Section label="Pricing & PnL" icon={TrendingUp} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Entry Price / share">
          <input type="number" step="0.0001" {...register('entry_price')} placeholder="0.00" className={`${inp} font-mono`} />
        </Fld>
        <Fld label="Exit Price / share">
          <input type="number" step="0.0001" {...register('exit_price')} placeholder="0.00" className={`${inp} font-mono`} />
        </Fld>
        <Fld label="Qty (Contracts)" error={errors.quantity?.message}>
          <input type="number" step="0.01" min="0.01" {...register('quantity')} className={`${inp} font-mono`} />
        </Fld>
        <Fld label="Commission">
          <input type="number" step="0.01" min="0" {...register('commission')} placeholder="0.00" className={`${inp} font-mono`} />
        </Fld>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Gross PnL">
          <input type="number" step="0.01" {...register('gross_pnl')}
            onBlur={() => setValue('result', suggestResult(netPnl))}
            placeholder="0.00" className={`${inp} font-mono`} />
        </Fld>

        {/* ── NET PNL auto box ── */}
        <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 p-3.5 flex flex-col justify-between ${
          netPositive
            ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30'
            : netNegative
            ? 'border-red-500/50 bg-red-500/10 dark:bg-red-950/30'
            : 'border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black tracking-[0.12em] uppercase ${
              netPositive ? 'text-emerald-700 dark:text-emerald-400' : netNegative ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              Net PnL
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              netPositive
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : netNegative
                ? 'bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
            }`}>
              AUTO
            </span>
          </div>
          <div className={`text-[24px] font-black font-mono tracking-tight leading-tight mt-1 ${
            netPositive ? 'text-emerald-700 dark:text-emerald-400' : netNegative ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
          }`}>
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono mt-1">
            Gross ${Number(grossPnl || 0).toFixed(2)} − Comm ${Number(commission || 0).toFixed(2)}
          </div>
        </div>

        {/* ── MAX RISK auto box ── */}
        <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 p-3.5 flex flex-col justify-between ${
          amountRisked != null
            ? 'border-orange-500/50 bg-orange-500/10 dark:bg-orange-950/30'
            : 'border-gray-200 dark:border-[#1e1e1e] bg-gray-50 dark:bg-[#0d0d0d]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black tracking-[0.12em] uppercase ${
              amountRisked != null ? 'text-orange-700 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Max Risk
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              amountRisked != null
                ? 'bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-500/30'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              AUTO
            </span>
          </div>
          <div className={`text-[24px] font-black font-mono tracking-tight leading-tight mt-1 ${
            amountRisked != null ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {amountRisked != null ? formatCurrency(amountRisked) : '—'}
          </div>
          <div className="text-[10px] text-orange-800/80 dark:text-orange-300/80 font-mono mt-1">
            {amountRisked != null
              ? `$${Number(entryPrice).toFixed(2)} × 100 × ${Number(quantity) || 1}`
              : 'Enter entry & qty'}
          </div>
        </div>

        {/* ── ROI % auto box ── */}
        <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 p-3.5 flex flex-col justify-between ${
          roiPercent == null
            ? 'border-gray-200 dark:border-[#1e1e1e] bg-gray-50 dark:bg-[#0d0d0d]'
            : roiPercent >= 0
            ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30'
            : 'border-red-500/50 bg-red-500/10 dark:bg-red-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black tracking-[0.12em] uppercase ${
              roiPercent == null
                ? 'text-gray-500 dark:text-gray-400'
                : roiPercent >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
            }`}>
              ROI %
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              roiPercent == null
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                : roiPercent >= 0
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30'
            }`}>
              AUTO
            </span>
          </div>
          <div className={`text-[24px] font-black font-mono tracking-tight leading-tight mt-1 ${
            roiPercent == null
              ? 'text-gray-400 dark:text-gray-600'
              : roiPercent >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {roiPercent != null ? `${roiPercent >= 0 ? '+' : ''}${formatPercent(roiPercent)}` : '—'}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono mt-1">
            {roiPercent != null && amountRisked != null
              ? `${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)} ÷ $${amountRisked.toFixed(0)}`
              : 'Calculated on risk'}
          </div>
        </div>
      </div>

      {/* ── OUTCOME ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Result" error={errors.result?.message}>
          <div className="relative">
            <select {...register('result')} className={sel}>
              <option value="win">🟢 Win</option>
              <option value="loss">🔴 Loss</option>
              <option value="breakeven">🟡 Breakeven</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]">▾</div>
          </div>
        </Fld>
        <Fld label="Status" error={errors.status?.message}>
          <div className="relative">
            <select {...register('status')} className={sel}>
              <option value="open">◯ Open</option>
              <option value="closed_tp">✓ Closed T/P</option>
              <option value="closed_sl">✗ Closed S/L</option>
              <option value="closed_manual">≡ Manual Close</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]">▾</div>
          </div>
        </Fld>
        <Fld label="% Risk" badge="auto">
          <div className="relative">
            <input type="number" step="0.01" {...register('percent_risk')}
              placeholder="auto"
              className={`${inp} font-mono pr-8`}
              style={{
                color: Number(watch('percent_risk') ?? 0) > 0 ? '#34d399'
                     : Number(watch('percent_risk') ?? 0) < 0 ? '#f87171'
                     : undefined,
              }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#333]">%</span>
          </div>
          <p className="text-[9px] text-[#2e2e2e] mt-1">net PnL ÷ capital risked</p>
        </Fld>
        <Fld label="Timezone">
          <div className="relative">
            <select {...register('timezone')} className={sel}>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="UTC">UTC</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3a3a3a]">▾</div>
          </div>
        </Fld>
      </div>

      {/* ── CONFLUENCES ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#3a3a3a]">Confluences</span>
          {selectedTags.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedTags.length}
            </span>
          )}
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
        </div>

        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-3 space-y-2.5">
          {/* Selected pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {selectedTags.length === 0 ? (
              <span className="text-[11px] text-[#2e2e2e] italic">Click tags below to add confluences…</span>
            ) : (
              selectedTags.map((tag) => (
                <span key={tag} className="tag-pill-selected text-[11px]">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Available predefined tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.filter((t) => !selectedTags.includes(t.label)).map((t) => (
                <button key={t.id} type="button" onClick={() => addTag(t.label)} className="tag-pill-available text-[11px]">
                  <Plus className="w-2.5 h-2.5" /> {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Custom tag input */}
          <div className="flex gap-2 pt-0.5">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
              placeholder="Type custom confluence and press Enter…"
              className={`${inp} flex-1 text-[12px]`}
            />
            <button type="button" onClick={() => addTag(newTag)}
              className="px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-[11px] font-semibold text-indigo-400 transition-all duration-200 whitespace-nowrap">
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* ── NOTES + SCREENSHOT ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Fld label="Notes">
          <textarea {...register('notes')} placeholder="Trade notes, psychology, observations…" rows={2}
            className={`${inp} resize-none`} />
        </Fld>
        <Fld label="Screenshot URL">
          <textarea {...register('screenshot_url')} placeholder="https://…" rows={2}
            className={`${inp} resize-none font-mono text-[12px]`} />
        </Fld>
      </div>

      {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => router.back()}
          className="flex-1 bg-transparent hover:bg-white/4 border border-[#1e1e1e] rounded-xl py-2.5 text-[13px] font-medium text-[#555] hover:text-[#999] transition-all duration-200">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-[3] relative overflow-hidden rounded-xl py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
            boxShadow: saving ? 'none' : '0 0 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
          <span className="relative z-10">
            {saving ? '⏳ Saving…' : existing ? '✓ Update Trade' : '⚡ Log Trade'}
          </span>
          {!saving && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
          )}
        </button>
      </div>
    </form>
  );
}
