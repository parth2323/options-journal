import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceStrict } from "date-fns"
import { TradeResult, TradeStatus, Direction, Session } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
  if (showSign && value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

export function formatPercent(value: number, showSign = false): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`
  if (showSign && value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a')
  } catch {
    return dateStr
  }
}

export function formatTradeDuration(opened: string, closed?: string): string {
  if (!closed) return '—'
  try {
    return formatDistanceStrict(new Date(opened), new Date(closed))
  } catch {
    return '—'
  }
}

export function getResultColor(result: TradeResult): string {
  switch (result) {
    case 'win': return 'text-emerald-400'
    case 'loss': return 'text-red-400'
    case 'breakeven': return 'text-yellow-400'
  }
}

export function getResultBgColor(result: TradeResult): string {
  switch (result) {
    case 'win': return 'bg-emerald-950/40 border-emerald-900/40'
    case 'loss': return 'bg-red-950/40 border-red-900/40'
    case 'breakeven': return 'bg-yellow-950/40 border-yellow-900/40'
  }
}

export function getPnlColor(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-yellow-400'
}

export function getResultLabel(result: TradeResult): string {
  switch (result) {
    case 'win': return 'Win'
    case 'loss': return 'Loss'
    case 'breakeven': return 'Breakeven'
  }
}

export function getStatusLabel(status: TradeStatus): string {
  switch (status) {
    case 'open': return 'Open'
    case 'closed_tp': return 'Closed T/P'
    case 'closed_sl': return 'Closed S/L'
    case 'closed_manual': return 'Manual'
  }
}

export function getDirectionLabel(direction?: Direction): string {
  if (!direction) return '—'
  switch (direction) {
    case 'call_long': return 'Call Long'
    case 'call_short': return 'Call Short'
    case 'put_long': return 'Put Long'
    case 'put_short': return 'Put Short'
  }
}

export function getSessionLabel(session?: Session): string {
  if (!session) return '—'
  switch (session) {
    case 'new_york': return 'New York'
    case 'london': return 'London'
    case 'asia': return 'Asia'
    case 'sydney': return 'Sydney'
  }
}

export function suggestResult(netPnl: number): TradeResult {
  if (netPnl > 0.005) return 'win';
  if (netPnl < -0.005) return 'loss';
  return 'breakeven';
}

export function isEvaluatedTrade(t: {
  status?: string;
  net_pnl?: number;
  entry_price?: number;
  exit_price?: number;
  closed_at?: string;
}): boolean {
  if (t.status && t.status !== 'open') return true;
  if (t.net_pnl !== undefined && t.net_pnl !== 0) return true;
  if (t.entry_price != null && t.exit_price != null) return true;
  if (t.closed_at != null && t.closed_at !== '') return true;
  return false;
}


export function calculateGrossPnl({
  entryPrice,
  exitPrice,
  quantity = 1,
  direction,
  instrumentType = 'options',
}: {
  entryPrice?: number | null;
  exitPrice?: number | null;
  quantity?: number | null;
  direction?: string | null;
  instrumentType?: string | null;
}): number | null {
  if (
    entryPrice == null ||
    exitPrice == null ||
    isNaN(Number(entryPrice)) ||
    isNaN(Number(exitPrice))
  ) {
    return null;
  }
  const numEntry = Number(entryPrice);
  const numExit = Number(exitPrice);
  const numQty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;
  const inst = instrumentType || 'options';
  const multiplier = inst === 'stock' || inst === 'crypto' ? 1 : 100;

  const isShort = direction === 'call_short' || direction === 'put_short';
  const diff = isShort ? (numEntry - numExit) : (numExit - numEntry);

  return Math.round(diff * multiplier * numQty * 100) / 100;
}

/**
 * % Risk (return on capital risked) = net_pnl / amount_invested × 100
 *
 * Example: bought 1 SPY contract at $3.00, sold at $3.30, qty=1
 *   amount_invested = $3.00 × 100 × 1 = $300
 *   net_pnl        = ($3.30 − $3.00) × 100 × 1 − commission = $30
 *   % risk         = $30 / $300 × 100 = +10%
 *
 * Returns positive for profits, negative for losses.
 */
export function calculatePercentRisk({
  entryPrice,
  exitPrice,
  quantity = 1,
  commission = 0,
  direction,
  instrumentType = 'options',
}: {
  entryPrice?: number | null;
  exitPrice?: number | null;
  quantity?: number | null;
  commission?: number | null;
  direction?: string | null;
  instrumentType?: string | null;
}): number | null {
  if (
    entryPrice == null || exitPrice == null ||
    isNaN(Number(entryPrice)) || isNaN(Number(exitPrice)) ||
    Number(entryPrice) <= 0
  ) return null;

  const numEntry = Number(entryPrice);
  const numExit  = Number(exitPrice);
  const numQty   = quantity && Number(quantity) > 0 ? Number(quantity) : 1;
  const numComm  = commission ? Number(commission) : 0;
  const inst     = instrumentType || 'options';
  const multiplier = inst === 'stock' || inst === 'crypto' ? 1 : 100;

  // Capital put at risk (maximum possible loss for a long option = full premium paid)
  const amountInvested = numEntry * multiplier * numQty;
  if (amountInvested <= 0) return null;

  // Signed gross profit/loss
  const isShort  = direction === 'call_short' || direction === 'put_short';
  const grossPnl = isShort
    ? (numEntry - numExit) * multiplier * numQty
    : (numExit - numEntry) * multiplier * numQty;

  const netPnl = grossPnl - numComm;

  // Return on capital risked (signed: + = profit, − = loss)
  return Math.round((netPnl / amountInvested) * 10000) / 100;
}
/**
 * Amount Risked = entry_price × multiplier × quantity
 * For options: multiplier = 100 (one contract = 100 shares)
 * This is the maximum capital at risk for a long option buyer.
 */
export function calculateAmountRisked({
  entryPrice,
  quantity = 1,
  instrumentType = 'options',
}: {
  entryPrice?: number | null;
  quantity?: number | null;
  instrumentType?: string | null;
}): number | null {
  if (entryPrice == null || isNaN(Number(entryPrice)) || Number(entryPrice) <= 0) return null;
  const numEntry = Number(entryPrice);
  const numQty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;
  const inst = instrumentType || 'options';
  const multiplier = inst === 'stock' || inst === 'crypto' ? 1 : 100;
  return Math.round(numEntry * multiplier * numQty * 100) / 100;
}

/**
 * ROI % = net_pnl / amount_risked × 100
 * Represents the percentage return on the capital put at risk.
 */
export function calculateRoiPercent({
  netPnl,
  amountRisked,
}: {
  netPnl?: number | null;
  amountRisked?: number | null;
}): number | null {
  if (netPnl == null || amountRisked == null || amountRisked <= 0) return null;
  return Math.round((Number(netPnl) / Number(amountRisked)) * 10000) / 100;
}
