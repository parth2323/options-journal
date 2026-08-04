import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Account, Trade, ConfluenceTag, Database, AccountStats, RoutineData } from './types';
import { isEvaluatedTrade } from './utils';
import { supabase } from './supabase';
import { DEFAULT_ROUTINE_DATA } from './routineData';

const DB_PATH = path.join(process.cwd(), '.data', 'db.json');

const DEFAULT_DB: Database = {
  accounts: [],
  trades: [],
  confluence_tags: [],
  routine: DEFAULT_ROUTINE_DATA,
};

let cachedDb: Database | null = null;
let lastMtime: number = 0;

export function readDb(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return DEFAULT_DB;
    }
    const stat = fs.statSync(DB_PATH);
    if (cachedDb && stat.mtimeMs === lastMtime) {
      return cachedDb;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    cachedDb = JSON.parse(raw) as Database;
    lastMtime = stat.mtimeMs;
    return cachedDb;
  } catch {
    return DEFAULT_DB;
  }
}

export function writeDb(db: Database): void {
  cachedDb = db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  try {
    lastMtime = fs.statSync(DB_PATH).mtimeMs;
  } catch {
    lastMtime = Date.now();
  }
}

function withTimeout<T>(promiseLike: PromiseLike<T>, ms = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    Promise.resolve(promiseLike).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Simple short-lived in-memory cache to prevent duplicate Supabase fetches in the same request
let accountsCache: { data: Account[]; time: number } | null = null;
let tradesCache: { data: Trade[]; time: number } | null = null;
let tagsCache: { data: ConfluenceTag[]; time: number } | null = null;
let routineCache: { data: RoutineData; time: number } | null = null;
const CACHE_TTL = 3000; // 3 seconds

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const now = Date.now();
  if (accountsCache && now - accountsCache.time < CACHE_TTL) {
    return accountsCache.data;
  }
  try {
    const res = await withTimeout(supabase.from('accounts').select('*').order('created_at', { ascending: true }), 2500);
    if (!res.error && res.data) {
      const data = res.data as Account[];
      accountsCache = { data, time: now };
      return data;
    }
  } catch {}
  return readDb().accounts;
}

export async function getAccount(id: string): Promise<Account | undefined> {
  const accounts = await getAccounts();
  return accounts.find((a) => a.id === id);
}

export async function createAccount(data: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
  accountsCache = null;
  const account: Account = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  try {
    const res = await withTimeout(supabase.from('accounts').insert(account).select().single(), 3000);
    if (!res.error && res.data) {
      const inserted = res.data as Account;
      const db = readDb();
      db.accounts.push(inserted);
      writeDb(db);
      return inserted;
    }
  } catch {}
  const db = readDb();
  db.accounts.push(account);
  writeDb(db);
  return account;
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  accountsCache = null;
  try {
    const res = await withTimeout(supabase.from('accounts').update(data).eq('id', id).select().single(), 3000);
    if (!res.error && res.data) {
      const updated = res.data as Account;
      const db = readDb();
      const idx = db.accounts.findIndex((a) => a.id === id);
      if (idx !== -1) db.accounts[idx] = updated;
      writeDb(db);
      return updated;
    }
  } catch {}
  const db = readDb();
  const idx = db.accounts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.accounts[idx] = { ...db.accounts[idx], ...data };
  writeDb(db);
  return db.accounts[idx];
}

export async function deleteAccount(id: string): Promise<boolean> {
  accountsCache = null;
  tradesCache = null;
  try {
    const res = await withTimeout(supabase.from('accounts').delete().eq('id', id), 3000);
    if (!res.error) {
      const db = readDb();
      db.accounts = db.accounts.filter((a) => a.id !== id);
      db.trades = db.trades.filter((t) => t.account_id !== id);
      writeDb(db);
      return true;
    }
  } catch {}
  const db = readDb();
  const before = db.accounts.length;
  db.accounts = db.accounts.filter((a) => a.id !== id);
  db.trades = db.trades.filter((t) => t.account_id !== id);
  writeDb(db);
  return db.accounts.length < before;
}

