import { supabase } from '../src/lib/supabase';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('🚀 Starting Supabase Migration...');

  let dbPath = path.join(process.cwd(), '.data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    dbPath = path.join(process.cwd(), 'data', 'db.json');
  }

  if (!fs.existsSync(dbPath)) {
    console.error('❌ Could not find local db.json file to migrate.');
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(raw);

  // 1. Insert Accounts
  console.log(`\n📦 Migrating ${db.accounts.length} Accounts...`);
  for (const acc of db.accounts) {
    const { error } = await supabase.from('accounts').upsert({
      id: acc.id,
      user_id: acc.user_id || 'local',
      name: acc.name,
      account_type: acc.account_type,
      initial_balance: acc.initial_balance,
      goal: acc.goal,
      created_at: acc.created_at,
    });
    if (error) {
      console.error(`Failed to insert account "${acc.name}":`, error.message);
    } else {
      console.log(`  ✓ Account inserted: ${acc.name}`);
    }
  }

  // 2. Insert Confluence Tags
  console.log(`\n🏷️ Migrating ${db.confluence_tags.length} Confluence Tags...`);
  for (const tag of db.confluence_tags) {
    const { error } = await supabase.from('confluence_tags').upsert({
      id: tag.id,
      user_id: tag.user_id || 'local',
      label: tag.label === 'Above VWAMP' ? 'Above VWAP' : tag.label,
      color: tag.color || 'indigo',
    });
    if (error) {
      console.error(`Failed to insert tag "${tag.label}":`, error.message);
    } else {
      console.log(`  ✓ Tag inserted: ${tag.label}`);
    }
  }

  // 3. Insert Trades
  console.log(`\n📈 Migrating ${db.trades.length} Trades...`);
  for (const trade of db.trades) {
    const { error } = await supabase.from('trades').upsert({
      id: trade.id,
      user_id: trade.user_id || 'local',
      account_id: trade.account_id,
      symbol: trade.symbol,
      contract_label: trade.contract_label,
      instrument_type: trade.instrument_type || 'options',
      direction: trade.direction,
      opened_at: trade.opened_at,
      closed_at: trade.closed_at,
      timezone: trade.timezone || 'America/New_York',
      quantity: trade.quantity,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      gross_pnl: trade.gross_pnl,
      commission: trade.commission,
      net_pnl: trade.net_pnl,
      result: trade.result,
      status: trade.status,
      session: trade.session,
      percent_risk: trade.percent_risk,
      confluences: trade.confluences || [],
      notes: trade.notes,
      screenshot_url: trade.screenshot_url,
      created_at: trade.created_at,
      updated_at: trade.updated_at,
    });
    if (error) {
      console.error(`Failed to insert trade "${trade.symbol} (${trade.id})":`, error.message);
    } else {
      console.log(`  ✓ Trade inserted: ${trade.symbol} (${trade.contract_label || ''})`);
    }
  }

  console.log('\n✨ Supabase Migration Completed Successfully!');
}

migrate();
