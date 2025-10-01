import { Router } from 'express';
import { getSupabase } from '../services/supabase.js';
import { verifyN8nSecret } from '../services/n8n.js';

export const n8n = Router();

function resolveVideoId(body = {}) {
  return body.videoId || body.VideoId || body.jobId || body.id || null;
}

n8n.post('/n8n/screenplay/callback', async (req, res) => {
  const ok = verifyN8nSecret(req.headers['x-n8n-signature'] || req.query.secret);
  if (!ok) return res.status(401).json({ code: 'unauthorized', message: 'Invalid secret' });
  const supabase = getSupabase();
  if (!supabase) return res.json({ ok: true });
  const {
    language,
    screenplay,
    description,
    structure,
    tone,
    elements,
    compositionRules,
    techniques,
    lighting
  } = req.body || {};
  const videoId = resolveVideoId(req.body);
  if (!videoId) return res.status(400).json({ code: 'bad_request', message: 'videoId required' });
  const updates = { status: 'Draft' };
  if (language) updates.language = language;
  if (typeof screenplay === 'string') updates.screenplay = screenplay;
  if (typeof description === 'string') updates.description = description;
  if (typeof structure === 'string') updates.structure = structure;
  if (typeof tone === 'string') updates.tone = tone;
  if (typeof elements === 'string') updates.elements = elements;
  if (typeof compositionRules === 'string') updates.composition_rules = compositionRules;
  if (typeof techniques === 'string') updates.techniques = techniques;
  if (typeof lighting === 'string') updates.lighting_and_atmosphere = lighting;
  await supabase
    .from('videos')
    .update(updates)
    .eq('id', videoId);
  res.json({ ok: true });
});

n8n.post('/n8n/video/callback', async (req, res) => {
  const ok = verifyN8nSecret(req.headers['x-n8n-signature'] || req.query.secret);
  if (!ok) return res.status(401).json({ code: 'unauthorized', message: 'Invalid secret' });
  const supabase = getSupabase();
  if (!supabase) return res.json({ ok: true });
  const { status, videoUrl } = req.body || {};
  const videoId = resolveVideoId(req.body);
  if (!videoId) return res.status(400).json({ code: 'bad_request', message: 'videoId required' });
  const updates = {};
  if (status) updates.status = status;
  if (videoUrl !== undefined) updates.video_yt_url = videoUrl || null;
  await supabase
    .from('videos')
    .update(updates)
    .eq('id', videoId);
  res.json({ ok: true });
});
