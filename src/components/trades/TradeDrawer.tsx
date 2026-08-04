'use client';

import { Trade, Account } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  formatCurrency, formatDateTime, formatTradeDuration,
  getResultLabel, getStatusLabel, getDirectionLabel,
  getSessionLabel, getPnlColor, getResultBgColor,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[#1f1f1f] last:border-0">
      <span className="text-[11px] text-[#4a4a4a] uppercase tracking-wide w-28 flex-shrink-0">{label}</span>
      <span className="text-xs text-[#a0a0a0] text-right flex-1">{value}</span>
    </div>
  );
}

export function TradeDrawer({ trade, account, open, onClose }: TradeDrawerProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

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
      <SheetContent className="bg-[#191919] border-l border-[#2a2a2a] text-[#e8e8e8] w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-bold text-[#e8e8e8]">
                {trade.symbol}
                {trade.contract_label && (
                  <span className="ml-2 text-sm font-normal text-[#4a4a4a]">{trade.contract_label}</span>
                )}
              </SheetTitle>
              <p className="text-xs text-[#4a4a4a] mt-0.5">{account?.name ?? 'Unknown account'}</p>
            </div>
            <span className={`pill border text-xs ${getResultBgColor(trade.result)}`}>
              {trade.result === 'win' ? '🟢' : trade.result === 'loss' ? '🔴' : '🟡'} {getResultLabel(trade.result)}
            </span>
          </div>
        </SheetHeader>

        {/* PnL highlight */}
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 mb-4 text-center">
          <p className="text-[11px] text-[#4a4a4a] uppercase tracking-wide mb-1">Net PnL</p>
          <p className={`text-3xl font-bold ${getPnlColor(trade.net_pnl)}`}>
            {formatCurrency(trade.net_pnl, true)}
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-1">
            Gross {formatCurrency(trade.gross_pnl, true)} — Commission {formatCurrency(trade.commission)}
          </p>
        </div>

        {/* Details */}
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 mb-4">
          <Row label="Status" value={getStatusLabel(trade.status)} />
          <Row label="Direction" value={getDirectionLabel(trade.direction)} />
          <Row label="Quantity" value={trade.quantity} />
          <Row label="Session" value={getSessionLabel(trade.session)} />
          <Row label="% Risk" value={trade.percent_risk != null ? `${trade.percent_risk}%` : '—'} />
          <Row label="Opened" value={formatDateTime(trade.opened_at)} />
          <Row label="Closed" value={trade.closed_at ? formatDateTime(trade.closed_at) : '—'} />
          <Row label="Duration" value={formatTradeDuration(trade.opened_at, trade.closed_at)} />
          <Row label="Entry" value={trade.entry_price != null ? `$${trade.entry_price}` : '—'} />
          <Row label="Exit" value={trade.exit_price != null ? `$${trade.exit_price}` : '—'} />
          <Row label="Timezone" value={trade.timezone} />
        </div>

        {/* Confluences */}
        {trade.confluences.length > 0 && (
          <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 mb-4">
            <p className="text-[11px] text-[#4a4a4a] uppercase tracking-wide mb-2">Confluences</p>
            <div className="flex flex-wrap gap-1.5">
              {trade.confluences.map((tag) => (
                <span key={tag} className="tag-pill-selected">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {trade.notes && (
          <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 mb-4">
            <p className="text-[11px] text-[#4a4a4a] uppercase tracking-wide mb-2">Notes</p>
            <p className="text-xs text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
          </div>
        )}

        {/* Screenshot */}
        {trade.screenshot_url && (
          <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 mb-4">
            <p className="text-[11px] text-[#4a4a4a] uppercase tracking-wide mb-2">Screenshot</p>
            <a href={trade.screenshot_url} target="_blank" rel="noopener" className="text-xs text-indigo-400 hover:underline">
              View screenshot →
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { onClose(); router.push(`/trades/${trade.id}/edit`); }}
            className="flex items-center justify-center gap-2 bg-[#202020] hover:bg-[#252525] border border-[#2a2a2a] rounded-lg py-2 text-xs font-medium text-[#a0a0a0] hover:text-[#e8e8e8] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <DuplicateButton tradeId={trade.id} variant="full" onSuccess={onClose} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 rounded-lg py-2 px-4 text-xs font-medium text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
