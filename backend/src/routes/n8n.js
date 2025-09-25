import { Router } from 'express';
import { getSupabase } from '../services/supabase.js';
import { verifyN8nSecret } from '../services/n8n.js';

export const n8n = Router();

n8n.post('/n8n/screenplay/callback', async (req, res) => {
  const ok = verifyN8nSecret(req.headers['x-n8n-signature'] || req.query.secret);
  if (!ok) return res.status(401).json({ code: 'unauthorized', message: 'Invalid secret' });
  const supabase = getSupabase();
  if (!supabase) return res.json({ ok: true });
  const { jobId, language, screenplay, meta } = req.body || {};
  if (!jobId) return res.status(400).json({ code: 'bad_request', message: 'jobId required' });
  await supabase
    .from('videos')
    .update({ LANGUAGE: language, SCREENPLAY: screenplay, META: meta || {}, STATUS: 'Draft' })
    .eq('VIDEO ID', jobId);
  res.json({ ok: true });
});

n8n.post('/n8n/video/callback', async (req, res) => {
  const ok = verifyN8nSecret(req.headers['x-n8n-signature'] || req.query.secret);
  if (!ok) return res.status(401).json({ code: 'unauthorized', message: 'Invalid secret' });
  const supabase = getSupabase();
  if (!supabase) return res.json({ ok: true });
  const { jobId, status, videoUrl } = req.body || {};
  if (!jobId) return res.status(400).json({ code: 'bad_request', message: 'jobId required' });
  await supabase
    .from('videos')
    .update({ STATUS: status, 'VIDEO YT URL': videoUrl || null })
    .eq('VIDEO ID', jobId);
  res.json({ ok: true });
});

