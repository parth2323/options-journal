#!/usr/bin/env tsx
/**
 * Import script for Notion CSV exports → local db.json
 *
 * Usage: npx tsx scripts/import-csv.ts
 *
 * Place these files in /data before running:
 *   - Accounts.csv
 *   - Trade_Journal.csv
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Account, Trade, Database, TradeResult, TradeStatus, Direction, Session, InstrumentType } from '../src/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${filename} not found in /data — skipping`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  console.log(`📄 Read ${result.data.length} rows from ${filename}`);
  if (result.errors.length > 0) {
    console.warn('  Parse warnings:', result.errors.slice(0, 3));
  }
  return result.data;
}

// ─── Field Mappers ────────────────────────────────────────────────────────────

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
  if (s.includes('new york') || s.includes('ny') || s.includes('est') || s.includes('edt')) return 'new_york';
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

function parseDate(raw: string): string | undefined {
  if (!raw || raw.trim() === '') return undefined;
  try {
    const d = new Date(raw.trim());
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}

function parseNum(raw: string): number {
  if (!raw || raw.trim() === '') return 0;
  // Remove $, commas, emoji
  const cleaned = raw.replace(/[$,🔴🟢🟡]/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Options Journal — CSV Import\n');

  // Load existing DB or start fresh
  let db: Database = { accounts: [], trades: [], confluence_tags: [] };
  if (fs.existsSync(DB_PATH)) {
    console.log('📂 Found existing db.json — will merge (existing data preserved)\n');
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }

  // ── Import Accounts ────────────────────────────────────────────────────────
  const accountRows = readCsv('Accounts.csv');
  const accountMap = new Map<string, string>(); // Notion name → uuid

  // Index existing accounts
  db.accounts.forEach((a) => accountMap.set(a.name.toLowerCase(), a.id));

  let accountsCreated = 0;
  for (const row of accountRows) {
    // Try common Notion column names
    const name = (row['Name'] || row['Account'] || row['name'] || '').trim();
    if (!name) continue;

    if (accountMap.has(name.toLowerCase())) {
      console.log(`  ↩️  Account already exists: ${name}`);
      continue;
    }

    const typeRaw = (row['Type'] || row['Account Type'] || row['type'] || '').toLowerCase();
    const account_type: 'backtest' | 'live' = typeRaw.includes('backtest') ? 'backtest' : 'live';

    const account: Account = {
      id: crypto.randomUUID(),
      user_id: 'local',
      name,
      account_type,
      initial_balance: parseNum(row['Initial Balance'] || row['Starting Balance'] || '0'),
      goal: parseNum(row['Goal'] || row['Target'] || '0'),
      created_at: new Date().toISOString(),
    };
    db.accounts.push(account);
    accountMap.set(name.toLowerCase(), account.id);
    accountsCreated++;
    console.log(`  ✅ Account: ${name} (${account_type})`);
  }

  // ── Import Trades ──────────────────────────────────────────────────────────
  const tradeRows = readCsv('Trade_Journal.csv');
  let tradesCreated = 0;
  let tradesSkipped = 0;

  for (const row of tradeRows) {
    // Symbol: try multiple column names
    const symbol = (
      row['Name'] || row['Symbol'] || row['Ticker'] || row['name'] || ''
    ).trim().replace(/[^A-Z0-9/]/gi, '').toUpperCase();

    if (!symbol) { tradesSkipped++; continue; }

    // Account lookup
    const accountName = (row['Account'] || row['account'] || '').trim().toLowerCase();
    let account_id = accountName ? accountMap.get(accountName) : undefined;

    // Fallback to first account
    if (!account_id && db.accounts.length > 0) {
      account_id = db.accounts[0].id;
    }
    if (!account_id) { tradesSkipped++; continue; }

    const openedRaw = row['Open'] || row['Opened'] || row['opened_at'] || row['Date'] || '';
    const closedRaw = row['Close'] || row['Closed'] || row['closed_at'] || '';
    const opened_at = parseDate(openedRaw) ?? new Date().toISOString();

    const gross_pnl = parseNum(row['Gross PnL'] || row['Gross P&L'] || row['PnL'] || row['P&L'] || '0');
    const commission = parseNum(row['Commission'] || row['Fees'] || row['commission'] || '0');

    const resultRaw = row['Profit/Loss'] || row['Result'] || row['result'] || '';
    const result = mapResult(resultRaw || (gross_pnl > 0 ? 'profit' : gross_pnl < 0 ? 'loss' : 'breakeven'));

    const confluenceRaw = row['Confluence'] || row['Tags'] || row['confluences'] || '';
    const confluences = confluenceRaw
      ? confluenceRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Ensure confluence tags exist
    for (const label of confluences) {
      if (!db.confluence_tags.find((t) => t.label === label)) {
        db.confluence_tags.push({
          id: crypto.randomUUID(),
          user_id: 'local',
          label,
          color: 'gray',
        });
      }
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      user_id: 'local',
      account_id,
      symbol,
      contract_label: (row['Contract'] || row['contract_label'] || '').trim() || undefined,
      instrument_type: mapInstrument(row['Type'] || row['Instrument'] || 'options'),
      direction: mapDirection(row['Type Opt.'] || row['Call/Put'] || '', row['Type Opt.Personal'] || row['Direction'] || ''),
      opened_at,
      closed_at: parseDate(closedRaw),
      timezone: row['Timezone'] || row['timezone'] || 'America/New_York',
      quantity: parseNum(row['Quantity'] || row['Qty'] || row['quantity'] || '1') || 1,
      entry_price: parseNum(row['Entry'] || row['Entry Price'] || '0') || undefined,
      exit_price: parseNum(row['Exit'] || row['Exit Price'] || '0') || undefined,
      gross_pnl,
      commission,
      net_pnl: gross_pnl - commission,
      result,
      status: mapStatus(row['Status'] || row['status'] || (parseDate(closedRaw) ? 'closed_manual' : 'open')),
      session: mapSession(row['Sessions'] || row['Session'] || ''),
      percent_risk: parseNum(row['% Risk'] || row['Risk'] || '0') || undefined,
      confluences,
      notes: (row['Notes'] || row['notes'] || '').trim() || undefined,
      screenshot_url: (row['Screenshot'] || row['screenshot_url'] || '').trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.trades.push(trade);
    tradesCreated++;
  }

  // ── Write DB ───────────────────────────────────────────────────────────────
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
