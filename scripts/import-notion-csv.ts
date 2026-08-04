#!/usr/bin/env tsx
/**
 * Import script for Notion CSV exports → local db.json
 *
 * Usage:
 *   npx tsx scripts/import-notion-csv.ts
 *
 * It reads from:
 *   "2025 Trading Journal/Accounts *.csv"
 *   "2025 Trading Journal/Trade Journal *.csv"
 *
 * Or copies them to data/ first if not found.
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import {
  Account,
  Trade,
  Database,
  TradeResult,
  TradeStatus,
  Direction,
  Session,
  InstrumentType,
} from '../src/lib/types';

const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const JOURNAL_DIR = path.join(PROJECT_ROOT, '2025 Trading Journal');

// ─── CSV Discovery ────────────────────────────────────────────────────────────

function findCsvFile(dir: string, prefix: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find(
    (f) => f.toLowerCase().startsWith(prefix.toLowerCase()) && f.endsWith('.csv')
  );
  return match ? path.join(dir, match) : null;
}

function readCsv(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  console.log(`📄 Read ${result.data.length} rows from ${path.basename(filePath)}`);
  if (result.errors.length > 0) {
    console.warn('  Parse warnings:', result.errors.slice(0, 3));
  }
  return result.data;
}

// ─── Field Mappers ────────────────────────────────────────────────────────────

/** Strip Notion relation URL annotations: "Live Trades (https://...)" → "Live Trades" */
function stripNotionUrl(raw: string): string {
  // Remove everything from " (https://" to the closing ")"
  return raw.replace(/\s*\(https?:\/\/[^)]*\)/g, '').trim();
}

/** Extract the first relation name from a Notion multi-relation field */
function extractFirstRelation(raw: string): string {
  // Notion exports multi-relations as comma-separated values like:
  // "Relation1 (url), Relation2 (url)"
  const first = raw.split(',')[0] ?? '';
  return stripNotionUrl(first);
}

function mapResult(raw: string): TradeResult {
  const s = raw.trim().toLowerCase();
  if (s.includes('profit') || s.includes('win') || s.includes('🟢')) return 'win';
  if (s.includes('loss') || s.includes('🔴')) return 'loss';
  return 'breakeven';
}

function mapStatus(raw: string): TradeStatus {
  const s = raw.trim().toLowerCase();
  if (s.includes('t/p') || s.includes('tp') || s.includes('take profit')) return 'closed_tp';
  if (s.includes('s/l') || s.includes('sl') || s.includes('stop loss')) return 'closed_sl';
  if (s.includes('open')) return 'open';
  if (s.includes('manual')) return 'closed_manual';
  if (raw.trim() !== '') return 'closed_manual'; // any other closed status
  return 'closed_manual';
}

function mapDirection(typeOpt: string, typeOptPersonal: string): Direction | undefined {
  const combined = `${typeOpt} ${typeOptPersonal}`.toLowerCase().trim();
  if (combined.includes('call') && combined.includes('long')) return 'call_long';
  if (combined.includes('call') && combined.includes('short')) return 'call_short';
  if (combined.includes('put') && combined.includes('long')) return 'put_long';
  if (combined.includes('put') && combined.includes('short')) return 'put_short';
  if (combined.includes('call')) return 'call_long';
  if (combined.includes('put')) return 'put_long';
  return undefined;
}

function mapSession(raw: string): Session | undefined {
  const s = raw.toLowerCase();
  if (s.includes('new york') || s.includes('ny') || s.includes('est') || s.includes('edt') || s.includes('mst') || s.includes('mdt')) return 'new_york';
  if (s.includes('london') || s.includes('gmt')) return 'london';
  if (s.includes('asia') || s.includes('tokyo')) return 'asia';
  if (s.includes('sydney') || s.includes('aus')) return 'sydney';
  return undefined;
}

function mapInstrument(raw: string): InstrumentType {
  const s = raw.toLowerCase();
  if (s.includes('stock') || s.includes('equity')) return 'stock';
  if (s.includes('future') || s.includes('/es') || s.includes('/nq')) return 'futures';
  if (s.includes('crypto') || s.includes('btc') || s.includes('eth')) return 'crypto';
  return 'options';
}

