import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

let supabaseClient: SupabaseClient | null = null;

if (config.supabase.isConfigured) {
  try {
    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    console.log('[Database] Initialized Supabase PostgreSQL client connection.');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client. Running in Demo Memory Mode.', err);
    supabaseClient = null;
  }
} else {
  console.log('[Database] Supabase credentials not provided. Operating in Zero-Config Demo Mode (In-Memory).');
}

export const getSupabaseClient = (): SupabaseClient | null => supabaseClient;
export const isUsingDemoMode = (): boolean => supabaseClient === null;
