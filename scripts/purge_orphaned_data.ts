import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function purgeOrphanedData() {
  console.log('🧹 Purging legacy orphaned test data (user_id = "local")...\n');

  const tables = [
    'trades',
    'accounts',
    'chart_observations',
    'confluence_tags',
    'routine',
    'coach_preferences',
    'user_profiles',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', 'local')
        .select();

      if (error) {
        console.warn(`⚠️ Table '${table}': ${error.message}`);
      } else {
        const count = data ? data.length : 0;
        console.log(`✅ Table '${table}': Purged ${count} legacy 'local' row(s).`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}' cleanup error:`, err);
    }
  }

  console.log('\n🎉 Orphaned test data cleanup complete!');
}

purgeOrphanedData();
