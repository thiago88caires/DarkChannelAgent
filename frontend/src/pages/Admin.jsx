import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

export default function Admin() {
  const token = useAuthStore(s => s.session?.access_token)
  const [query, setQuery] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [error, setError] = React.useState('')

  async function search() {
    setError('')
    try {
      const url = new URL(`${API_BASE_URL}/admin/users`)
      if (query) url.searchParams.set('query', query)
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || 'Erro')
      setRows(Array.isArray(j) ? j : [])
    } catch (e) { setError(e.message) }
  }

  async function adjust(u, delta, makeAdmin) {
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${u.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ creditsDelta: delta, makeAdmin })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || 'Erro')
      await search()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <h2>Admin</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Buscar por nome ou e-mail" value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={search}>Pesquisar</button>
      </div>
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Nome</th>
            <th style={{ textAlign: 'left' }}>E-mail</th>
            <th>Créditos</th>
            <th>Admin</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(u => (
            <tr key={u.id}>
              <td>{u.NOME || '-'}</td>
              <td>{u.EMAIL}</td>
              <td style={{ textAlign: 'center' }}>{u.CREDITOS ?? 0}</td>
              <td style={{ textAlign: 'center' }}>{u.is_admin ? '✔' : ''}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => adjust(u, +5)}>+5</button>
                <button onClick={() => adjust(u, -5)}>-5</button>
                <button onClick={() => adjust(u, 0, !u.is_admin)}>{u.is_admin ? 'Remover admin' : 'Promover'}</button>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Nenhum resultado</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

