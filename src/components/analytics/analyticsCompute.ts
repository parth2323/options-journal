import { Trade } from '@/lib/types';
import { isEvaluatedTrade } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayOfWeekStat {
  day: string;       // 'Mon', 'Tue', ...
  avgPnl: number;
  winRate: number;
  trades: number;
  totalPnl: number;
}

export interface SessionStat {
  session: string;
  avgPnl: number;
  winRate: number;
  trades: number;
  totalPnl: number;
}

export interface HeatmapCell {
  day: number;       // 0=Sun … 6=Sat
  hour: number;      // 0–23
  avgPnl: number;
  trades: number;
}

export interface HoldTimeBucket {
  label: string;
  wins: number;
  losses: number;
}

export interface StreakData {
  currentStreak: number;
  currentType: 'win' | 'loss' | 'none';
  longestWinStreak: number;
  longestLossStreak: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgPnl: number;
}

export interface CommissionData {
  totalCommission: number;
  totalGrossPnl: number;
  commissionAsPctOfGross: number;
  avgCommissionPerTrade: number;
  mostExpensiveDay: string;
  weeklyCommission: { week: string; amount: number }[];
}

export interface AnalyticsData {
  dayOfWeek: DayOfWeekStat[];
  sessions: SessionStat[];
  heatmap: HeatmapCell[];
  holdTime: HoldTimeBucket[];
  streaks: StreakData;
  symbols: SymbolStat[];
  commission: CommissionData;
}

// ─── Day labels ───────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SESSION_LABELS: Record<string, string> = {
  new_york: 'New York',
  london: 'London',
  asia: 'Asia',
  sydney: 'Sydney',
};

