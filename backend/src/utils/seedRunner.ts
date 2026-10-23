import { getSupabaseClient } from '../config/database';
import fs from 'fs';
import path from 'path';

async function runSeed() {
  console.log('[Seed] Starting database seed runner...');
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.log('[Seed] Supabase not configured. In-memory demo store already contains full seed data.');
    process.exit(0);
  }

  const seedFilePath = path.resolve(__dirname, '../../../database/seed/seed.sql');
  if (!fs.existsSync(seedFilePath)) {
    console.error('[Seed] Could not locate seed.sql at:', seedFilePath);
    process.exit(1);
  }

  console.log('[Seed] SQL seed file located. In Supabase, execute database/seed/seed.sql directly via SQL Editor or CLI.');
  process.exit(0);
}

runSeed();
