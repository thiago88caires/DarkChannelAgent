import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

function mapRow(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email,
    credits: row.credits ?? 0,
    role: row.role || 'user',
    isAdmin: (row.role || '').toLowerCase() === 'admin',
    creditsDraft: String(row.credits ?? 0)
  }
}

export default function Admin() {
  const token = useAuthStore(s => s.session?.access_token)
  const [query, setQuery] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [pendingId, setPendingId] = React.useState('')

  const hasToken = Boolean(token)

  const fetchUsers = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const url = new URL(`${API_BASE_URL}/admin/users`)
      if (query) url.searchParams.set('query', query)
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || 'Falha ao carregar usuarios')
      setRows((Array.isArray(payload) ? payload : []).map(mapRow))
    } catch (err) {
      setRows([])
      setError(err.message || 'Falha ao carregar usuarios')
    } finally {
      setLoading(false)
    }
  }, [query, token])

  React.useEffect(() => {
    if (token) fetchUsers()
  }, [token, fetchUsers])

  function updateRowDraft(id, patch) {
    setRows(prev => prev.map(row => row.id === id ? { ...row, ...patch } : row))
  }

  async function saveCredits(row) {
    const nextValue = Number(row.creditsDraft)
    if (!Number.isFinite(nextValue) || nextValue < 0) {
      setError('Informe um numero valido de creditos')
      updateRowDraft(row.id, { creditsDraft: String(row.credits) })
      return
    }
    if (nextValue === row.credits) return
    setPendingId(row.id)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${row.id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ credits: Math.trunc(nextValue) })
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || 'Falha ao atualizar creditos')
      setRows(prev => prev.map(r => r.id === row.id ? mapRow(payload) : r))
    } catch (err) {
      setError(err.message || 'Falha ao atualizar creditos')
      updateRowDraft(row.id, { creditsDraft: String(row.credits) })
    } finally {
      setPendingId('')
    }
  }

  async function toggleAdmin(row, makeAdmin) {
    setPendingId(row.id)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${row.id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ makeAdmin })
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.message || 'Falha ao atualizar permissao')
      setRows(prev => prev.map(r => r.id === row.id ? mapRow(payload) : r))
    } catch (err) {
      setError(err.message || 'Falha ao atualizar permissao')
      updateRowDraft(row.id, { isAdmin: row.isAdmin })
    } finally {
      setPendingId('')
    }
  }

  async function deleteUser(row) {
    if (!window.confirm(`Remover ${row.email}?`)) return
    setPendingId(row.id)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${row.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok && res.status !== 204) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message || 'Falha ao remover usuario')
      }
      setRows(prev => prev.filter(r => r.id !== row.id))
    } catch (err) {
      setError(err.message || 'Falha ao remover usuario')
    } finally {
      setPendingId('')
    }
  }

  function handleCreditsChange(row, value) {
    updateRowDraft(row.id, { creditsDraft: value })
  }

  function handleCreditsKey(row, evt) {
    if (evt.key === 'Enter') {
      evt.preventDefault()
      saveCredits(row)
      evt.currentTarget.blur()
    }
  }

  if (!hasToken) {
    return <div>Faca login como administrador.</div>
  }

  return (
    <div>
      <h2>Admin - Usuarios</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Buscar por nome ou email"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchUsers() }}
        />
        <button onClick={fetchUsers} disabled={loading}>Pesquisar</button>
      </div>
      {error && <div style={{ color: 'tomato', marginBottom: 12 }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 6px' }}>Nome</th>
            <th style={{ textAlign: 'left', padding: '4px 6px' }}>Email</th>
            <th style={{ width: 140, padding: '4px 6px' }}>Creditos</th>
            <th style={{ width: 100, padding: '4px 6px' }}>Admin</th>
            <th style={{ width: 160, padding: '4px 6px' }}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '6px' }}>{row.name || '-'}</td>
              <td style={{ padding: '6px' }}>{row.email}</td>
              <td style={{ padding: '6px', textAlign: 'center' }}>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={row.creditsDraft}
                  onChange={e => handleCreditsChange(row, e.target.value)}
                  onBlur={() => saveCredits(row)}
                  onKeyDown={e => handleCreditsKey(row, e)}
                  disabled={pendingId === row.id}
                  style={{ width: 80 }}
                />
              </td>
              <td style={{ padding: '6px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={row.isAdmin}
                  onChange={e => toggleAdmin(row, e.target.checked)}
                  disabled={pendingId === row.id}
                />
              </td>
              <td style={{ padding: '6px', textAlign: 'center' }}>
                <button
                  onClick={() => deleteUser(row)}
                  disabled={pendingId === row.id}
                  style={{ color: 'tomato' }}
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
          {!rows.length && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: '12px', textAlign: 'center' }}>Nenhum resultado</td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={5} style={{ padding: '12px', textAlign: 'center' }}>Carregando...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
