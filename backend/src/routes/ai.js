import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { callN8n } from '../services/n8n.js';
import { config } from '../config.js';

export const ai = Router();

const AiSchema = z.object({
  language: z.enum(['pt-BR', 'en', 'es']),
  genre: z.string().min(1),
  charCount: z.enum(['2500', '3500']).or(z.number().int().refine(v => v === 2500 || v === 3500, 'must be 2500 or 3500')),
  images: z.number().int().min(10).max(10),
  style: z.string().optional(),
  elements: z.string().optional(),
  rules: z.string().optional(),
  techniques: z.string().optional(),
  lighting: z.string().optional()
});

ai.post('/ai/screenplay', requireAuth, async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  const parse = AiSchema.safeParse(req.body || {});
  if (!parse.success) return res.status(400).json({ code: 'bad_request', message: parse.error.message });
  const body = parse.data;
  const payload = {
    userEmail: req.user.email,
    jobId: cryptoRandomId(),
    ...body
  };
  if (!config.n8n.screenplayUrl) {
    // Fallback dev response
    const screenplay = `Título: ${body.genre} — ${body.language}\n\nIntrodução... (roteiro gerado localmente)`
    return res.json({ screenplay, meta: { provider: 'local-fallback' } })
  }
  const { ok, status, data } = await callN8n(config.n8n.screenplayUrl, payload, {
    'Idempotency-Key': idempotencyKey || payload.jobId
  });
  if (!ok) return res.status(status || 502).json({ code: 'n8n_error', message: 'N8N screenplay webhook failed', details: data });
  // Expecting: { screenplay, meta }
  res.json({ screenplay: data.screenplay || '', meta: data.meta || {} });
});

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
