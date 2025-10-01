import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

const editableKeys = [
  'description',
  'structure',
  'screenplay',
  'tone',
  'elements',
  'composition_rules',
  'techniques',
  'lighting_and_atmosphere'
]

const extractEditableFields = (video) => {
  const next = {}
  for (const key of editableKeys) {
    next[key] = video?.[key] || ''
  }
  return next
}

const sortVideos = (list) => {
  return [...list].sort((a, b) => {
    const left = a?.updated_at || a?.created_at || ''
    const right = b?.updated_at || b?.created_at || ''
    return right.localeCompare(left)
  })
}

export default function DraftVideos() {
  const session = useAuthStore(s => s.session)
  const token = session?.access_token || ''
  const [videos, setVideos] = React.useState([])
  const [edits, setEdits] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [saving, setSaving] = React.useState({})

  const fetchDrafts = React.useCallback(async () => {
    if (!token) {
      setVideos([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/videos?status=Draft`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message || 'Falha ao carregar rascunhos')
      }
      const data = await res.json()
      setVideos(sortVideos(Array.isArray(data) ? data : []))
    } catch (err) {
      setVideos([])
      setError(err.message || 'Falha ao carregar rascunhos')
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => { fetchDrafts() }, [fetchDrafts])

  function updateField(video, field, value) {
    const videoId = video.id
    setEdits(prev => {
      const base = prev[videoId] || extractEditableFields(video)
      return { ...prev, [videoId]: { ...base, [field]: value } }
    })
  }

  async function patchVideo(videoId, payload, stateLabel) {
    if (!token) return
    setSaving(prev => ({ ...prev, [videoId]: stateLabel }))
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Falha ao atualizar rascunho')
      }
      const updated = await res.json()
      setVideos(prev => sortVideos(prev.map(v => (v.id === updated.id ? updated : v))))
      setEdits(prev => {
        const next = { ...prev }
        delete next[videoId]
        return next
      })
      setError('')
    } catch (err) {
      setError(err.message || 'Falha ao atualizar rascunho')
    } finally {
      setSaving(prev => {
        const next = { ...prev }
        delete next[videoId]
        return next
      })
    }
  }

  async function handleSave(video) {
    const videoId = video.id
    const pending = edits[videoId] || extractEditableFields(video)
    await patchVideo(videoId, pending, 'saving')
  }

  async function handleSubmit(video) {
    const videoId = video.id
    const pending = edits[videoId] || extractEditableFields(video)
    await patchVideo(videoId, { ...pending, status: 'Waiting' }, 'submitting')
  }

  if (!token) {
    return <div>Carregando usuario...</div>
  }

  const busyIds = React.useMemo(() => new Set(Object.keys(saving)), [saving])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Rascunhos de videos</h2>
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
      {loading && <div>Carregando rascunhos...</div>}
      {!loading && !videos.length && <div>Nenhum rascunho encontrado.</div>}
      {videos.map(video => {
        const current = edits[video.id] || extractEditableFields(video)
        const disabled = busyIds.has(video.id)
        return (
          <section key={video.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, display: 'grid', gap: 12 }}>
            <header style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <strong>{video.genre || 'Sem genero'}</strong>
              <span style={{ fontSize: 12, color: '#555' }}>Idioma: {video.language}</span>
              <span style={{ fontSize: 12, color: '#555' }}>Status: {video.status}</span>
              <span style={{ fontSize: 12, color: '#555' }}>Atualizado: {video.updated_at ? new Date(video.updated_at).toLocaleString() : '-'}</span>
            </header>

            <label>
              Descricao
              <textarea rows={3} value={current.description}
                        onChange={e => updateField(video, 'description', e.target.value)} />
            </label>

            <label>
              Estrutura
              <textarea rows={4} value={current.structure}
                        onChange={e => updateField(video, 'structure', e.target.value)} />
            </label>

            <label>
              Roteiro
              <textarea rows={6} value={current.screenplay}
                        onChange={e => updateField(video, 'screenplay', e.target.value)} />
            </label>

            <label>
              Estilo
              <textarea rows={2} value={current.tone}
                        onChange={e => updateField(video, 'tone', e.target.value)} />
            </label>

            <label>
              Elementos
              <textarea rows={2} value={current.elements}
                        onChange={e => updateField(video, 'elements', e.target.value)} />
            </label>

            <label>
              Regras de composicao
              <textarea rows={2} value={current.composition_rules}
                        onChange={e => updateField(video, 'composition_rules', e.target.value)} />
            </label>

            <label>
              Tecnicas
              <textarea rows={2} value={current.techniques}
                        onChange={e => updateField(video, 'techniques', e.target.value)} />
            </label>

            <label>
              Luzes e atmosfera
              <textarea rows={2} value={current.lighting_and_atmosphere}
                        onChange={e => updateField(video, 'lighting_and_atmosphere', e.target.value)} />
            </label>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" disabled={disabled} onClick={() => handleSave(video)}>
                Salvar rascunho
              </button>
              <button type="button" disabled={disabled} onClick={() => handleSubmit(video)}>
                Enviar para producao
              </button>
            </div>
          </section>
        )
      })}
    </div>
  )
}
