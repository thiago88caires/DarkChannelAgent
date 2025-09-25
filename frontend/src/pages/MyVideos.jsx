import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

export default function MyVideos() {
  const token = useAuthStore(s => s.session?.access_token)
  const [list, setList] = React.useState([])
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function load() {
    if (!token) return
    setLoading(true)
    try {
      const url = new URL(`${API_BASE_URL}/videos`)
      if (status) url.searchParams.set('status', status)
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      const j = await res.json()
      setList(Array.isArray(j) ? j : [])
    } finally { setLoading(false) }
  }

  React.useEffect(() => { load() }, [token, status])

  return (
    <div>
      <h2>Meus Vídeos</h2>
      <label>
        Status
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="Draft">Draft</option>
          <option value="Waiting">Waiting</option>
          <option value="Executing">Executing</option>
          <option value="Done">Done</option>
        </select>
      </label>
      {loading ? <div>Carregando...</div> : (
        <ul>
          {list.map(v => (
            <li key={v['VIDEO ID'] || v.id}>
              <strong>{v.GENRE}</strong> [{v.LANGUAGE}] — {v.STATUS}
              {v['VIDEO YT URL'] && (
                <a href={v['VIDEO YT URL']} style={{ marginLeft: 8 }} target="_blank" rel="noreferrer">YouTube</a>
              )}
            </li>
          ))}
          {!list.length && <li>Nenhum resultado</li>}
        </ul>
      )}
    </div>
  )
}

