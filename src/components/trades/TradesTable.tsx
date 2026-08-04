'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trade, Account, Direction, TradeResult } from '@/lib/types';
import {
  formatCurrency,
  formatDateTime,
  formatTradeDuration,
  getDirectionLabel,
  getStatusLabel,
  getSessionLabel,
  cn,
} from '@/lib/utils';
import {
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';
import { TradeDrawer } from './TradeDrawer';

interface TradesTableProps {
  trades: Trade[];
  accounts: Account[];
}

type SortField = 'opened_at' | 'symbol' | 'gross_pnl' | 'commission' | 'net_pnl' | 'percent_risk' | 'result';
type SortOrder = 'asc' | 'desc';

/* ── Result badge ────────────────────────────────────────────────── */
function ResultBadge({ result }: { result: TradeResult }) {
  const styles: Record<TradeResult, string> = {
    win: 'badge-win',
    loss: 'badge-loss',
    breakeven: 'badge-breakeven',
  };
  const labels: Record<TradeResult, string> = { win: 'Win', loss: 'Loss', breakeven: 'B/E' };
  const icons: Record<TradeResult, React.ReactNode> = {
    win: <ArrowUpRight className="w-3 h-3" />,
    loss: <ArrowDownRight className="w-3 h-3" />,
    breakeven: <span className="text-[10px]">−</span>,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[result]}`}
    >
      {icons[result]}
      {labels[result]}
    </span>
  );
}

/* ── Direction badge ─────────────────────────────────────────────── */
function DirectionBadge({ direction }: { direction: Direction | undefined }) {
  const isBull = direction === 'call_long' || direction === 'put_short';
  const color = isBull ? 'badge-bull' : 'badge-bear';
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${color}`}>
      {getDirectionLabel(direction)}
    </span>
  );
}

