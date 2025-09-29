import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

export default function Dashboard() {
  const session = useAuthStore(s => s.session)
  const token = session?.access_token
  const [me, setMe] = React.useState(null)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!token) {
      setMe(null)
      return
    }
    let cancelled = false
    async function loadProfile() {
      setError('')
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.message || 'Falha ao carregar perfil')
        if (!cancelled) setMe(payload)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Falha ao carregar perfil')
          setMe(null)
        }
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [token])

  if (!token) {
    return <div>Faca login para acessar o painel.</div>
  }

  if (error) {
    return <div style={{ color: 'tomato' }}>{error}</div>
  }

  if (!me) {
    return <div>Carregando perfil...</div>
  }

  return (
    <div>
      <h2>Bem-vindo(a)</h2>
      <p>E-mail: {me.email}</p>
      <p>Creditos: {me.credits}</p>
      <h3>Seus canais YouTube</h3>
      <ul>
        {me.channels?.length
          ? me.channels.map(channel => <li key={channel.id}>{channel.name}</li>)
          : <li>Nenhum canal</li>}
      </ul>
    </div>
  )
}