// ─── Main compute function ────────────────────────────────────────────────────
export function computeAnalytics(trades: Trade[]): AnalyticsData {
  const closed = trades.filter(isEvaluatedTrade);

  // ── Day of Week ──────────────────────────────────────────────────────────
  const dowMap = new Map<number, { pnls: number[]; wins: number }>();
  for (const t of closed) {
    const date = new Date(t.closed_at || t.opened_at);
    const dow = date.getDay(); // 0=Sun
    if (!dowMap.has(dow)) dowMap.set(dow, { pnls: [], wins: 0 });
    const entry = dowMap.get(dow)!;
    entry.pnls.push(t.net_pnl);
    if (t.net_pnl > 0) entry.wins++;
  }
  const dayOfWeek: DayOfWeekStat[] = [1, 2, 3, 4, 5].map((d) => {
    const entry = dowMap.get(d) || { pnls: [], wins: 0 };
    const total = entry.pnls.reduce((s, x) => s + x, 0);
    return {
      day: DAY_LABELS[d],
      avgPnl: entry.pnls.length ? total / entry.pnls.length : 0,
      winRate: entry.pnls.length ? (entry.wins / entry.pnls.length) * 100 : 0,
      trades: entry.pnls.length,
      totalPnl: total,
    };
  });

  // ── Sessions ────────────────────────────────────────────────────────────
  const sessionMap = new Map<string, { pnls: number[]; wins: number }>();
  for (const t of closed) {
    const s = t.session || 'unknown';
    if (!sessionMap.has(s)) sessionMap.set(s, { pnls: [], wins: 0 });
    const entry = sessionMap.get(s)!;
    entry.pnls.push(t.net_pnl);
    if (t.net_pnl > 0) entry.wins++;
  }
  const sessions: SessionStat[] = Array.from(sessionMap.entries()).map(([key, entry]) => {
    const total = entry.pnls.reduce((s, x) => s + x, 0);
    return {
      session: SESSION_LABELS[key] || key,
      avgPnl: entry.pnls.length ? total / entry.pnls.length : 0,
      winRate: entry.pnls.length ? (entry.wins / entry.pnls.length) * 100 : 0,
      trades: entry.pnls.length,
      totalPnl: total,
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Heatmap (day × hour) ─────────────────────────────────────────────────
  const heatmapMap = new Map<string, { pnls: number[] }>();
  for (const t of closed) {
    const date = new Date(t.closed_at || t.opened_at);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}:${hour}`;
    if (!heatmapMap.has(key)) heatmapMap.set(key, { pnls: [] });
    heatmapMap.get(key)!.pnls.push(t.net_pnl);
  }
  const heatmap: HeatmapCell[] = Array.from(heatmapMap.entries()).map(([key, { pnls }]) => {
    const [day, hour] = key.split(':').map(Number);
    return {
      day,
      hour,
      avgPnl: pnls.reduce((s, x) => s + x, 0) / pnls.length,
      trades: pnls.length,
    };
  });

  // ── Hold Time Histogram ──────────────────────────────────────────────────
  const buckets = [
    { label: '< 5m', minMs: 0, maxMs: 5 * 60_000 },
    { label: '5–15m', minMs: 5 * 60_000, maxMs: 15 * 60_000 },
    { label: '15–30m', minMs: 15 * 60_000, maxMs: 30 * 60_000 },
    { label: '30m–1h', minMs: 30 * 60_000, maxMs: 60 * 60_000 },
    { label: '1–3h', minMs: 60 * 60_000, maxMs: 3 * 60 * 60_000 },
    { label: '3h–1d', minMs: 3 * 60 * 60_000, maxMs: 24 * 60 * 60_000 },
    { label: '> 1d', minMs: 24 * 60 * 60_000, maxMs: Infinity },
  ];
  const holdTime: HoldTimeBucket[] = buckets.map((b) => ({ label: b.label, wins: 0, losses: 0 }));
  for (const t of closed) {
    if (!t.opened_at || !t.closed_at) continue;
    const ms = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
    const idx = buckets.findIndex((b) => ms >= b.minMs && ms < b.maxMs);
    if (idx >= 0) {
      if (t.net_pnl >= 0) holdTime[idx].wins++;
      else holdTime[idx].losses++;
    }
  }

  // ── Streaks ──────────────────────────────────────────────────────────────
  const sortedByTime = [...closed].sort(
    (a, b) => new Date(a.closed_at || a.opened_at).getTime() - new Date(b.closed_at || b.opened_at).getTime()
  );
  let curStreak = 0;
  let curType: 'win' | 'loss' | 'none' = 'none';
  let longestWin = 0;
  let longestLoss = 0;
  let tempStreak = 0;
  let tempType: 'win' | 'loss' | 'none' = 'none';
  const wins = closed.filter((t) => t.net_pnl > 0).length;

  for (const t of sortedByTime) {
    const thisType: 'win' | 'loss' = t.net_pnl >= 0 ? 'win' : 'loss';
    if (thisType === tempType) {
      tempStreak++;
    } else {
      tempStreak = 1;
      tempType = thisType;
    }
    if (thisType === 'win' && tempStreak > longestWin) longestWin = tempStreak;
    if (thisType === 'loss' && tempStreak > longestLoss) longestLoss = tempStreak;
  }
  // Current streak from the end
  if (sortedByTime.length > 0) {
    const lastType: 'win' | 'loss' = sortedByTime[sortedByTime.length - 1].net_pnl >= 0 ? 'win' : 'loss';
    let count = 0;
    for (let i = sortedByTime.length - 1; i >= 0; i--) {
      const t: 'win' | 'loss' = sortedByTime[i].net_pnl >= 0 ? 'win' : 'loss';
      if (t === lastType) count++;
      else break;
    }
    curStreak = count;
    curType = lastType;
  }
  const streaks: StreakData = {
    currentStreak: curStreak,
    currentType: curType,
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss,
    totalWins: wins,
    totalLosses: closed.length - wins,
    winRate: closed.length > 0 ? (wins / closed.length) * 100 : 0,
  };

  // ── Symbol Breakdown ─────────────────────────────────────────────────────
  const symMap = new Map<string, { pnls: number[]; wins: number; grossWins: number; grossLosses: number }>();
  for (const t of closed) {
    const sym = t.symbol.toUpperCase();
    if (!symMap.has(sym)) symMap.set(sym, { pnls: [], wins: 0, grossWins: 0, grossLosses: 0 });
    const entry = symMap.get(sym)!;
    entry.pnls.push(t.net_pnl);
    if (t.net_pnl > 0) { entry.wins++; entry.grossWins += t.net_pnl; }
    else entry.grossLosses += Math.abs(t.net_pnl);
  }
  const symbols: SymbolStat[] = Array.from(symMap.entries())
    .map(([symbol, entry]) => {
      const total = entry.pnls.reduce((s, x) => s + x, 0);
      return {
        symbol,
        trades: entry.pnls.length,
        totalPnl: total,
        winRate: entry.pnls.length ? (entry.wins / entry.pnls.length) * 100 : 0,
        profitFactor: entry.grossLosses > 0 ? entry.grossWins / entry.grossLosses : entry.grossWins > 0 ? 99 : 0,
        avgPnl: entry.pnls.length ? total / entry.pnls.length : 0,
      };
    })
    .sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Commission ───────────────────────────────────────────────────────────
  const totalCommission = closed.reduce((s, t) => s + (t.commission || 0), 0);
  const totalGrossPnl = closed.reduce((s, t) => s + (t.gross_pnl || 0), 0);

  // Weekly commission
  const weeklyMap = new Map<string, number>();
  for (const t of closed) {
    const d = new Date(t.closed_at || t.opened_at);
    // ISO week key: YYYY-Www
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + (t.commission || 0));
  }
  const weeklyCommission = Array.from(weeklyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([week, amount]) => ({ week, amount }));

  // Most expensive day of week
  const dowCommMap = new Map<number, number>();
  for (const t of closed) {
    const d = new Date(t.closed_at || t.opened_at).getDay();
    dowCommMap.set(d, (dowCommMap.get(d) || 0) + (t.commission || 0));
  }
  let maxCommDay = -1; let maxCommAmt = 0;
  dowCommMap.forEach((amt, d) => { if (amt > maxCommAmt) { maxCommAmt = amt; maxCommDay = d; } });
  const mostExpensiveDay = maxCommDay >= 0 ? DAY_LABELS[maxCommDay] : '—';

  const commission: CommissionData = {
    totalCommission,
    totalGrossPnl,
    commissionAsPctOfGross: totalGrossPnl > 0 ? (totalCommission / totalGrossPnl) * 100 : 0,
    avgCommissionPerTrade: closed.length > 0 ? totalCommission / closed.length : 0,
    mostExpensiveDay,
    weeklyCommission,
  };

  return { dayOfWeek, sessions, heatmap, holdTime, streaks, symbols, commission };
}