// ─── Trades ───────────────────────────────────────────────────────────────────

export async function getTrades(accountId?: string): Promise<Trade[]> {
  const now = Date.now();
  let allTrades: Trade[] = [];

  if (tradesCache && now - tradesCache.time < CACHE_TTL) {
    allTrades = tradesCache.data;
  } else {
    try {
      const res = await withTimeout(supabase.from('trades').select('*').order('opened_at', { ascending: false }), 2500);
      if (!res.error && res.data) {
        allTrades = res.data as Trade[];
        tradesCache = { data: allTrades, time: now };
      } else {
        allTrades = readDb().trades;
      }
    } catch {
      allTrades = readDb().trades;
    }
  }

  if (accountId) return allTrades.filter((t) => t.account_id === accountId);
  return allTrades;
}

export async function getTrade(id: string): Promise<Trade | undefined> {
  const trades = await getTrades();
  return trades.find((t) => t.id === id);
}

export async function createTrade(data: Omit<Trade, 'id' | 'net_pnl' | 'created_at' | 'updated_at'>): Promise<Trade> {
  tradesCache = null;
  const trade: Trade = {
    ...data,
    id: crypto.randomUUID(),
    net_pnl: data.gross_pnl - data.commission,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    const res = await withTimeout(supabase.from('trades').insert(trade).select().single(), 3000);
    if (!res.error && res.data) {
      const inserted = res.data as Trade;
      const db = readDb();
      db.trades.push(inserted);
      writeDb(db);
      return inserted;
    }
  } catch {}
  const db = readDb();
  db.trades.push(trade);
  writeDb(db);
  return trade;
}

export async function duplicateTrade(id: string): Promise<Trade | null> {
  const original = await getTrade(id);
  if (!original) return null;

  const now = new Date().toISOString();
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = original;

  const copy: Trade = {
    ...rest,
    id: crypto.randomUUID(),
    // Mark status open so user knows they need to review it
    status: 'open',
    // Clear closed_at — it's a fresh copy
    closed_at: undefined,
    created_at: now,
    updated_at: now,
  };

  tradesCache = null;
  try {
    const res = await withTimeout(supabase.from('trades').insert(copy).select().single(), 3000);
    if (!res.error && res.data) {
      const inserted = res.data as Trade;
      const db = readDb();
      db.trades.push(inserted);
      writeDb(db);
      return inserted;
    }
  } catch {}
  const db = readDb();
  db.trades.push(copy);
  writeDb(db);
  return copy;
}


export async function updateTrade(id: string, data: Partial<Trade>): Promise<Trade | null> {
  tradesCache = null;
  const payload: Partial<Trade> = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  if (payload.gross_pnl !== undefined || payload.commission !== undefined) {
    const current = await getTrade(id);
    if (current) {
      const gross = payload.gross_pnl !== undefined ? Number(payload.gross_pnl) : current.gross_pnl;
      const comm = payload.commission !== undefined ? Number(payload.commission) : current.commission;
      payload.net_pnl = gross - comm;
    }
  }
  try {
    const res = await withTimeout(supabase.from('trades').update(payload).eq('id', id).select().single(), 3000);
    if (!res.error && res.data) {
      const updated = res.data as Trade;
      const db = readDb();
      const idx = db.trades.findIndex((t) => t.id === id);
      if (idx !== -1) db.trades[idx] = updated;
      writeDb(db);
      return updated;
    }
  } catch {}
  const db = readDb();
  const idx = db.trades.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.trades[idx] = { ...db.trades[idx], ...payload };
  writeDb(db);
  return db.trades[idx];
}

