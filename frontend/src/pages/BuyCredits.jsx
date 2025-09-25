import React from 'react'
import { useAuthStore, API_BASE_URL } from '../store.js'

const PACKS = [5, 30, 90]

export default function BuyCredits() {
  const token = useAuthStore(s => s.session?.access_token)
  const [pack, setPack] = React.useState(PACKS[0])
  const [error, setError] = React.useState('')

  async function checkout() {
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/payments/checkout`, {
        method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId: pack })
      })
      const j = await res.json(); if (!res.ok) throw new Error(j?.message || 'Erro')
      window.location.href = j.checkoutUrl
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <h2>Comprar Créditos</h2>
      <p>Cada crédito custa R$ 30,00.</p>
      <label>
        Plano
        <select value={pack} onChange={e => setPack(Number(e.target.value))}>
          {PACKS.map(p => <option key={p} value={p}>{p} créditos</option>)}
        </select>
      </label>
      <div>
        <button onClick={checkout}>Ir para pagamento</button>
      </div>
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
    </div>
  )
}

