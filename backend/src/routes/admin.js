import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getSupabase } from '../services/supabase.js';

export const admin = Router();

admin.use(requireAuth, requireAdmin);

admin.get('/admin/users', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  const { query = '', limit = 20, offset = 0 } = req.query;
  let q = supabase.from('users').select('id, NOME, EMAIL, CREDITOS, is_admin');
  if (query) {
    q = q.or(`NOME.ilike.%${query}%,EMAIL.ilike.%${query}%`);
  }
  q = q.order('NOME', { ascending: true }).range(Number(offset), Number(offset) + Number(limit) - 1);
  const { data, error } = await q;
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});

admin.patch('/admin/users/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' });
  const { creditsDelta, makeAdmin } = req.body || {};
  // Fetch current
  const { data: user, error: uErr } = await supabase.from('users').select('*').eq('id', req.params.id).maybeSingle();
  if (uErr || !user) return res.status(404).json({ code: 'not_found', message: 'User not found' });
  const next = { ...user };
  if (typeof creditsDelta === 'number') next.CREDITOS = Math.max(0, (user.CREDITOS || 0) + creditsDelta);
  if (typeof makeAdmin === 'boolean') next.is_admin = makeAdmin;
  const { error: updErr } = await supabase.from('users').update(next).eq('id', req.params.id);
  if (updErr) return res.status(500).json({ code: 'db_error', message: updErr.message });
  res.json({ ok: true });
});

admin.get('/admin/queue', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  const { status, limit = 50, offset = 0 } = req.query;
  let q = supabase.from('videos').select('*');
  if (status) q = q.eq('STATUS', status);
  q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
  const { data, error } = await q;
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});
