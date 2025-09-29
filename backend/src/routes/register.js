import { Router } from 'express'
import { z } from 'zod'
import { getSupabase } from '../services/supabase.js'

export const register = Router()

const RegisterProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  found_us: z.string().optional(),
  preferred_language: z.string().optional()
})

register.post('/register/profile', async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) {
    return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' })
  }
  const parse = RegisterProfileSchema.safeParse(req.body || {})
  if (!parse.success) {
    return res.status(400).json({ code: 'bad_request', message: parse.error.message })
  }
  const payload = {
    email: parse.data.email.trim().toLowerCase(),
    name: parse.data.name?.trim() || null,
    phone: parse.data.phone?.trim() || null,
    found_us: parse.data.found_us?.trim() || null,
    preferred_language: parse.data.preferred_language?.trim() || null
  }
  const { error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'email' })
  if (error) {
    return res.status(500).json({ code: 'db_error', message: error.message })
  }
  res.json({ ok: true })
})
