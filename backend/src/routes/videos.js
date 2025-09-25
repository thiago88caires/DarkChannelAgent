import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { getSupabase } from '../services/supabase.js';

export const videos = Router();

const CreateVideosSchema = z.object({
  count: z.number().int().min(1).max(10),
  languages: z.array(z.enum(['pt-BR', 'en', 'es'])).min(1),
  genre: z.string().min(1),
  charCount: z.union([z.literal(2500), z.literal(3500)]),
  images: z.literal(10),
  channelId: z.string().min(1),
  fieldsByLanguage: z.record(
    z.enum(['pt-BR', 'en', 'es']),
    z.object({
      screenplay: z.string().min(1),
      style: z.string().optional(),
      elements: z.string().optional(),
      rules: z.string().optional(),
      techniques: z.string().optional(),
      lighting: z.string().optional()
    })
  )
});

videos.post('/videos', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  const parse = CreateVideosSchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ code: 'bad_request', message: parse.error.message });
  const body = parse.data;
  const totalCreditsNeeded = body.count * body.languages.length;

  // If supabase configured, attempt debit and insert rows
  if (supabase) {
    // fetch user credits
    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('CREDITOS')
      .eq('EMAIL', req.user.email)
      .maybeSingle();
    if (uErr) return res.status(500).json({ code: 'db_error', message: uErr.message });
    const credits = user?.CREDITOS ?? 0;
    if (credits < totalCreditsNeeded) {
      return res.status(400).json({ code: 'insufficient_credits', message: 'Not enough credits' });
    }

    // debit & create ledger (best-effort transaction simulation)
    const { error: updErr } = await supabase
      .from('users')
      .update({ CREDITOS: credits - totalCreditsNeeded })
      .eq('EMAIL', req.user.email);
    if (updErr) return res.status(500).json({ code: 'db_error', message: updErr.message });

    const jobIds = [];
    for (let i = 0; i < body.count; i++) {
      for (const lang of body.languages) {
        const jobId = cryptoRandomId();
        jobIds.push(jobId);
        await supabase.from('videos').insert({
          'VIDEO ID': jobId,
          'USER EMAIL': req.user.email,
          LANGUAGE: lang,
          STATUS: 'Waiting',
          GENRE: body.genre,
          'SCREENPLAY': body.fieldsByLanguage[lang]?.screenplay || ''
        });
      }
    }
    return res.status(201).json({ jobIds });
  }

  // Degraded mode: just simulate jobIds
  const jobIds = [];
  for (let i = 0; i < body.count * body.languages.length; i++) jobIds.push(cryptoRandomId());
  return res.status(201).json({ jobIds, note: 'running without Supabase (no real debit or persistence)' });
});

videos.get('/videos', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  const { status, limit = 20, offset = 0 } = req.query;
  if (!supabase) return res.json([]);
  let q = supabase.from('videos').select('*').eq('USER EMAIL', req.user.email);
  if (status) q = q.eq('STATUS', status);
  q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
  const { data, error } = await q;
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  res.json(data || []);
});

videos.get('/videos/:id', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(404).json({ code: 'not_found', message: 'Not available in degraded mode' });
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('VIDEO ID', req.params.id)
    .eq('USER EMAIL', req.user.email)
    .maybeSingle();
  if (error) return res.status(500).json({ code: 'db_error', message: error.message });
  if (!data) return res.status(404).json({ code: 'not_found', message: 'Video not found' });
  res.json(data);
});

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

