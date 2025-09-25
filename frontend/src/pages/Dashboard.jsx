import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

export default function Dashboard() {
  const session = useAuthStore(s => s.session)
  const [me, setMe] = React.useState(null)
  const token = session?.access_token

  React.useEffect(() => {
    if (!token) return
    fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json()).then(setMe).catch(() => setMe(null))
  }, [token])

  if (!me) return <div>Carregando...</div>
  return (
    <div>
      <h2>Bem-vindo(a)</h2>
      <p>E-mail: {me.email}</p>
      <p>Créditos: {me.credits}</p>
      <h3>Seus canais YouTube</h3>
      <ul>
        {me.channels?.map(c => <li key={c.id}>{c.name}</li>) || <li>Nenhum canal</li>}
      </ul>
    </div>
  )
}

