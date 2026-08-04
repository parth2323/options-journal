'use client';

import { Trade, Account } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  formatCurrency, formatDateTime, formatTradeDuration,
  getResultLabel, getStatusLabel, getDirectionLabel,
  getSessionLabel, cn,
} from '@/lib/utils';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight, Layers, Clock, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { DuplicateButton } from './DuplicateButton';

interface TradeDrawerProps {
  trade: Trade;
  account?: Account;
  open: boolean;
  onClose: () => void;
}

function StatRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
      <span className="text-[10px] text-slate-500 dark:text-[#737373] uppercase tracking-wider font-bold">{label}</span>
      <span className={cn('text-xs text-slate-900 dark:text-[#e8e8e8] font-semibold', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="drawer-card bg-white border border-slate-200/80 shadow-xs dark:bg-[#18181f] dark:border-white/5 rounded-2xl p-4 mb-3.5">
      <div className="flex items-center gap-1.5 mb-2.5 pb-1.5 border-b border-slate-100 dark:border-white/[0.04]">
        <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-[#737373]">{title}</h4>
      </div>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export function TradeDrawer({ trade, account, open, onClose }: TradeDrawerProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const isWin = trade.result === 'win';
  const isLoss = trade.result === 'loss';

  const handleDelete = async () => {
    if (!confirm('Delete this trade? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await fetch(`/api/trades/${trade.id}`, { method: 'DELETE' });
      toast.success('Trade deleted');
      onClose();
      router.refresh();
    } catch {
      toast.error('Failed to delete trade');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="glass-drawer text-slate-900 dark:text-[#e8e8e8] w-full sm:max-w-md overflow-y-auto p-6 shadow-2xl">
        {/* iOS Grab Handle Pill for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* ── HEADER (pr-14 guarantees close X button separation) ───────── */}
        <SheetHeader className="mb-4 pt-1 pr-14">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {trade.symbol}
                </SheetTitle>
                <span className="badge-qty inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-mono font-bold border bg-indigo-500/10 text-black border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40">
                  {trade.quantity}
                </span>
              </div>
              {trade.contract_label && (
                <p className="text-xs text-slate-500 dark:text-[#737373] font-mono mt-0.5">{trade.contract_label}</p>
              )}
              <p className="text-[11px] text-slate-500 dark:text-[#737373] font-medium mt-1">
                {account?.name ?? 'Unknown account'}
              </p>
            </div>
            <span
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border mt-1 shadow-xs',
                isWin
                  ? 'badge-win bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50'
                  : isLoss
                  ? 'badge-loss bg-red-500/10 text-red-700 border-red-500/30 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50'
                  : 'badge-breakeven bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50',
              )}
              style={{ animation: 'badge-pop 0.25s ease both' }}
            >
              {isWin ? <ArrowUpRight className="w-3.5 h-3.5" /> : isLoss ? <ArrowDownRight className="w-3.5 h-3.5" /> : '—'}
              {getResultLabel(trade.result)}
            </span>
          </div>
        </SheetHeader>

        {/* ── HERO PnL BANNER (Perfectly Centered Label & Amount) ────── */}
        <div
          className={cn(
            'rounded-2xl p-5 mb-4 flex flex-col items-center justify-center text-center relative overflow-hidden border shadow-xs transition-all w-full',
            isWin
              ? 'drawer-hero-win bg-emerald-50/90 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300'
              : isLoss
              ? 'drawer-hero-loss bg-red-50/90 border-red-200/80 text-red-950 dark:bg-red-950/40 dark:border-red-800/40 dark:text-red-300'
              : 'drawer-hero-be bg-amber-50/90 border-amber-200/80 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-300',
          )}
        >
          <div
            className="absolute inset-0 opacity-15 blur-3xl pointer-events-none"
            style={{
              background: isWin ? '#10b981' : isLoss ? '#ef4444' : '#f59e0b',
              transform: 'scale(0.5)',
            }}
          />
          <p className="text-[10px] text-slate-500 dark:text-[#737373] uppercase tracking-widest font-bold mb-1 relative text-center w-full block">
            Net PnL
          </p>
          <p className={cn(
            'text-4xl font-black font-mono relative tracking-tight text-center w-full block',
            isWin ? 'text-emerald-600 dark:text-emerald-400'
            : isLoss ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400',
          )}>
            {formatCurrency(trade.net_pnl, true)}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-[#a0a0a0] font-mono relative font-medium text-center w-full">
            <span>Gross {formatCurrency(trade.gross_pnl, true)}</span>
            <span>·</span>
            <span>Comm -{formatCurrency(trade.commission)}</span>
          </div>
        </div>

        {/* ── SECTION 1: EXECUTION & PRICING ──────────────────────────── */}
        <SectionCard title="Execution & Pricing" icon={DollarSign}>
          <StatRow label="Entry Price" value={trade.entry_price != null ? `$${trade.entry_price}` : '—'} mono />
          <StatRow label="Exit Price" value={trade.exit_price != null ? `$${trade.exit_price}` : '—'} mono />
          <StatRow label="Gross PnL" value={formatCurrency(trade.gross_pnl, true)} mono />
          <StatRow label="Commission" value={trade.commission > 0 ? formatCurrency(-trade.commission) : '—'} mono />
          <StatRow label="% Risk" value={trade.percent_risk != null ? `${trade.percent_risk}%` : '—'} mono />
        </SectionCard>

        {/* ── SECTION 2: SETUP & CONTEXT ──────────────────────────────── */}
        <SectionCard title="Setup & Context" icon={Layers}>
          <StatRow label="Direction" value={getDirectionLabel(trade.direction)} />
          <StatRow label="Status" value={getStatusLabel(trade.status)} />
          <StatRow label="Session" value={getSessionLabel(trade.session)} />
          <StatRow label="Account" value={account?.name ?? '—'} />
        </SectionCard>

        {/* ── SECTION 3: TIME & DURATION ──────────────────────────────── */}
        <SectionCard title="Time & Duration" icon={Clock}>
          <StatRow label="Duration" value={formatTradeDuration(trade.opened_at, trade.closed_at)} />
          <StatRow label="Opened At" value={formatDateTime(trade.opened_at)} mono />
          <StatRow label="Closed At" value={trade.closed_at ? formatDateTime(trade.closed_at) : '—'} mono />
        </SectionCard>

        {/* ── CONFLUENCES ─────────────────────────────────────────────── */}
        {trade.confluences.length > 0 && (
          <div className="drawer-card bg-white border border-slate-200/80 shadow-xs dark:bg-[#18181f] dark:border-white/5 rounded-2xl p-4 mb-3.5">
            <p className="text-[10px] text-slate-500 dark:text-[#737373] uppercase tracking-widest font-bold mb-2.5">Confluences</p>
            <div className="flex flex-wrap gap-1.5">
              {trade.confluences.map((tag) => (
                <span key={tag} className="tag-pill-selected">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTES ───────────────────────────────────────────────────── */}
        {trade.notes && (
          <div className="drawer-card bg-white border border-slate-200/80 shadow-xs dark:bg-[#18181f] dark:border-white/5 rounded-2xl p-4 mb-3.5 border-l-4 border-l-indigo-500">
            <p className="text-[10px] text-slate-500 dark:text-[#737373] uppercase tracking-widest font-bold mb-1.5">Notes</p>
            <p className="text-xs text-slate-700 dark:text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
          </div>
        )}

        {/* ── SCREENSHOT ──────────────────────────────────────────────── */}
        {trade.screenshot_url && (
          <div className="drawer-card bg-white border border-slate-200/80 shadow-xs dark:bg-[#18181f] dark:border-white/5 rounded-2xl p-4 mb-3.5">
            <p className="text-[10px] text-slate-500 dark:text-[#737373] uppercase tracking-widest font-bold mb-1.5">Screenshot</p>
            <a href={trade.screenshot_url} target="_blank" rel="noopener" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View screenshot →
            </a>
          </div>
        )}

        {/* ── ACTION FOOTER BAR ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => { onClose(); router.push(`/trades/${trade.id}/edit`); }}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 shadow-xs hover:bg-slate-100 hover:text-indigo-600 dark:glass dark:text-[#a0a0a0] dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <DuplicateButton tradeId={trade.id} variant="full" onSuccess={onClose} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
