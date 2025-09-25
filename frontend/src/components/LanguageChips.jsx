import React from 'react'

const languages = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', label: 'Inglês' },
  { code: 'es', label: 'Espanhol' }
]

export default function LanguageChips({ value = [], onChange }) {
  function toggle(code) {
    const set = new Set(value)
    if (set.has(code)) set.delete(code)
    else set.add(code)
    onChange(Array.from(set))
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {languages.map(l => (
        <button key={l.code}
          type="button"
          onClick={() => toggle(l.code)}
          style={{
            padding: '6px 10px',
            borderRadius: 16,
            border: `1px solid ${value.includes(l.code) ? '#0a7' : '#ccc'}`,
            background: value.includes(l.code) ? '#e9fff7' : 'white',
            cursor: 'pointer'
          }}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

export const allLanguages = languages

