import React from 'react'
import { supabase } from '../App.jsx'
import { API_BASE_URL } from '../store.js'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  foundUs: '',
  preferredLanguage: 'pt-BR',
  password: '',
  confirmPassword: ''
}

const LANG_OPTIONS = [
  { value: 'pt-BR', label: 'Portugues (Brasil)' },
  { value: 'en', label: 'Ingles' },
  { value: 'es', label: 'Espanhol' }
]

export default function Register() {
  const [form, setForm] = React.useState(INITIAL_FORM)
  const [error, setError] = React.useState('')
  const [ok, setOk] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  function onChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validate() {
    if (!form.name.trim()) return 'Informe seu nome'
    if (!form.email.trim()) return 'Informe seu email'
    if (!form.password) return 'Informe uma senha'
    if (form.password.length < 6) return 'A senha deve ter pelo menos 6 caracteres'
    if (form.password !== form.confirmPassword) return 'As senhas precisam corresponder'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }
    setBusy(true)
    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password
      })
      if (signErr) throw signErr
      const email = (data?.user?.email || form.email.trim()).toLowerCase()
      await upsertProfileWithApi(email)
      const accessToken = data?.session?.access_token
      if (accessToken) {
        await saveProfile(accessToken)
        setOk('Cadastro realizado com sucesso!')
      } else {
        setOk('Cadastro solicitado! Verifique seu email para confirmar e complete o perfil apos o login.')
      }
      setForm(INITIAL_FORM)
    } catch (err) {
      const message = err?.message || 'Falha ao cadastrar'
      if (message.includes('User already registered')) {
        try {
          await upsertProfileWithApi(form.email.trim())
          setOk('Usuario ja cadastrado. Perfil sincronizado, faca login para continuar.')
          setError('')
        } catch (syncErr) {
          setError(syncErr?.message || message)
        }
      } else {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  async function upsertProfileWithApi(email) {
    const payload = {
      email: email.trim().toLowerCase(),
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      found_us: form.foundUs.trim() || null,
      preferred_language: form.preferredLanguage || null
    }
    const res = await fetch(`${API_BASE_URL}/register/profile`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok && res.status !== 501) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.message || 'Falha ao salvar perfil')
    }
  }

  async function saveProfile(token) {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      found_us: form.foundUs.trim() || null,
      preferred_language: form.preferredLanguage || null
    }
    const res = await fetch(`${API_BASE_URL}/me`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.message || 'Falha ao salvar perfil')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
      <h2>Cadastrar</h2>
      <label>
        Nome completo
        <input value={form.name} onChange={e => onChange('name', e.target.value)} required />
      </label>
      <label>
        Telefone
        <input value={form.phone} onChange={e => onChange('phone', e.target.value)} placeholder="(DDD) numero" />
      </label>
      <label>
        Como nos encontrou?
        <input value={form.foundUs} onChange={e => onChange('foundUs', e.target.value)} placeholder="Indique a origem" />
      </label>
      <label>
        Idioma preferido
        <select value={form.preferredLanguage} onChange={e => onChange('preferredLanguage', e.target.value)}>
          {LANG_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} required />
      </label>
      <label>
        Senha
        <input type="password" value={form.password} onChange={e => onChange('password', e.target.value)} required minLength={6} />
      </label>
      <label>
        Confirmar senha
        <input type="password" value={form.confirmPassword} onChange={e => onChange('confirmPassword', e.target.value)} required minLength={6} />
      </label>
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <button type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Cadastrar'}</button>
    </form>
  )
}
