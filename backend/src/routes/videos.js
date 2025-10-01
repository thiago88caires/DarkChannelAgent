import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { getSupabase } from '../services/supabase.js'
import { config } from '../config.js'

export const videos = Router()

const LanguageEnum = z.enum(['pt-BR', 'en', 'es'])

const LanguageFieldsSchema = z.object({
  description: z.string().min(1),
  screenplay: z.string().min(1),
  structure: z.string().optional(),
  style: z.string().optional(),
  elements: z.string().optional(),
  rules: z.string().optional(),
  techniques: z.string().optional(),
  lighting: z.string().optional()
})

const CreateVideosSchema = z.object({
  count: z.number().int().min(1).max(10),
  languages: z.array(LanguageEnum).min(1),
  genre: z.string().min(1),
  charCount: z.union([z.literal(2500), z.literal(3500)]),
  images: z.literal(10),
  channelId: z.string().min(1).optional().nullable(),
  fieldsByLanguage: z.record(LanguageEnum, LanguageFieldsSchema)
})

const UpdateVideoSchema = z.object({
  description: z.string().optional(),
  structure: z.string().optional(),
  screenplay: z.string().optional(),
  tone: z.string().optional(),
  elements: z.string().optional(),
  composition_rules: z.string().optional(),
  techniques: z.string().optional(),
  lighting_and_atmosphere: z.string().optional(),
  status: z.enum(['Draft', 'Waiting', 'Executing', 'Done']).optional()
}).refine(val => Object.keys(val).length > 0, {
  message: 'No update fields provided'
})

function textToArray(value = '') {
  return value
    .split(/\r?\n|\u2022|\*/)
    .map(item => item.replace(/^[\\s\u2022*\-]+/, '').trim())
    .filter(Boolean)
}

async function triggerScreenplayWebhook(rows, usermail) {
  const webhookUrl = config.n8n.screenplayUrl
  if (!webhookUrl) return

  await Promise.allSettled(rows.map(async row => {
    const payload = {
      videoID: row.id,
      usermail,
      summary: row.description || `Gerar roteiro para ${row.genre || 'video'}`,
      Language: (row.language || '').toUpperCase(),
      Genre: row.genre || '',
      Description: row.description || '',
      Structure: textToArray(row.structure || row.screenplay),
      Tone: row.tone || ''
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error('Failed to trigger N8N screenplay webhook', err)
    }
  }))
}

videos.post('/videos', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  const parse = CreateVideosSchema.safeParse(req.body || {})
  if (!parse.success) {
    return res.status(400).json({ code: 'bad_request', message: parse.error.message })
  }
  const body = parse.data
  const totalCreditsNeeded = body.count * body.languages.length

  if (!supabase) {
    const generatedIds = []
    for (let i = 0; i < totalCreditsNeeded; i++) generatedIds.push(randomUUID())
    return res.status(201).json({ videoIds: generatedIds, note: 'running without Supabase (no persistence)' })
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
      const langFields = body.fieldsByLanguage[lang]
      rows.push({
        id: randomUUID(),
        user_email: req.user.email,
        channel_id: body.channelId || null,
        language: lang,
        status: 'Draft',
        genre: body.genre,
        description: langFields.description || '',
        structure: (langFields.structure && langFields.structure.length ? langFields.structure : langFields.screenplay) || '',
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

  const { error: insertErr } = await supabase
    .from('videos')
    .insert(rows)

  if (insertErr) {
    await supabase.from('users').update({ credits: currentCredits }).eq('email', req.user.email)
    return res.status(500).json({ code: 'db_error', message: insertErr.message })
  }

  triggerScreenplayWebhook(rows, req.user.email).catch(err => {
    console.error('Unexpected N8N screenplay webhook error', err)
  })

  const videoIds = rows.map(row => row.id)
  return res.status(201).json({ videoIds })
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
    .eq('id', req.params.id)
    .eq('user_email', req.user.email)
    .maybeSingle()
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  if (!data) return res.status(404).json({ code: 'not_found', message: 'Video not found' })
  res.json(data)
})

videos.patch('/videos/:id', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.status(501).json({ code: 'not_supported', message: 'Supabase disabled' })
  const bodyParse = UpdateVideoSchema.safeParse(req.body || {})
  if (!bodyParse.success) {
    return res.status(400).json({ code: 'bad_request', message: bodyParse.error.message })
  }
  const updates = bodyParse.data

  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_email', req.user.email)
    .select('*')
    .maybeSingle()

  if (error) {
    return res.status(500).json({ code: 'db_error', message: error.message })
  }
  if (!data) {
    return res.status(404).json({ code: 'not_found', message: 'Video not found' })
  }
  res.json(data)
})