/* ── Duplicate Button helper ─────────────────────────────────────── */
function DuplicateButton({ tradeId, variant = 'icon' }: { tradeId: string; variant?: 'icon' | 'full' }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/trades/${tradeId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        window.location.reload();
      }
    } catch (err) {
      console.error('Duplicate failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleDuplicate}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 text-xs font-semibold transition-all duration-200 cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{loading ? 'Duplicating…' : copied ? 'Duplicated!' : 'Duplicate'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      title="Duplicate trade"
      className="p-1 rounded transition-all text-[#737373] hover:text-indigo-400 hover:bg-[#1a1a28] cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function TradesTable({ trades, accounts }: TradesTableProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [searchQuery, setSearchQuery]     = useState<string>('');
  const [sortField, setSortField]         = useState<SortField>('opened_at');
  const [sortOrder, setSortOrder]         = useState<SortOrder>('desc');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterResult, setFilterResult]   = useState<string>('all');

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  /* Filter */
  const filtered = trades.filter((t) => {
    if (filterAccount !== 'all' && t.account_id !== filterAccount) return false;
    if (filterResult !== 'all') {
      if (filterResult === 'open' && t.status !== 'open') return false;
      if (filterResult !== 'open' && t.result !== filterResult) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSymbol    = t.symbol.toLowerCase().includes(q);
      const matchContract  = t.contract_label?.toLowerCase().includes(q) ?? false;
      const matchNotes     = t.notes?.toLowerCase().includes(q) ?? false;
      const matchTags      = t.confluences?.some(tag => tag.toLowerCase().includes(q)) ?? false;
      if (!matchSymbol && !matchContract && !matchNotes && !matchTags) return false;
    }
    return true;
  });

  /* Sort */
  const sorted = [...filtered].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'opened_at') {
      valA = new Date(a.opened_at).getTime();
      valB = new Date(b.opened_at).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  /* Totals */
  const totals = sorted.reduce(
    (acc, t) => ({
      gross: acc.gross + (t.gross_pnl || 0),
      commission: acc.commission + (t.commission || 0),
      net: acc.net + (t.net_pnl || 0),
    }),
    { gross: 0, commission: 0, net: 0 }
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-indigo-400 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-400 inline ml-0.5" />
    );
  };

  const getPnlColor = (pnl: number) =>
    pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-amber-400';

  const TH = ({ label, field, className = '' }: { label: string; field?: SortField; className?: string }) => (
    <th
      className={`px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#737373] ${
        field ? 'cursor-pointer hover:text-white select-none' : ''
      } ${className}`}
      onClick={() => field && handleSort(field)}
    >
      {label}
      {field && <SortIcon field={field} />}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0a0a0f] border border-[#1a1a28] shadow-sm">
        
        {/* Search Input & Account Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol, contract, notes, tags…"
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#141419] border border-[#2a2a2a] text-[#e8e8e8] placeholder-[#555] rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Account Filter */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            aria-label="Filter trades by account"
            className="bg-[#141419] border border-[#2a2a2a] text-[#e8e8e8] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Outcome Filter Pills */}
        <div className="tab-filter-bar flex items-center gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'win', label: 'Wins' },
            { id: 'loss', label: 'Losses' },
            { id: 'breakeven', label: 'B/E' },
            { id: 'open', label: 'Open' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterResult(tab.id)}
              className={cn(
                'tab-filter-btn',
                filterResult === tab.id && 'tab-filter-btn-active'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#737373] font-mono font-bold self-end md:self-auto">
          <span className="text-[#e8e8e8]">{sorted.length}</span> / <span className="text-[#e8e8e8]">{trades.length}</span>
        </div>
      </div>

      {/* ── Mobile View: Stack Cards ─────────────── */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 ? (
          <div className="p-8 text-center bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl">
            <p className="text-sm text-[#737373]">No trades found</p>
          </div>
        ) : (
          sorted.map((trade) => (
            <div
              key={trade.id}
              onClick={() => setSelectedTrade(trade)}
              className="p-4 bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl space-y-3 cursor-pointer active:scale-[0.98] transition-all shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base text-[#e8e8e8] font-mono tracking-tight">{trade.symbol}</span>
                  {trade.contract_label && (
                    <span className="text-[11px] text-[#737373] font-mono font-semibold">{trade.contract_label}</span>
                  )}
                  <DirectionBadge direction={trade.direction} />
                  <span className="badge-qty inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-mono font-bold border">
                    {trade.quantity}
                  </span>
                </div>
                <ResultBadge result={trade.result} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f] text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#e8e8e8] font-bold">{formatDateTime(trade.opened_at)}</span>
                  <span className="text-[10px] text-[#737373]">{accountMap.get(trade.account_id)?.name ?? '—'}</span>
                </div>
                <div className="text-right">
                  <span className={`font-black text-base font-mono block ${getPnlColor(trade.net_pnl)}`}>
                    {formatCurrency(trade.net_pnl, true)}
                  </span>
                  {trade.percent_risk != null && (
                    <span className="text-[10px] text-[#737373] block">{trade.percent_risk >= 0 ? '+' : ''}{trade.percent_risk}% Risk</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: Glass Table ──────────────── */}
      <div className="hidden md:block bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#191919]/90 backdrop-blur-md">
              <TH label="Instrument / Side" field="symbol" className="w-[16%]" />
              <TH label="Date & Time" field="opened_at" className="w-[19%]" />
              <TH label="Account / Session" className="w-[12%]" />
              <TH label="Gross PnL" field="gross_pnl" className="w-[11%] text-right" />
              <TH label="Comm" field="commission" className="w-[9%] text-right" />
              <TH label="Net PnL" field="net_pnl" className="w-[12%] text-right" />
              <TH label="% Risk" field="percent_risk" className="w-[7%] text-right" />
              <TH label="Result" field="result" className="w-[10%] text-center" />
              <th className="px-3 py-3 w-[4%]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <p className="text-[#737373] mb-2 text-sm">No matching trades found</p>
                  <Link href="/trades/new" className="text-indigo-400 hover:underline text-xs font-semibold">
                    Add new trade →
                  </Link>
                </td>
              </tr>
            ) : (
              sorted.map((trade) => (
                <tr
                  key={trade.id}
                  onClick={() => setSelectedTrade(trade)}
                  className={cn(
                    'group cursor-pointer transition-all duration-150 hover:bg-[#252525]',
                    trade.result === 'win' && 'trade-row-win',
                    trade.result === 'loss' && 'trade-row-loss',
                    trade.result === 'breakeven' && 'trade-row-breakeven',
                  )}
                >
                  {/* Column 1: Instrument, Side, Contract, Qty */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#e8e8e8]">{trade.symbol}</span>
                      <DirectionBadge direction={trade.direction} />
                      <span className="badge-qty">
                        {trade.quantity}
                      </span>
                    </div>
                    {trade.contract_label && (
                      <p className="text-[11px] text-[#737373] font-mono mt-0.5">{trade.contract_label}</p>
                    )}
                  </td>

                  {/* Column 2: Date, Time & Duration */}
                  <td className="px-3 py-3">
                    <div className="font-mono text-[#e8e8e8] font-bold text-[11px] whitespace-nowrap">
                      {formatDateTime(trade.opened_at)}
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5 flex items-center gap-2">
                      <span>{formatTradeDuration(trade.opened_at, trade.closed_at)}</span>
                      {trade.status && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded badge-account font-medium">
                          {getStatusLabel(trade.status)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: Account & Session */}
                  <td className="px-3 py-3">
                    <div className="font-semibold text-[#e8e8e8]">
                      {accountMap.get(trade.account_id)?.name ?? '—'}
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">
                      {getSessionLabel(trade.session)}
                    </div>
                  </td>

                  {/* Column 4: Gross PnL (Right Aligned) */}
                  <td className={`px-3 py-3 font-mono font-medium text-right whitespace-nowrap ${getPnlColor(trade.gross_pnl)}`}>
                    {formatCurrency(trade.gross_pnl, true)}
                  </td>

                  {/* Column 5: Commission (Right Aligned) */}
                  <td className="px-3 py-3 font-mono text-right text-red-400 whitespace-nowrap">
                    {trade.commission > 0 ? formatCurrency(-trade.commission) : '—'}
                  </td>

                  {/* Column 6: Net PnL (Right Aligned) */}
                  <td className={`px-3 py-3 font-mono font-extrabold text-sm text-right whitespace-nowrap ${getPnlColor(trade.net_pnl)}`}>
                    {formatCurrency(trade.net_pnl, true)}
                  </td>

                  {/* Column 7: % Risk (Right Aligned) */}
                  <td className="px-3 py-3 font-mono text-[11px] text-right text-[#737373] whitespace-nowrap">
                    {trade.percent_risk != null ? `${trade.percent_risk >= 0 ? '+' : ''}${trade.percent_risk}%` : '—'}
                  </td>

                  {/* Column 8: Result (Center Aligned) */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <ResultBadge result={trade.result} />
                  </td>

                  {/* Column 9: Actions */}
                  <td className="px-3 py-3 text-right">
                    <div
                      className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DuplicateButton tradeId={trade.id} variant="icon" />
                      <Link
                        href={`/trades/${trade.id}/edit`}
                        title="Edit trade"
                        className="p-1 rounded transition-all text-[#737373] hover:text-indigo-400 hover:bg-[#1a1a28]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot className="border-t border-[#2a2a2a] bg-[#191919] font-semibold">
              <tr>
                <td colSpan={3} className="px-3 py-3 text-[11px] text-[#737373] uppercase tracking-wider font-extrabold">
                  Totals ({sorted.length} trade{sorted.length !== 1 ? 's' : ''})
                </td>
                <td className={`px-3 py-3 text-xs font-mono font-medium text-right ${getPnlColor(totals.gross)}`}>
                  {formatCurrency(totals.gross, true)}
                </td>
                <td className="px-3 py-3 text-xs font-mono text-right text-red-400">
                  {totals.commission > 0 ? formatCurrency(-totals.commission) : '—'}
                </td>
                <td className={`px-3 py-3 text-sm font-extrabold font-mono text-right ${getPnlColor(totals.net)}`}>
                  {formatCurrency(totals.net, true)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Trade Drawer Detail View */}
      {selectedTrade && (
        <TradeDrawer
          trade={selectedTrade}
          account={accountMap.get(selectedTrade.account_id)}
          open={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}
