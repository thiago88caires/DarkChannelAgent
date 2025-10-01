import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function MyVideos() {
  const token = useAuthStore(s => s.session?.access_token)
  const [list, setList] = React.useState([])
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function load() {
    if (!token) {
      setList([])
      return
    }
    setLoading(true)
    try {
      const url = new URL(`${API_BASE_URL}/videos`)
      if (status) url.searchParams.set('status', status)
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      const payload = await res.json()
      if (Array.isArray(payload)) setList(payload)
      else setList([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [token, status])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2>Meus Videos</h2>
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
        <ul style={{ display: 'grid', gap: 8, paddingLeft: 16 }}>
          {list.map(video => (
            <li key={video.id}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <strong>{video.genre || 'Sem genero'}</strong>
                <span>[{video.language}]</span>
                <span>Status: {video.status}</span>
                <span>Atualizado: {formatDateTime(video.updated_at)}</span>
                {video.video_yt_url && (
                  <a href={video.video_yt_url} style={{ marginLeft: 8 }} target="_blank" rel="noreferrer">YouTube</a>
                )}
              </div>
            </li>
          ))}
          {!list.length && <li>Nenhum resultado</li>}
        </ul>
      )}
    </div>
  )
}

