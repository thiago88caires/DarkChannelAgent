import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabase } from '../services/supabase.js';

export const me = Router();

me.get('/me', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  const email = req.user.email;
  if (!supabase) return res.json({ email, credits: 0, channels: [] });

  let [{ data: user, error: uErr }, { data: channels, error: cErr }] = await Promise.all([
    supabase.from('users').select('id, CREDITOS, is_admin').eq('EMAIL', email).maybeSingle(),
    supabase.from('youtube_channels').select('id, name').eq('user_email', email)
  ]);

  if (!user && !uErr) {
    // bootstrap profile row
    const { data: inserted, error: iErr } = await supabase
      .from('users')
      .insert({ EMAIL: email, CREDITOS: 0 })
      .select('id, CREDITOS, is_admin')
      .single();
    if (!iErr) user = inserted;
  }

  if (uErr || cErr) return res.status(500).json({ code: 'db_error', message: (uErr || cErr).message });
  res.json({ email, credits: user?.CREDITOS ?? 0, is_admin: user?.is_admin ?? false, channels: channels ?? [] });
});

me.get('/credits', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json({ credits: 0 });
  const { data, error } = await supabase.from('users').select('CREDITOS').eq('EMAIL', req.user.email).maybeSingle();
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json({ credits: data?.CREDITOS ?? 0 });
});
