import { Account, Trade, ConfluenceTag, AccountStats, RoutineData, ChartObservation } from './types';
import { isEvaluatedTrade } from './utils';
import { createSupabaseServerClient } from './supabase/server';
import { DEFAULT_ROUTINE_DATA } from './routineData';
import { SupabaseClient } from '@supabase/supabase-js';

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

async function getClient(customClient?: SupabaseClient): Promise<SupabaseClient> {
  if (customClient) return customClient;
  return await createSupabaseServerClient();
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts(client?: SupabaseClient): Promise<Account[]> {
  try {
    const sb = await getClient(client);
    const res = await withTimeout(sb.from('accounts').select('*').order('created_at', { ascending: true }), 3000);
    if (!res.error && res.data) {
      return res.data as Account[];
    }
  } catch (err) {
    console.error('[getAccounts] Error:', err);
  }
  return [];
}

export async function getAccount(id: string, client?: SupabaseClient): Promise<Account | undefined> {
  const accounts = await getAccounts(client);
  return accounts.find((a) => a.id === id);
}

export async function createAccount(
  data: Omit<Account, 'id' | 'created_at'>,
  client?: SupabaseClient
): Promise<Account> {
  const sb = await getClient(client);
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? data.user_id ?? 'local';

  const account: Account = {
    ...data,
    user_id: userId,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  const res = await withTimeout(sb.from('accounts').insert(account).select().single(), 3000);
  if (res.error) {
    console.error('[createAccount] Supabase error:', res.error);
    throw new Error(res.error.message);
  }
  return res.data as Account;
}

export async function updateAccount(
  id: string,
  data: Partial<Account>,
  client?: SupabaseClient
): Promise<Account | null> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('accounts').update(data).eq('id', id).select().single(), 3000);
  if (res.error) {
    console.error('[updateAccount] Supabase error:', res.error);
    return null;
  }
  return res.data as Account;
}

export async function deleteAccount(id: string, client?: SupabaseClient): Promise<boolean> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('accounts').delete().eq('id', id), 3000);
  return !res.error;
}

// ─── Trades ───────────────────────────────────────────────────────────────────

export async function getTrades(accountId?: string, client?: SupabaseClient): Promise<Trade[]> {
  try {
    const sb = await getClient(client);
    let query = sb.from('trades').select('*').order('opened_at', { ascending: false });
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    const res = await withTimeout(query, 3000);
    if (!res.error && res.data) {
      return res.data as Trade[];
    }
  } catch (err) {
    console.error('[getTrades] Error:', err);
  }
  return [];
}

export async function getTrade(id: string, client?: SupabaseClient): Promise<Trade | undefined> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('trades').select('*').eq('id', id).single(), 3000);
  if (!res.error && res.data) return res.data as Trade;
  return undefined;
}

export async function createTrade(
  data: Omit<Trade, 'id' | 'net_pnl' | 'created_at' | 'updated_at'>,
  client?: SupabaseClient
): Promise<Trade> {
  const sb = await getClient(client);
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? data.user_id ?? 'local';

  const trade: Trade = {
    ...data,
    user_id: userId,
    id: crypto.randomUUID(),
    net_pnl: data.gross_pnl - data.commission,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const res = await withTimeout(sb.from('trades').insert(trade).select().single(), 3000);
  if (res.error) {
    console.error('[createTrade] Supabase error:', res.error);
    throw new Error(res.error.message);
  }
  return res.data as Trade;
}

export async function duplicateTrade(id: string, client?: SupabaseClient): Promise<Trade | null> {
  const sb = await getClient(client);
  const original = await getTrade(id, sb);
  if (!original) return null;

  const now = new Date().toISOString();
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = original;

  const copy: Trade = {
    ...rest,
    id: crypto.randomUUID(),
    status: 'open',
    closed_at: undefined,
    created_at: now,
    updated_at: now,
  };

  const res = await withTimeout(sb.from('trades').insert(copy).select().single(), 3000);
  if (res.error) return null;
  return res.data as Trade;
}

export async function updateTrade(
  id: string,
  data: Partial<Trade>,
  client?: SupabaseClient
): Promise<Trade | null> {
  const sb = await getClient(client);
  const payload: Partial<Trade> = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  if (payload.gross_pnl !== undefined || payload.commission !== undefined) {
    const current = await getTrade(id, sb);
    if (current) {
      const gross = payload.gross_pnl !== undefined ? Number(payload.gross_pnl) : current.gross_pnl;
      const comm = payload.commission !== undefined ? Number(payload.commission) : current.commission;
      payload.net_pnl = gross - comm;
    }
  }

  const res = await withTimeout(sb.from('trades').update(payload).eq('id', id).select().single(), 3000);
  if (res.error) return null;
  return res.data as Trade;
}

export async function deleteTrade(id: string, client?: SupabaseClient): Promise<boolean> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('trades').delete().eq('id', id), 3000);
  return !res.error;
}

// ─── Confluence Tags ──────────────────────────────────────────────────────────

export async function getConfluenceTags(client?: SupabaseClient): Promise<ConfluenceTag[]> {
  try {
    const sb = await getClient(client);
    const res = await withTimeout(sb.from('confluence_tags').select('*').order('created_at', { ascending: true }), 3000);
    if (!res.error && res.data) {
      return res.data as ConfluenceTag[];
    }
  } catch (err) {
    console.error('[getConfluenceTags] Error:', err);
  }
  return [];
}

