import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { getSupabase } from '../services/supabase.js'

export const videos = Router()

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
})

videos.post('/videos', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  const parse = CreateVideosSchema.safeParse(req.body || {})
  if (!parse.success) {
    return res.status(400).json({ code: 'bad_request', message: parse.error.message })
  }
  const body = parse.data
  const totalCreditsNeeded = body.count * body.languages.length

  if (!supabase) {
    const jobIds = []
    for (let i = 0; i < totalCreditsNeeded; i++) jobIds.push(cryptoRandomId())
    return res.status(201).json({ jobIds, note: 'running without Supabase (no persistence)' })
  }

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('credits')
    .eq('email', req.user.email)
    .maybeSingle()
  if (userErr) return res.status(500).json({ code: 'db_error', message: userErr.message })

  const currentCredits = user?.credits ?? 0
  if (currentCredits < totalCreditsNeeded) {
    return res.status(400).json({ code: 'insufficient_credits', message: 'Not enough credits' })
  }

  const newBalance = currentCredits - totalCreditsNeeded
  const { error: debitErr } = await supabase
    .from('users')
    .update({ credits: newBalance })
    .eq('email', req.user.email)
  if (debitErr) return res.status(500).json({ code: 'db_error', message: debitErr.message })

  const rows = []
  for (let i = 0; i < body.count; i++) {
    for (const lang of body.languages) {
      const jobId = cryptoRandomId()
      const langFields = body.fieldsByLanguage[lang] || {}
      rows.push({
        video_id: jobId,
        user_email: req.user.email,
        channel_id: body.channelId,
        language: lang,
        status: 'Waiting',
        genre: body.genre,
        screenplay: langFields.screenplay || '',
        tone: langFields.style || '',
        elements: langFields.elements || '',
        composition_rules: langFields.rules || '',
        techniques: langFields.techniques || '',
        lighting_and_atmosphere: langFields.lighting || '',
        character_count: body.charCount
      })
    }
  }

  const { error: insertErr } = await supabase.from('videos').insert(rows)
  if (insertErr) {
    await supabase.from('users').update({ credits: currentCredits }).eq('email', req.user.email)
    return res.status(500).json({ code: 'db_error', message: insertErr.message })
  }

  return res.status(201).json({ jobIds: rows.map(r => r.video_id) })
})

videos.get('/videos', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.json([])
  const { status, limit = 20, offset = 0 } = req.query
  let q = supabase.from('videos').select('*').eq('user_email', req.user.email)
  if (status) q = q.eq('status', status)
  q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1)
  const { data, error } = await q
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  res.json(data || [])
})

videos.get('/videos/:id', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) {
    return res.status(404).json({ code: 'not_found', message: 'Video not found' })
  }
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('video_id', req.params.id)
    .eq('user_email', req.user.email)
    .maybeSingle()
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  if (!data) return res.status(404).json({ code: 'not_found', message: 'Video not found' })
  res.json(data)
})

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
