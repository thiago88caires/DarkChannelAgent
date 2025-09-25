import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { logger } from '../logger.js';

let supabaseAdmin = null;

export function getSupabase() {
  if (supabaseAdmin) return supabaseAdmin;
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    logger.warn({ msg: 'Supabase env not configured; running in degraded mode' });
    return null;
  }
  supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return supabaseAdmin;
}