export async function deleteTrade(id: string): Promise<boolean> {
  tradesCache = null;
  try {
    const res = await withTimeout(supabase.from('trades').delete().eq('id', id), 3000);
    if (!res.error) {
      const db = readDb();
      db.trades = db.trades.filter((t) => t.id !== id);
      writeDb(db);
      return true;
    }
  } catch {}
  const db = readDb();
  const before = db.trades.length;
  db.trades = db.trades.filter((t) => t.id !== id);
  writeDb(db);
  return db.trades.length < before;
}

// ─── Confluence Tags ──────────────────────────────────────────────────────────

export async function getConfluenceTags(): Promise<ConfluenceTag[]> {
  const now = Date.now();
  if (tagsCache && now - tagsCache.time < CACHE_TTL) {
    return tagsCache.data;
  }
  try {
    const res = await withTimeout(supabase.from('confluence_tags').select('*').order('created_at', { ascending: true }), 2500);
    if (!res.error && res.data) {
      const data = res.data as ConfluenceTag[];
      tagsCache = { data, time: now };
      return data;
    }
  } catch {}
  return readDb().confluence_tags;
}

export async function createConfluenceTag(data: Omit<ConfluenceTag, 'id'>): Promise<ConfluenceTag> {
  tagsCache = null;
  const tag: ConfluenceTag = { ...data, id: crypto.randomUUID() };
  try {
    const res = await withTimeout(supabase.from('confluence_tags').insert(tag).select().single(), 3000);
    if (!res.error && res.data) {
      const inserted = res.data as ConfluenceTag;
      const db = readDb();
      db.confluence_tags.push(inserted);
      writeDb(db);
      return inserted;
    }
  } catch {}
  const db = readDb();
  db.confluence_tags.push(tag);
  writeDb(db);
  return tag;
}

export async function updateConfluenceTag(id: string, data: Partial<ConfluenceTag>): Promise<ConfluenceTag | null> {
  tagsCache = null;
  try {
    const res = await withTimeout(supabase.from('confluence_tags').update(data).eq('id', id).select().single(), 3000);
    if (!res.error && res.data) {
      const updated = res.data as ConfluenceTag;
      const db = readDb();
      const idx = db.confluence_tags.findIndex((t) => t.id === id);
      if (idx !== -1) db.confluence_tags[idx] = updated;
      writeDb(db);
      return updated;
    }
  } catch {}
  const db = readDb();
  const idx = db.confluence_tags.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.confluence_tags[idx] = { ...db.confluence_tags[idx], ...data };
  writeDb(db);
  return db.confluence_tags[idx];
}

export async function deleteConfluenceTag(id: string): Promise<boolean> {
  tagsCache = null;
  try {
    const res = await withTimeout(supabase.from('confluence_tags').delete().eq('id', id), 3000);
    if (!res.error) {
      const db = readDb();
      db.confluence_tags = db.confluence_tags.filter((t) => t.id !== id);
      writeDb(db);
      return true;
    }
  } catch {}
  const db = readDb();
  const before = db.confluence_tags.length;
  db.confluence_tags = db.confluence_tags.filter((t) => t.id !== id);
  writeDb(db);
  return db.confluence_tags.length < before;
}

// ─── Computed Stats ───────────────────────────────────────────────────────────

export async function getAccountStats(
  accountId?: string,
  passedAccounts?: Account[],
  passedTrades?: Trade[]
): Promise<AccountStats[]> {
  const accounts = passedAccounts ?? (await getAccounts());
  const filteredAccounts = accountId ? accounts.filter((a) => a.id === accountId) : accounts;
  const allTrades = passedTrades ?? (await getTrades());

  return filteredAccounts.map((account) => {
    const trades = allTrades.filter((t) => t.account_id === account.id && isEvaluatedTrade(t));
    const total_net_pnl = trades.reduce((sum, t) => sum + (t.net_pnl || 0), 0);
    const total_wins = trades.filter((t) => t.net_pnl > 0 || t.result === 'win').length;
    const total_trades = trades.length;
    const win_rate = total_trades === 0 ? 0 : Math.round((total_wins / total_trades) * 10000) / 100;

    return {
      account_id: account.id,
      name: account.name,
      account_type: account.account_type,
      initial_balance: account.initial_balance,
      goal: account.goal,
      current_balance: Math.round((account.initial_balance + total_net_pnl) * 100) / 100,
      total_net_pnl: Math.round(total_net_pnl * 100) / 100,
      total_trades,
      total_wins,
      win_rate,
    };
  });
}

