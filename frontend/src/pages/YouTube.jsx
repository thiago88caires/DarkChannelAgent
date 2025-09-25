import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

export default function YouTube() {
  const token = useAuthStore(s => s.session?.access_token)
  const [rows, setRows] = React.useState([])
  const [name, setName] = React.useState('')
  const [oauth, setOauth] = React.useState('')
  const [error, setError] = React.useState('')

  async function load() {
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/youtube/channels`, { headers: { Authorization: `Bearer ${token}` }})
      const j = await res.json(); if (!res.ok) throw new Error(j?.message || 'Erro')
      setRows(j)
    } catch (e) { setError(e.message) }
  }
  React.useEffect(() => { if (token) load() }, [token])

  async function add() {
    setError('')
    try {
      const body = { name, oauth: JSON.parse(oauth || '{}') }
      const res = await fetch(`${API_BASE_URL}/youtube/channels`, {
        method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const j = await res.json(); if (!res.ok) throw new Error(j?.message || 'Erro')
      setName(''); setOauth(''); await load()
    } catch (e) { setError(e.message) }
  }

  async function del(id) {
    setError('')
    try {
      await fetch(`${API_BASE_URL}/youtube/channels/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      await load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <h2>Seus canais do YouTube</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input placeholder="Nome do canal" value={name} onChange={e => setName(e.target.value)} />
        <textarea rows={4} placeholder='{ "access_token": "..." }' value={oauth} onChange={e => setOauth(e.target.value)} />
        <button onClick={add} disabled={!name}>Adicionar</button>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      <ul style={{ marginTop: 12 }}>
        {rows.map(r => (
          <li key={r.id}>
            {r.name} <button onClick={() => del(r.id)}>Remover</button>
          </li>
        ))}
        {!rows.length && <li>Nenhum canal cadastrado</li>}
      </ul>
    </div>
  )
}