export async function createConfluenceTag(
  data: Omit<ConfluenceTag, 'id'>,
  client?: SupabaseClient
): Promise<ConfluenceTag> {
  const sb = await getClient(client);
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? data.user_id ?? 'local';

  const tag: ConfluenceTag = {
    ...data,
    user_id: userId,
    id: crypto.randomUUID(),
  };

  const res = await withTimeout(sb.from('confluence_tags').insert(tag).select().single(), 3000);
  if (res.error) throw new Error(res.error.message);
  return res.data as ConfluenceTag;
}

export async function updateConfluenceTag(
  id: string,
  data: Partial<ConfluenceTag>,
  client?: SupabaseClient
): Promise<ConfluenceTag | null> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('confluence_tags').update(data).eq('id', id).select().single(), 3000);
  if (res.error) return null;
  return res.data as ConfluenceTag;
}

export async function deleteConfluenceTag(id: string, client?: SupabaseClient): Promise<boolean> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('confluence_tags').delete().eq('id', id), 3000);
  return !res.error;
}

// ─── Computed Stats ───────────────────────────────────────────────────────────

export async function getAccountStats(
  accountId?: string,
  passedAccounts?: Account[],
  passedTrades?: Trade[],
  client?: SupabaseClient
): Promise<AccountStats[]> {
  const accounts = passedAccounts ?? (await getAccounts(client));
  const filteredAccounts = accountId ? accounts.filter((a) => a.id === accountId) : accounts;
  const allTrades = passedTrades ?? (await getTrades(undefined, client));

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
  passedTrades?: Trade[],
  client?: SupabaseClient
): Promise<EquityPoint[]> {
  const accounts = passedAccounts ?? (await getAccounts(client));
  let startBalance = 1000;
  if (accountId) {
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) startBalance = acc.initial_balance || 1000;
  } else {
    const primaryLive = accounts.find((a) => a.account_type === 'live') ?? accounts[0];
    if (primaryLive?.initial_balance) startBalance = primaryLive.initial_balance;
  }

  const allTrades = passedTrades ?? (await getTrades(accountId, client));
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

export async function getRoutine(client?: SupabaseClient): Promise<RoutineData> {
  try {
    const sb = await getClient(client);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return DEFAULT_ROUTINE_DATA;

    const res = await withTimeout(
      sb.from('routine').select('*').eq('user_id', user.id).single(),
      3000
    );
    if (!res.error && res.data) {
      return res.data as RoutineData;
    }
  } catch (err) {
    console.error('[getRoutine] Error:', err);
  }
  return DEFAULT_ROUTINE_DATA;
}

export async function updateRoutine(data: RoutineData, client?: SupabaseClient): Promise<RoutineData> {
  const sb = await getClient(client);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const updated = {
    ...data,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  const res = await withTimeout(sb.from('routine').upsert(updated).select().single(), 3000);
  if (res.error) throw new Error(res.error.message);
  return res.data as RoutineData;
}

// ─── Chart Observations ───────────────────────────────────────────────────────

export async function getObservations(client?: SupabaseClient): Promise<ChartObservation[]> {
  try {
    const sb = await getClient(client);
    const res = await withTimeout(
      sb.from('chart_observations').select('*').order('observed_at', { ascending: false }),
      3000
    );
    if (!res.error && res.data) {
      return res.data as ChartObservation[];
    }
  } catch (err) {
    console.error('[getObservations] Error:', err);
  }
  return [];
}

export async function getObservation(id: string, client?: SupabaseClient): Promise<ChartObservation | undefined> {
  const observations = await getObservations(client);
  return observations.find((o) => o.id === id);
}

export async function createObservation(
  data: Omit<ChartObservation, 'id' | 'created_at' | 'updated_at'>,
  client?: SupabaseClient
): Promise<ChartObservation> {
  const sb = await getClient(client);
  const { data: { user } } = await sb.auth.getUser();
  const userId = user?.id ?? data.user_id ?? 'local';

  const observation: ChartObservation = {
    ...data,
    user_id: userId,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabasePayload = Object.fromEntries(
    Object.entries(observation).filter(([, v]) => v !== null && v !== undefined)
  );

  const res = await withTimeout(
    sb.from('chart_observations').insert(supabasePayload).select().single(),
    3000
  );
  if (res.error) {
    console.error('[createObservation] Supabase error:', res.error);
    throw new Error(res.error.message);
  }
  return res.data as ChartObservation;
}

export async function updateObservation(
  id: string,
  data: Partial<ChartObservation>,
  client?: SupabaseClient
): Promise<ChartObservation | null> {
  const sb = await getClient(client);
  const payload = { ...data, updated_at: new Date().toISOString() };
  const res = await withTimeout(
    sb.from('chart_observations').update(payload).eq('id', id).select().single(),
    3000
  );
  if (res.error) return null;
  return res.data as ChartObservation;
}

export async function deleteObservation(id: string, client?: SupabaseClient): Promise<boolean> {
  const sb = await getClient(client);
  const res = await withTimeout(sb.from('chart_observations').delete().eq('id', id), 3000);
  return !res.error;
}
