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

  React.useEffect(() => {
    if (!token) return
    fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json()).then(j => { setMe(j); if (j.channels?.length) setChannelId(j.channels[0].id) })
      .catch(() => setMe(null))
  }, [token])

  // Load genres per language when needed
  async function ensureGenres(lang) {
    if (genresByLang[lang]) return
    const res = await fetch(`${API_BASE_URL}/genres?lang=${encodeURIComponent(lang)}`)
    const list = await res.json()
    setGenresByLang(prev => ({ ...prev, [lang]: list }))
  }

  function onSelectGenre(value) {
    setGenre(value)
    // Pre-fill fields for selected languages from genre record
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
    setBusy(true); setNotice('')
    try {
      await ensureGenres(lang)
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
    if (count < 1 || count > 10) return false
    if (!genre) return false
    if (!languages.length) return false
    if (![2500, 3500].includes(Number(charCount))) return false
    if (!channelId) return false
    for (const lang of languages) {
      const f = fieldsByLanguage[lang] || {}
      if (!f.screenplay || !f.screenplay.trim()) return false
    }
    if ((me?.credits ?? 0) < totalCredits) return false
    return true
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValid()) return
    setBusy(true); setNotice('')
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
      if (!res.ok) throw new Error(j?.message || 'Falha ao criar vídeos')
      // Ajusta saldo local
      setMe(m => ({ ...m, credits: (m.credits || 0) - totalCredits }))
      setNotice(`Solicitado com sucesso. Jobs: ${j.jobIds?.length || 0}`)
    } catch (e) {
      setNotice(e.message || 'Erro ao enviar geração')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 900 }}>
      <h2>Criar Vídeos</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CreditBadge credits={me?.credits} />
        <span>Necessários: <strong>{totalCredits}</strong></span>
      </div>

      <label>
        Quantidade de vídeos (1..10)
        <input type="number" min={1} max={10} value={count}
               onChange={e => setCount(Math.max(1, Math.min(10, Number(e.target.value||1))))} />
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

      {/* Genre selection (per language DB but a single chosen genre name) */}
      <label>
        Gênero
        <select value={genre} onChange={e => onSelectGenre(e.target.value)}>
          <option value="">Selecione</option>
          {/* Show PT list by default or first selected language list */}
          {(genresByLang[languages[0] || 'pt-BR'] || []).map(g => (
            <option key={g.GENRE} value={g.GENRE}>{g.GENRE}</option>
          ))}
        </select>
      </label>

      {/* Text fields per language */}
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
              Regras de composição
              <textarea rows={2} value={fieldsByLanguage[lang]?.rules || ''}
                        onChange={e => setLangField(lang, 'rules', e.target.value)} />
            </label>
            <label>
              Técnicas
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
        <strong>Total de créditos a utilizar: {totalCredits}</strong>
        <button type="submit" disabled={!isValid() || busy}>
          Concordo e gerar vídeos
        </button>
      </div>

      {notice && <div style={{ color: notice.startsWith('Erro') || notice.startsWith('Falha') ? 'tomato' : 'green' }}>{notice}</div>}
    </form>
  )
}

function cryptoLike() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

