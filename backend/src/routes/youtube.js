import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabase } from '../services/supabase.js';

export const youtube = Router();

youtube.get('/youtube/channels', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json([]);
  const { data, error } = await supabase
    .from('youtube_channels')
    .select('id, name')
    .eq('user_email', req.user.email)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});

youtube.post('/youtube/channels', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' });
  const { name, oauth } = req.body || {};
  if (!name || !oauth) return res.status(400).json({ code: 'bad_request', message: 'name and oauth required' });
  const payload = { user_email: req.user.email, name, oauth_encrypted: JSON.stringify(oauth) };
  const { data, error } = await supabase.from('youtube_channels').insert(payload).select('id, name').single();
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.status(201).json(data);
});

youtube.delete('/youtube/channels/:id', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' });
  const { id } = req.params;
  const { error } = await supabase
    .from('youtube_channels')
    .delete()
    .eq('id', id)
    .eq('user_email', req.user.email);
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.status(204).send();
});

