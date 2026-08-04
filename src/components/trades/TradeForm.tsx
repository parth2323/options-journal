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
  cn,
} from '@/lib/utils';
import { X, Plus, TrendingUp, ShieldAlert, Zap, Hash, Calculator } from 'lucide-react';

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

/* ─── Shared style atoms (Clean Light & Dark mode dual tokens) ─────────────── */
const inp =
  'w-full rounded-xl px-3 py-2 text-[13px] transition-all duration-200 shadow-xs ' +
  'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ' +
  'dark:bg-[#141419] dark:border-white/10 dark:text-[#e8e8e8] dark:placeholder-[#555555] dark:focus:bg-[#1a1a22] dark:focus:border-indigo-500';

const sel = `${inp} cursor-pointer appearance-none`;

/* Floating label wrapper */
const Fld = ({
  label, error, badge, children, className = '',
}: {
  label: string; error?: string; badge?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`group relative ${className}`}>
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-[#737373] group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
        {label}
      </span>
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          {badge}
        </span>
      )}
    </div>
    {children}
    {error && <p className="text-[9px] text-red-500 dark:text-red-400 mt-1 font-semibold">{error}</p>}
  </div>
);

/* Section divider with label */
const Section = ({ label, icon: Icon }: { label: string; icon?: React.ComponentType<{ className?: string }> }) => (
  <div className="flex items-center gap-2 pt-2 pb-1 border-b border-slate-100 dark:border-white/10 mb-1">
    {Icon && <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
    <span className="text-xs font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">{label}</span>
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

  const formatDatetimeForInput = (dateStr?: string) => {
    if (!dateStr) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    }
    try {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    } catch {
      return dateStr.slice(0, 19);
    }
  };

  const defaults: Partial<TradeFormValues> = existing ? {
    account_id: existing.account_id,
    symbol: existing.symbol,
    contract_label: existing.contract_label,
    instrument_type: existing.instrument_type,
    direction: existing.direction,
    opened_at: formatDatetimeForInput(existing.opened_at),
    closed_at: existing.closed_at ? formatDatetimeForInput(existing.closed_at) : formatDatetimeForInput(),
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
    opened_at: formatDatetimeForInput(),
    closed_at: formatDatetimeForInput(),
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

  // Set current live local time on initial mount for new trades
  useEffect(() => {
    if (!existing) {
      const nowStr = formatDatetimeForInput();
      setValue('opened_at', nowStr);
      setValue('closed_at', nowStr);
    }
  }, [existing, setValue]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* ── LIVE AUTO-CALCULATED PNL & RISK BANNER ───────────────────────── */}
      {(entryPrice && exitPrice) ? (
        <div className={cn(
          'p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 shadow-xs',
          netPnl > 0
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300'
            : netPnl < 0
            ? 'bg-red-50/90 border-red-200 text-red-950 dark:bg-red-950/40 dark:border-red-800/40 dark:text-red-300'
            : 'bg-amber-50/90 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-300',
        )}>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-[#737373]">Live Net PnL Preview</p>
              <p className={cn(
                'text-2xl font-black font-mono tracking-tight',
                netPnl > 0 ? 'text-emerald-600 dark:text-emerald-400'
                : netPnl < 0 ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400',
              )}>
                {formatCurrency(netPnl, true)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#737373] block">Gross PnL</span>
              <span className="font-bold text-slate-900 dark:text-[#e8e8e8]">{formatCurrency(Number(grossPnl) || 0, true)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#737373] block">Comm</span>
              <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(Number(commission) || 0)}</span>
            </div>
            {roiPercent != null && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#737373] block">ROI</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatPercent(roiPercent)}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── TRADE IDENTITY ─────────────────────────────────────────────── */}
      <Section label="Trade Identity" icon={Hash} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Account" error={errors.account_id?.message}>
          <div className="relative">
            <select {...register('account_id')} className={sel}>
              <option value="">Select account…</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="Symbol" error={errors.symbol?.message}>
          <input {...register('symbol')} placeholder="SPY, TSLA, QQQ…" className={`${inp} font-mono uppercase font-bold`} />
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
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
          </div>
        </Fld>
      </div>

      {/* ── TRADE SETUP ────────────────────────────────────────────────── */}
      <Section label="Setup & Time" icon={Zap} />
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
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
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
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="Opened At" error={errors.opened_at?.message}>
          <input type="datetime-local" step="1" {...register('opened_at')} className={inp} />
        </Fld>
        <Fld label="Closed At">
          <input type="datetime-local" step="1" {...register('closed_at')} className={inp} />
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
        <Fld label="Quantity (Contracts)">
          <input type="number" step="1" {...register('quantity')} placeholder="1" className={`${inp} font-mono font-bold`} />
        </Fld>
        <Fld label="Commission ($)">
          <input type="number" step="0.01" {...register('commission')} placeholder="0.00" className={`${inp} font-mono text-red-600 dark:text-red-400`} />
        </Fld>
      </div>

      {/* ── AUTO-CALCULATED CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gross PnL Card */}
        <div className="form-calc-card bg-white border border-slate-200 shadow-xs dark:bg-[#141419] dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="calc-label text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373]">Gross PnL</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">AUTO</span>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight mt-1.5 ${
            Number(grossPnl) > 0 ? 'text-emerald-600 dark:text-emerald-400'
            : Number(grossPnl) < 0 ? 'text-red-600 dark:text-red-400'
            : 'text-slate-400 dark:text-slate-600'
          }`}>
            {formatCurrency(Number(grossPnl) || 0, true)}
          </div>
          <p className="calc-subtext text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">
            {entryPrice && exitPrice ? `($${exitPrice} - $${entryPrice}) × 100 × ${quantity}` : 'Calculated on entry/exit'}
          </p>
        </div>

        {/* Capital Risked Card */}
        <div className="form-calc-card bg-white border border-slate-200 shadow-xs dark:bg-[#141419] dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="calc-label text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373]">Amount Risked</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">AUTO</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-[#e8e8e8] mt-1.5">
            {amountRisked != null ? formatCurrency(amountRisked) : '—'}
          </div>
          <p className="calc-subtext text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">
            {amountRisked != null ? `$${Number(entryPrice).toFixed(2)} × 100 × ${Number(quantity) || 1}` : 'Enter entry & quantity'}
          </p>
        </div>

        {/* ROI % Card */}
        <div className="form-calc-card bg-white border border-slate-200 shadow-xs dark:bg-[#141419] dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="calc-label text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#737373]">ROI %</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">AUTO</span>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight mt-1.5 ${
            roiPercent != null && roiPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400'
            : roiPercent != null ? 'text-red-600 dark:text-red-400'
            : 'text-slate-400 dark:text-slate-600'
          }`}>
            {roiPercent != null ? `${roiPercent >= 0 ? '+' : ''}${formatPercent(roiPercent)}` : '—'}
          </div>
          <p className="calc-subtext text-[10px] text-slate-400 dark:text-[#737373] mt-1 font-mono">
            {roiPercent != null ? `Net PnL ÷ Capital Risked` : 'Calculated on risk'}
          </p>
        </div>
      </div>

      {/* ── OUTCOME & STATUS ───────────────────────────────────────────── */}
      <Section label="Outcome & Status" icon={ShieldAlert} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Fld label="Result" error={errors.result?.message}>
          <div className="relative">
            <select {...register('result')} className={sel}>
              <option value="win">🟢 Win</option>
              <option value="loss">🔴 Loss</option>
              <option value="breakeven">🟡 Breakeven</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
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
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
          </div>
        </Fld>
        <Fld label="% Risk" badge="auto">
          <div className="relative">
            <input type="number" step="0.01" {...register('percent_risk')}
              placeholder="auto"
              className={`${inp} font-mono pr-8`}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-[#737373]">%</span>
          </div>
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
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]">▾</div>
          </div>
        </Fld>
      </div>

      {/* ── CONFLUENCES ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-[#737373]">Confluences</span>
          {selectedTags.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              {selectedTags.length}
            </span>
          )}
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
        </div>

        <div className="drawer-card bg-white border border-slate-200 dark:bg-[#0d0d0d] dark:border-[#1e1e1e] rounded-2xl p-4 space-y-3 shadow-xs">
          {/* Selected pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {selectedTags.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-[#555555] italic">Click tags below to add confluences…</span>
            ) : (
              selectedTags.map((tag) => (
                <span key={tag} className="tag-pill-selected text-xs font-semibold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Available predefined tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
              {tags.filter((t) => !selectedTags.includes(t.label)).map((t) => (
                <button key={t.id} type="button" onClick={() => addTag(t.label)} className="tag-pill-available text-xs">
                  <Plus className="w-3 h-3" /> {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Custom tag input */}
          <div className="flex gap-2 pt-1">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
              placeholder="Type custom confluence and press Enter…"
              className={`${inp} flex-1 text-xs`}
            />
            <button type="button" onClick={() => addTag(newTag)}
              className="px-3.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95">
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* ── NOTES + SCREENSHOT ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Fld label="Notes">
          <textarea {...register('notes')} placeholder="Trade notes, psychology, observations…" rows={3}
            className={`${inp} resize-none`} />
        </Fld>
        <Fld label="Screenshot URL">
          <textarea {...register('screenshot_url')} placeholder="https://…" rows={3}
            className={`${inp} resize-none font-mono text-xs`} />
        </Fld>
      </div>

      {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 bg-white border border-slate-200 shadow-xs hover:bg-slate-100 rounded-xl py-3 text-xs font-bold text-slate-700 hover:text-slate-900 dark:bg-transparent dark:border-[#1e1e1e] dark:text-[#a0a0a0] dark:hover:text-white dark:hover:bg-white/[0.06] transition-all duration-200 active:scale-95 cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-[3] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving Trade…</span>
            </>
          ) : (
            <span>{existing ? 'Update Trade' : 'Save Trade'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
