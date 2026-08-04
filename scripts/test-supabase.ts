import { supabase } from '../src/lib/supabase';

async function test() {
  console.log('Testing Supabase connection...');
  const { data: accounts, error: accErr } = await supabase.from('accounts').select('*');
  console.log('Accounts query:', { accounts, accErr });

  const { data: trades, error: tradeErr } = await supabase.from('trades').select('*');
  console.log('Trades query:', { trades, tradeErr });

  const { data: tags, error: tagErr } = await supabase.from('confluence_tags').select('*');
  console.log('Tags query:', { tags, tagErr });
}

test();