// ─── Equity Curve ─────────────────────────────────────────────────────────────

export interface EquityPoint {
  date: string;
  cumulative_pnl: number;
  balance: number;
  pct_return: number;
  trade_count: number;
  symbol?: string;
  pnl?: number;
}

export async function getEquityCurve(
  accountId?: string,
  passedAccounts?: Account[],
  passedTrades?: Trade[]
): Promise<EquityPoint[]> {
  const accounts = passedAccounts ?? (await getAccounts());
  let startBalance = 1000;
  if (accountId) {
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) startBalance = acc.initial_balance || 1000;
  } else {
    // Use primary live account's initial balance (never sum across accounts)
    const primaryLive = accounts.find((a) => a.account_type === 'live') ?? accounts[0];
    if (primaryLive?.initial_balance) startBalance = primaryLive.initial_balance;
  }

  const allTrades = passedTrades ?? (await getTrades(accountId));
  const trades = (accountId ? allTrades.filter((t) => t.account_id === accountId) : allTrades)
    .filter(isEvaluatedTrade)
    .sort((a, b) => new Date(a.closed_at ?? a.opened_at).getTime() - new Date(b.closed_at ?? b.opened_at).getTime());

  let cumulative = 0;
  const startDate = trades[0]
    ? (trades[0].opened_at ? trades[0].opened_at.split('T')[0] : 'Start')
    : new Date().toISOString().split('T')[0];

  const initialPoint: EquityPoint = {
    date: startDate,
    cumulative_pnl: 0,
    balance: startBalance,
    pct_return: 0,
    trade_count: 0,
  };

  const points = trades.map((t, i) => {
    cumulative += t.net_pnl;
    const balance = Math.round((startBalance + cumulative) * 100) / 100;
    const pct_return = startBalance > 0 ? Math.round(((balance - startBalance) / startBalance) * 10000) / 100 : 0;
    return {
      date: (t.closed_at ?? t.opened_at).split('T')[0],
      cumulative_pnl: Math.round(cumulative * 100) / 100,
      balance,
      pct_return,
      trade_count: i + 1,
      symbol: t.symbol,
      pnl: t.net_pnl,
    };
  });

  return [initialPoint, ...points];
}

// ─── Routine Data Persistence ──────────────────────────────────────────────────

export async function getRoutine(): Promise<RoutineData> {
  const now = Date.now();
  if (routineCache && now - routineCache.time < CACHE_TTL) {
    return routineCache.data;
  }
  try {
    const res = await withTimeout(supabase.from('routine').select('*').eq('id', 'spy-a-session-routine').single(), 2500);
    if (!res.error && res.data) {
      const data = res.data as RoutineData;
      routineCache = { data, time: now };
      return data;
    }
  } catch {}

  const db = readDb();
  if ((db as any).routine) {
    routineCache = { data: (db as any).routine, time: now };
    return (db as any).routine;
  }

  return DEFAULT_ROUTINE_DATA;
}

export async function updateRoutine(data: RoutineData): Promise<RoutineData> {
  routineCache = null;
  const updated: RoutineData = { ...data, updated_at: new Date().toISOString() };
  try {
    const res = await withTimeout(supabase.from('routine').upsert(updated).select().single(), 3000);
    if (!res.error && res.data) {
      const saved = res.data as RoutineData;
      const db = readDb();
      (db as any).routine = saved;
      writeDb(db);
      return saved;
    }
  } catch {}

  const db = readDb();
  (db as any).routine = updated;
  writeDb(db);
  return updated;
}

