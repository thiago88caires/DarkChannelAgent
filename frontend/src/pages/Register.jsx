import React from 'react'
import { supabase } from '../App.jsx'

export default function Register() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [ok, setOk] = React.useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setOk('Cadastro realizado! Verifique seu e-mail para confirmar.')
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <h2>Cadastrar</h2>
      <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
      {ok && <div style={{ color: 'green' }}>{ok}</div>}
      <button type="submit">Cadastrar</button>
    </form>
  )
}

