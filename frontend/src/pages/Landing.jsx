import React from 'react'
import { API_BASE_URL } from '../store.js'

export default function Landing() {
  const [api, setApi] = React.useState('checking...')
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/health`).then(r => r.json()).then(j => setApi(`${j.status} v${j.version}`)).catch(() => setApi('offline'))
  }, [])
  return (
    <div>
      <h1>DarkChannelAgent</h1>
      <p>Geração automática de vídeos com orquestração por N8N, integração YouTube e créditos.</p>
      <ul>
        <li>Gere roteiros com IA</li>
        <li>Escolha idioma, gênero e estilo</li>
        <li>Publique no YouTube automaticamente</li>
      </ul>
      <p>Backend: {api}</p>
    </div>
  )
}

