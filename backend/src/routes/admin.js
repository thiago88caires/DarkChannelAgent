import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { getSupabase } from '../services/supabase.js'

export const admin = Router()

admin.use(requireAuth, requireAdmin)

admin.get('/admin/users', async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.json([])
  const { query = '', limit = 20, offset = 0 } = req.query
  let q = supabase.from('users').select('id, name, email, credits, role')
  if (query) {
    q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
  }
  q = q.order('name', { ascending: true }).range(Number(offset), Number(offset) + Number(limit) - 1)
  const { data, error } = await q
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  res.json(data || [])
})

admin.patch('/admin/users/:id', async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' })
  const { creditsDelta, credits, makeAdmin } = req.body || {}
  const { data: user, error: uErr } = await supabase.from('users').select('*').eq('id', req.params.id).maybeSingle()
  if (uErr) return res.status(500).json({ code: 'db_error', message: uErr.message })
  if (!user) return res.status(404).json({ code: 'not_found', message: 'User not found' })

  const updates = {}
  if (typeof credits === 'number' && Number.isFinite(credits)) {
    updates.credits = Math.max(0, Math.trunc(credits))
  } else if (typeof creditsDelta === 'number' && Number.isFinite(creditsDelta)) {
    updates.credits = Math.max(0, (user.credits || 0) + Math.trunc(creditsDelta))
  }
  if (typeof makeAdmin === 'boolean') {
    updates.role = makeAdmin ? 'admin' : 'user'
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ code: 'bad_request', message: 'No valid mutation provided' })
  }

  const { data: updated, error: updErr } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, name, email, credits, role')
    .maybeSingle()

  if (updErr) return res.status(500).json({ code: 'db_error', message: updErr.message })
  res.json(updated)
})

admin.delete('/admin/users/:id', async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.status(501).json({ code: 'not_configured', message: 'Supabase not configured' })
  const { data: user, error: uErr } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', req.params.id)
    .maybeSingle()
  if (uErr) return res.status(500).json({ code: 'db_error', message: uErr.message })
  if (!user) return res.status(404).json({ code: 'not_found', message: 'User not found' })
  if (user.email === req.user?.email) {
    return res.status(400).json({ code: 'cannot_delete_self', message: 'Nao e possivel remover o proprio usuario' })
  }
  const { error: delErr } = await supabase.from('users').delete().eq('id', req.params.id)
  if (delErr) return res.status(500).json({ code: 'db_error', message: delErr.message })
  res.status(204).send()
})

admin.get('/admin/queue', async (req, res) => {
  const supabase = getSupabase()
  if (!supabase) return res.json([])
  const { status, limit = 50, offset = 0 } = req.query
  let q = supabase.from('videos').select('*')
  if (status) q = q.eq('status', status)
  q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1)
  const { data, error } = await q
  if (error) return res.status(500).json({ code: 'db_error', message: error.message })
  res.json(data || [])
})
