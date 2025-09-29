import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'
import LanguageChips, { allLanguages } from '../components/LanguageChips.jsx'
import CreditBadge from '../components/CreditBadge.jsx'

const CHAR_OPTIONS = [2500, 3500]
const FIXED_IMAGES = 10

export default function CreateVideos() {
  const session = useAuthStore(s => s.session)
  const token = session?.access_token
  const [me, setMe] = React.useState(null)
  const [profileError, setProfileError] = React.useState('')
  const [count, setCount] = React.useState(1)
  const [languages, setLanguages] = React.useState([])
  const [genre, setGenre] = React.useState('')
  const [charCount, setCharCount] = React.useState(CHAR_OPTIONS[0])
  const [channelId, setChannelId] = React.useState('')
  const [genresByLang, setGenresByLang] = React.useState({})
  const [fieldsByLanguage, setFieldsByLanguage] = React.useState({})
  const [busy, setBusy] = React.useState(false)
  const [notice, setNotice] = React.useState('')

  const totalCredits = count * languages.length
  const creditsAvailable = me?.credits ?? 0

  React.useEffect(() => {
    if (!token) {
      setMe(null)
      setChannelId('')
      return
    }
    let cancelled = false
    async function loadProfile() {
      setProfileError('')
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.message || 'Falha ao carregar perfil')
        if (cancelled) return
        setMe(payload)
        setChannelId(payload.channels?.[0]?.id || '')
      } catch (err) {
        if (cancelled) return
        setProfileError(err.message || 'Falha ao carregar perfil')
        setMe(null)
        setChannelId('')
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [token])

  async function ensureGenres(lang) {
    if (genresByLang[lang]) return true
    try {
      const res = await fetch(`${API_BASE_URL}/genres?lang=${encodeURIComponent(lang)}`)
      const bodyText = await res.text()
      let payload
      try {
        payload = JSON.parse(bodyText)
      } catch {
        payload = bodyText
      }
      if (!res.ok) {
        const message = typeof payload === 'object' && payload !== null && payload.message
          ? payload.message
          : 'Falha ao carregar generos'
        throw new Error(message)
      }
      const list = Array.isArray(payload) ? payload : []
      if (!Array.isArray(payload)) {
        console.warn('Resposta inesperada para generos', payload)
      }
      setGenresByLang(prev => ({ ...prev, [lang]: list }))
      return true
    } catch (err) {
      console.error('Erro ao buscar generos', err)
      setGenresByLang(prev => ({ ...prev, [lang]: [] }))
      setNotice(err.message || 'Falha ao carregar generos')
      return false
    }
  }

  function onSelectGenre(value) {
    setGenre(value)
    const next = { ...fieldsByLanguage }
    for (const lang of languages) {
      const items = genresByLang[lang] || []
      const rec = items.find(x => (x.GENRE || '').toString() === value)
      if (!rec) continue
      next[lang] = {
        ...(next[lang] || {}),
        style: rec.TONE || '',
        elements: rec.ELEMENTS || '',
        rules: rec['COMPOSITION RULES'] || '',
        techniques: rec.TECHNIQUES || '',
        lighting: rec['LIGHTING AND ATMOSPHERE'] || ''
      }
    }
    setFieldsByLanguage(next)
  }

  function setLangField(lang, key, val) {
    setFieldsByLanguage(prev => ({ ...prev, [lang]: { ...(prev[lang] || {}), [key]: val } }))
  }

  async function generateScript(lang) {
    setBusy(true)
    setNotice('')
    try {
      const ready = await ensureGenres(lang)
      if (!ready) throw new Error('Falha ao carregar generos')
      const idk = cryptoLike()
      const payload = {
        language: lang,
        genre,
        charCount,
        images: FIXED_IMAGES,
        style: fieldsByLanguage[lang]?.style || '',
        elements: fieldsByLanguage[lang]?.elements || '',
        rules: fieldsByLanguage[lang]?.rules || '',
        techniques: fieldsByLanguage[lang]?.techniques || '',
        lighting: fieldsByLanguage[lang]?.lighting || ''
      }
      const res = await fetch(`${API_BASE_URL}/ai/screenplay`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idk
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao gerar roteiro')
      const j = await res.json()
      setLangField(lang, 'screenplay', j.screenplay || '')
    } catch (e) {
      setNotice(e.message || 'Erro ao gerar roteiro')
    } finally {
      setBusy(false)
    }
  }

  function isValid() {
    if (!me) return false
    if (profileError) return false
    if (count < 1 || count > 10) return false
    if (!genre) return false
    if (!languages.length) return false
    if (![2500, 3500].includes(Number(charCount))) return false
    if (!channelId) return false
    for (const lang of languages) {
      const f = fieldsByLanguage[lang] || {}
      if (!f.screenplay || !f.screenplay.trim()) return false
    }
    if (creditsAvailable < totalCredits) return false
    return true
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValid()) return
    setBusy(true)
    setNotice('')
    try {
      const payload = {
        count: Number(count),
        languages,
        genre,
        charCount: Number(charCount),
        images: FIXED_IMAGES,
        channelId,
        fieldsByLanguage
      }
      const res = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || 'Falha ao criar videos')
      setMe(m => m ? { ...m, credits: Math.max(0, (m.credits || 0) - totalCredits) } : m)
      setNotice(`Solicitado com sucesso. Jobs: ${j.jobIds?.length || 0}`)
    } catch (e) {
      setNotice(e.message || 'Erro ao enviar geracao')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return <div>Faca login para acessar esta pagina.</div>
  }

  if (profileError) {
    return <div style={{ color: 'tomato' }}>{profileError}</div>
  }

  if (!me) {
    return <div>Carregando perfil...</div>
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 900 }}>
      <h2>Criar Videos</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CreditBadge credits={me?.credits} />
        <span>Necessarios: <strong>{totalCredits}</strong></span>
        <span style={{ marginLeft: 'auto' }}>Creditos disponiveis: {creditsAvailable}</span>
      </div>

      <label>
        Quantidade de videos (1..10)
        <input type="number" min={1} max={10} value={count}
               onChange={e => setCount(Math.max(1, Math.min(10, Number(e.target.value || 1))))} />
      </label>

      <div>
        Idiomas
        <LanguageChips value={languages} onChange={async v => {
          setLanguages(v)
          for (const lang of v) { await ensureGenres(lang) }
        }} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label>
          Caracteres
          <select value={charCount} onChange={e => setCharCount(Number(e.target.value))}>
            {CHAR_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Imagens
          <select value={FIXED_IMAGES} disabled>
            <option value={10}>10</option>
          </select>
        </label>
        <label>
          Canal YouTube
          <select value={channelId} onChange={e => setChannelId(e.target.value)}>
            {(me?.channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <label>
        Genero
        <select value={genre} onChange={e => onSelectGenre(e.target.value)}>
          <option value="">Selecione</option>
          {(genresByLang[languages[0] || 'pt-BR'] || []).map(g => (
            <option key={g.GENRE} value={g.GENRE}>{g.GENRE}</option>
          ))}
        </select>
      </label>

      {languages.map(lang => (
        <fieldset key={lang} style={{ border: '1px solid #eee', padding: 12 }}>
          <legend>{(allLanguages.find(l => l.code === lang)?.label) || lang}</legend>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>
              Roteiro
              <textarea rows={6} value={fieldsByLanguage[lang]?.screenplay || ''}
                        onChange={e => setLangField(lang, 'screenplay', e.target.value)} />
            </label>
            <div>
              <button type="button" disabled={!genre || busy} onClick={() => generateScript(lang)}>
                Gerar roteiro com IA
              </button>
            </div>
            <label>
              Estilo
              <textarea rows={2} value={fieldsByLanguage[lang]?.style || ''}
                        onChange={e => setLangField(lang, 'style', e.target.value)} />
            </label>
            <label>
              Elementos
              <textarea rows={2} value={fieldsByLanguage[lang]?.elements || ''}
                        onChange={e => setLangField(lang, 'elements', e.target.value)} />
            </label>
            <label>
              Regras de composicao
              <textarea rows={2} value={fieldsByLanguage[lang]?.rules || ''}
                        onChange={e => setLangField(lang, 'rules', e.target.value)} />
            </label>
            <label>
              Tecnicas
              <textarea rows={2} value={fieldsByLanguage[lang]?.techniques || ''}
                        onChange={e => setLangField(lang, 'techniques', e.target.value)} />
            </label>
            <label>
              Luzes e atmosfera
              <textarea rows={2} value={fieldsByLanguage[lang]?.lighting || ''}
                        onChange={e => setLangField(lang, 'lighting', e.target.value)} />
            </label>
          </div>
        </fieldset>
      ))}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <strong>Total de creditos a utilizar: {totalCredits}</strong>
        <button type="submit" disabled={!isValid() || busy}>
          Concordo e gerar videos
        </button>
      </div>

      {notice && (
        <div style={{ color: notice.startsWith('Erro') || notice.startsWith('Falha') ? 'tomato' : 'green' }}>
          {notice}
        </div>
      )}
    </form>
  )
}

function cryptoLike() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
