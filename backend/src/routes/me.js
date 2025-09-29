import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getSupabase } from '../services/supabase.js'

export const me = Router()

const PROFILE_COLUMNS = 'id, name, email, credits, role, phone, found_us, preferred_language'
const ALLOWED_PATCH_FIELDS = new Set(['name', 'phone', 'found_us', 'preferred_language'])

me.get('/me', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  const email = req.user?.email
  if (!email) return res.status(401).json({ code: 'unauthorized', message: 'Missing user context' })

  if (!supabase) {
    return res.json({
      email,
      name: null,
      credits: 0,
      is_admin: !!req.user?.is_admin,
      phone: null,
      found_us: null,
      preferred_language: null,
      channels: []
    })
  }

  const [{ data: user, error: userErr }, { data: channels, error: channelErr }] = await Promise.all([
    supabase
      .from('users')
      .select(PROFILE_COLUMNS)
      .eq('email', email)
      .maybeSingle(),
    supabase
      .from('youtube_channels')
      .select('id, name')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
  ])

  if (userErr) return res.status(500).json({ code: 'db_error', message: userErr.message })
  if (channelErr) return res.status(500).json({ code: 'db_error', message: channelErr.message })

  let profile = user
  if (!profile) {
    const { data: inserted, error: insertErr } = await supabase
      .from('users')
      .insert({ email })
      .select(PROFILE_COLUMNS)
      .single()
    if (insertErr) return res.status(500).json({ code: 'db_error', message: insertErr.message })
    profile = inserted
  }

  res.json({
    email: profile.email,
    name: profile.name,
    credits: profile.credits ?? 0,
    is_admin: profile.role === 'admin',
    phone: profile.phone,
    found_us: profile.found_us,
    preferred_language: profile.preferred_language,
    channels: channels || []
  })
})

me.patch('/me', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' })
  const email = req.user?.email
  if (!email) return res.status(401).json({ code: 'unauthorized', message: 'Missing user context' })

  const body = req.body || {}
  const updates = {}

  for (const key of Object.keys(body || {})) {
    if (!ALLOWED_PATCH_FIELDS.has(key)) continue
    const value = body[key]
    if (typeof value === 'string') {
      updates[key] = value.trim() || null
    } else if (value === null) {
      updates[key] = null
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ code: 'bad_request', message: 'No valid fields to update' })
  }

  const { data: profile, error: updErr } = await supabase
    .from('users')
    .upsert({ email, ...updates }, { onConflict: 'email' })
    .select(PROFILE_COLUMNS)
    .maybeSingle()

  if (updErr) return res.status(500).json({ code: 'db_error', message: updErr.message })

  res.json({
    email: profile.email,
    name: profile.name,
    credits: profile.credits ?? 0,
    is_admin: profile.role === 'admin',
    phone: profile.phone,
    found_us: profile.found_us,
    preferred_language: profile.preferred_language
  })
})

me.get('/credits', requireAuth, async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) {
    return res.json({ credits: 0 })
  }
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('email', req.user.email)
    .maybeSingle()
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  res.json({ credits: data?.credits ?? 0 })
})
