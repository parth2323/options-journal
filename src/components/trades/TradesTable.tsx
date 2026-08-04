'use client';

import { Trade, Account, TradeResult, TradeStatus } from '@/lib/types';
import {
  formatCurrency, formatDateTime, formatTradeDuration,
  getResultLabel, getStatusLabel, getDirectionLabel,
  getSessionLabel, getPnlColor, cn,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, Pencil } from 'lucide-react';
import { TradeDrawer } from './TradeDrawer';
import { DuplicateButton } from './DuplicateButton';
import Link from 'next/link';

interface TradesTableProps {
  trades: Trade[];
  accounts: Account[];
}

type SortField = keyof Trade | '';
type SortDir = 'asc' | 'desc';

function ResultPill({ result }: { result: TradeResult }) {
  const colors = {
    win: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50',
    loss: 'bg-red-950/60 text-red-400 border-red-900/50',
    breakeven: 'bg-yellow-950/60 text-yellow-400 border-yellow-900/50',
  };
  return (
    <span className={`pill border ${colors[result]}`}>
      {result === 'win' ? '🟢' : result === 'loss' ? '🔴' : '🟡'} {getResultLabel(result)}
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-[#3a3a3a]" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-indigo-400" />
    : <ChevronDown className="w-3 h-3 text-indigo-400" />;
}

export function TradesTable({ trades, accounts }: TradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('opened_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Filters
  const [filterAccount, setFilterAccount] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('');

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filterAccount && t.account_id !== filterAccount) return false;
      if (filterResult && t.result !== filterResult) return false;
      if (filterSession && t.session !== filterSession) return false;
      if (filterSymbol && !t.symbol.toLowerCase().includes(filterSymbol.toLowerCase())) return false;
      return true;
    });
  }, [trades, filterAccount, filterResult, filterSession, filterSymbol]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      const dir = sortDir === 'asc' ? 1 : -1;
      if (typeof av === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // Footer sums
  const totals = useMemo(() => ({
    gross: sorted.reduce((s, t) => s + t.gross_pnl, 0),
    commission: sorted.reduce((s, t) => s + t.commission, 0),
    net: sorted.reduce((s, t) => s + t.net_pnl, 0),
  }), [sorted]);

  const TH = ({ label, field, className = '' }: { label: string; field?: SortField; className?: string }) => (
    <th
      className={`px-3 py-2.5 text-left text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-[#737373] select-none' : ''} ${className}`}
      onClick={() => field && handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {field && <SortIcon field={field} sortField={sortField} sortDir={sortDir} />}
      </span>
    </th>
  );

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Symbol..."
          value={filterSymbol}
          onChange={(e) => setFilterSymbol(e.target.value)}
          className="text-xs bg-[#202020] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#a0a0a0] placeholder-[#3a3a3a] focus:outline-none focus:border-indigo-600 w-28"
        />
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="text-xs bg-[#202020] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#a0a0a0] focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="text-xs bg-[#202020] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#a0a0a0] focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Results</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>
        <select
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          className="text-xs bg-[#202020] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#a0a0a0] focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Sessions</option>
          <option value="new_york">New York</option>
          <option value="london">London</option>
          <option value="asia">Asia</option>
          <option value="sydney">Sydney</option>
        </select>
        <span className="ml-auto text-xs text-[#4a4a4a] flex items-center">
          {sorted.length} trade{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#2a2a2a] bg-[#191919]">
              <tr>
                <TH label="Symbol" field="symbol" />
                <TH label="Account" />
                <TH label="Open" field="opened_at" />
                <TH label="Close" field="closed_at" />
                <TH label="Duration" />
                <TH label="Qty" field="quantity" />
                <TH label="Direction" field="direction" />
                <TH label="Status" field="status" />
                <TH label="Session" field="session" />
                <TH label="Gross PnL" field="gross_pnl" />
                <TH label="Commission" field="commission" />
                <TH label="Net PnL" field="net_pnl" />
                <TH label="% Risk" field="percent_risk" />
                <TH label="Tags" />
                <TH label="Result" field="result" />
                <th className="px-3 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center text-[#3a3a3a]">
                    No trades found. <Link href="/trades/new" className="text-indigo-400 hover:underline">Add your first trade →</Link>
                  </td>
                </tr>
              ) : (
                sorted.map((trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className={cn(
                      'group cursor-pointer transition-colors duration-100 hover:bg-[#252525]',
                      trade.result === 'win' && 'trade-row-win',
                      trade.result === 'loss' && 'trade-row-loss',
                      trade.result === 'breakeven' && 'trade-row-breakeven',
                    )}
                  >
                    <td className="px-3 py-2.5 font-semibold text-[#e8e8e8] whitespace-nowrap">
                      <div>{trade.symbol}</div>
                      {trade.contract_label && (
                        <div className="text-[10px] text-[#4a4a4a]">{trade.contract_label}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {accountMap.get(trade.account_id)?.name ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {formatDateTime(trade.opened_at)}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {trade.closed_at ? formatDateTime(trade.closed_at) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {formatTradeDuration(trade.opened_at, trade.closed_at)}
                    </td>
                    <td className="px-3 py-2.5 text-[#a0a0a0]">{trade.quantity}</td>
                    <td className="px-3 py-2.5 text-[#a0a0a0] whitespace-nowrap">
                      {getDirectionLabel(trade.direction)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[#737373]">{getStatusLabel(trade.status)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {getSessionLabel(trade.session)}
                    </td>
                    <td className={`px-3 py-2.5 font-medium whitespace-nowrap ${getPnlColor(trade.gross_pnl)}`}>
                      {formatCurrency(trade.gross_pnl, true)}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373] whitespace-nowrap">
                      {trade.commission > 0 ? formatCurrency(-trade.commission) : '—'}
                    </td>
                    <td className={`px-3 py-2.5 font-semibold whitespace-nowrap ${getPnlColor(trade.net_pnl)}`}>
                      {formatCurrency(trade.net_pnl, true)}
                    </td>
                    <td className="px-3 py-2.5 text-[#737373]">
                      {trade.percent_risk != null ? `${trade.percent_risk}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {trade.confluences.slice(0, 2).map((tag) => (
                          <span key={tag} className="tag-pill-available !py-0.5 !px-2 !text-[10px]">
                            {tag}
                          </span>
                        ))}
                        {trade.confluences.length > 2 && (
                          <span className="tag-pill-available !py-0.5 !px-2 !text-[10px] opacity-75">
                            +{trade.confluences.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <ResultPill result={trade.result} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <DuplicateButton tradeId={trade.id} variant="icon" />
                        <Link
                          href={`/trades/${trade.id}/edit`}
                          title="Edit trade"
                          className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100
                            text-[#3a3a3a] hover:text-indigo-400 hover:bg-indigo-950/30"
                        >
                          <Pencil className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Footer sums */}
            {sorted.length > 0 && (
              <tfoot className="border-t border-[#2a2a2a] bg-[#191919]">
                <tr>
                  <td colSpan={9} className="px-3 py-2 text-[10px] text-[#4a4a4a] font-semibold uppercase tracking-wide">
                    Totals ({sorted.length} trades)
                  </td>
                  <td className={`px-3 py-2 text-xs font-semibold ${getPnlColor(totals.gross)}`}>
                    {formatCurrency(totals.gross, true)}
                  </td>
                  <td className="px-3 py-2 text-xs text-red-400">
                    {totals.commission > 0 ? formatCurrency(-totals.commission) : '—'}
                  </td>
                  <td className={`px-3 py-2 text-xs font-bold ${getPnlColor(totals.net)}`}>
                    {formatCurrency(totals.net, true)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {selectedTrade && (
        <TradeDrawer
          trade={selectedTrade}
          account={accountMap.get(selectedTrade.account_id)}
          open={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}