/** Parse a Notion date like "01/02/2025 7:48 (MST)" or "01/02/2025" */
function parseNotionDate(raw: string): string | undefined {
  if (!raw || raw.trim() === '') return undefined;
  // Strip timezone annotation: " (MST)", " (EST)", etc.
  const cleaned = raw.replace(/\s*\([A-Z]{2,4}\)\s*$/, '').trim();
  try {
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}

function parseNum(raw: string): number {
  if (!raw || raw.trim() === '') return 0;
  // Remove $, commas, emojis, +, spaces
  const cleaned = raw.replace(/[$,🔴🟢🟡+\s]/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/** Symbol names that indicate template/empty rows to skip */
const SKIP_SYMBOLS = new Set(['new trade', 'usa', 'india', 'no trade', 'qqqq', '']);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Options Journal — Notion CSV Import\n');

  // Find CSV files
  const accountsCsvPath =
    findCsvFile(JOURNAL_DIR, 'Accounts') ??
    findCsvFile(DATA_DIR, 'Accounts');

  const tradesCsvPath =
    findCsvFile(JOURNAL_DIR, 'Trade Journal') ??
    findCsvFile(JOURNAL_DIR, 'Trade_Journal') ??
    findCsvFile(DATA_DIR, 'Trade_Journal') ??
    findCsvFile(DATA_DIR, 'Trade Journal');

  if (!accountsCsvPath) {
    console.error('❌ Could not find Accounts CSV. Expected in "2025 Trading Journal/" or "data/"');
    process.exit(1);
  }
  if (!tradesCsvPath) {
    console.error('❌ Could not find Trade Journal CSV. Expected in "2025 Trading Journal/" or "data/"');
    process.exit(1);
  }

  console.log(`📂 Accounts CSV : ${path.relative(PROJECT_ROOT, accountsCsvPath)}`);
  console.log(`📂 Trades CSV   : ${path.relative(PROJECT_ROOT, tradesCsvPath)}\n`);

  // Load or start fresh DB
  let db: Database = { accounts: [], trades: [], confluence_tags: [] };
  if (fs.existsSync(DB_PATH)) {
    console.log('📂 Found existing db.json — will merge (existing data preserved)\n');
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }

  // ── Import Accounts ─────────────────────────────────────────────────────────
  const accountRows = readCsv(accountsCsvPath);
  const accountMap = new Map<string, string>(); // normalised name → uuid

  // Index existing accounts
  db.accounts.forEach((a) => accountMap.set(a.name.toLowerCase(), a.id));

  let accountsCreated = 0;
  for (const row of accountRows) {
    // Notion exports the page title as "Name"
    const name = (row['Name'] || '').trim();
    if (!name || name.toLowerCase() === 'name') continue; // skip header artefact rows

    const nameLower = name.toLowerCase();
    if (accountMap.has(nameLower)) {
      console.log(`  ↩️  Account already exists: ${name}`);
      continue;
    }

    // Account type: Notion "Backtest ?" column is "Yes"/"No", or check "Type" column
    const backtestFlag = (row['Backtest ?'] || '').trim().toLowerCase();
    const typeRaw = (row['Type'] || '').trim().toLowerCase();
    const account_type: 'backtest' | 'live' =
      backtestFlag === 'yes' || typeRaw.includes('backtest') ? 'backtest' : 'live';

    // Balance / goal: Notion hides computed fields with "(HIDE)" prefix
    // The actual initial balance from the CSV is "Initial Balance" column
    // Current balance at export time is "(HIDE) Current Balance"
    // Goal is "Goal" or "(HIDE) Target"
    const initial_balance = parseNum(
      row['Initial Balance'] || row['(HIDE) Current Balance'] || '0'
    );
    const goal = parseNum(row['Goal'] || row['(HIDE) Target'] || '0');

    const account: Account = {
      id: crypto.randomUUID(),
      user_id: 'local',
      name,
      account_type,
      initial_balance,
      goal,
      created_at: new Date().toISOString(),
    };
    db.accounts.push(account);
    accountMap.set(nameLower, account.id);
    accountsCreated++;
    console.log(`  ✅ Account: "${name}" (${account_type}, balance: $${initial_balance}, goal: $${goal})`);
  }

  console.log('');

  // ── Import Trades ──────────────────────────────────────────────────────────
  const tradeRows = readCsv(tradesCsvPath);
  let tradesCreated = 0;
  let tradesSkipped = 0;

  for (const row of tradeRows) {
    // Symbol — Notion page title is in "Name" column
    const rawName = (row['Name'] || row['Symbol'] || '').trim();
    // Clean symbol: strip special chars, uppercase
    const symbol = rawName.replace(/[^A-Z0-9/.\s-]/gi, '').trim().toUpperCase();

    // Skip template/empty rows
    if (!symbol || SKIP_SYMBOLS.has(symbol.toLowerCase()) || SKIP_SYMBOLS.has(rawName.toLowerCase())) {
      tradesSkipped++;
      continue;
    }

    // Skip rows with no PnL data AND no date (completely empty records)
    const openRaw = (row['Open'] || '').trim();
    const closeRaw = (row['Close'] || '').trim();
    const grossPnlRaw = (row['Gross PnL'] || '').trim();
    if (!openRaw && !closeRaw && !grossPnlRaw) {
      tradesSkipped++;
      continue;
    }

    // Account lookup via Notion relation field (may contain URL annotation)
    // e.g. "Live Trades (https://app.notion.com/...)"
    const accountRaw = extractFirstRelation(row['Accounts'] || row['Account'] || '');
    const accountLookup = accountRaw.toLowerCase();
    let account_id = accountMap.get(accountLookup);

    // Fuzzy match: try partial name match
    if (!account_id && accountLookup) {
      for (const [key, id] of accountMap.entries()) {
        if (key.includes(accountLookup) || accountLookup.includes(key)) {
          account_id = id;
          break;
        }
      }
    }

    // Fallback to first live account
    if (!account_id) {
      const firstLive = db.accounts.find((a) => a.account_type === 'live');
      account_id = firstLive?.id ?? db.accounts[0]?.id;
    }
    if (!account_id) {
      tradesSkipped++;
      continue;
    }

    const opened_at = parseNotionDate(openRaw) ?? new Date().toISOString();
    const closed_at = parseNotionDate(closeRaw);

    const gross_pnl = parseNum(grossPnlRaw || row['Gross P&L'] || '0');
    const commission = parseNum(row['Commission'] || row['Fees'] || '0');
    const net_pnl_raw = parseNum(row['Net PnL'] || row['Net P&L'] || '');
    // Use CSV net PnL if available, otherwise compute
    const net_pnl = net_pnl_raw !== 0 ? net_pnl_raw : gross_pnl - commission;

    const resultRaw = row['Profit/Loss'] || row['Result'] || '';
    const result = mapResult(
      resultRaw || (net_pnl > 0 ? 'profit' : net_pnl < 0 ? 'loss' : 'breakeven')
    );

    const statusRaw = row['Status'] || '';
    const status = mapStatus(statusRaw || (closed_at ? 'Closed by T/P' : 'open'));

    // Confluences — Notion exports comma-separated in "Confluence" column
    const confluenceRaw = row['Confluence'] || row['Tags'] || '';
    const confluences = confluenceRaw
      ? confluenceRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Ensure confluence tags exist in DB
    for (const label of confluences) {
      if (!db.confluence_tags.find((t) => t.label === label)) {
        db.confluence_tags.push({
          id: crypto.randomUUID(),
          user_id: 'local',
          label,
          color: 'indigo',
        });
      }
    }

    // Quantity: Notion uses "Quant." column
    const qty = parseNum(row['Quant.'] || row['Quantity'] || row['Qty'] || '1') || 1;

    // Session: extract from date string timezone hint or "Sessions" column
    const sessionRaw = row['Sessions'] || row['Session'] || openRaw || '';
    const session = mapSession(sessionRaw);

    // Direction: from "Type Opt." (Call/Put) and "Type Opt.Personal" (Long/Short)
    const direction = mapDirection(
      row['Type Opt.'] || row['Call/Put'] || '',
      row['Type Opt.Personal'] || row['Direction'] || ''
    );

    const trade: Trade = {
      id: crypto.randomUUID(),
      user_id: 'local',
      account_id,
      symbol,
      contract_label: symbol !== rawName.toUpperCase() ? rawName : undefined,
      instrument_type: mapInstrument(row['Type'] || 'options'),
      direction,
      opened_at,
      closed_at,
      timezone: 'America/New_York',
      quantity: qty,
      entry_price: undefined,
      exit_price: undefined,
      gross_pnl,
      commission,
      net_pnl,
      result,
      status,
      session,
      percent_risk: parseNum(row['% Risk'] || '') || undefined,
      confluences,
      notes: (row['Notes'] || row['notes'] || '').trim() || undefined,
      screenshot_url: (row['Screenshot'] || row['screenshot_url'] || '').trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.trades.push(trade);
    tradesCreated++;
    console.log(`  ✅ Trade: ${symbol} | ${result} | net: ${net_pnl >= 0 ? '+' : ''}$${net_pnl.toFixed(2)}`);
  }

  // ── Write DB ──────────────────────────────────────────────────────────────
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

  console.log(`
✅ Import complete!
   Accounts created : ${accountsCreated}
   Trades imported  : ${tradesCreated}
   Trades skipped   : ${tradesSkipped}
   Tags created     : ${db.confluence_tags.length}

📁 Written to: data/db.json
🚀 Run "npm run dev" and open http://localhost:3000
  `);
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
