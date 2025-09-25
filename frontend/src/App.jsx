import React from 'react'
import { Link, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from './store.js'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreateVideos from './pages/CreateVideos.jsx'
import MyVideos from './pages/MyVideos.jsx'
import Admin from './pages/Admin.jsx'
import YouTube from './pages/YouTube.jsx'
import BuyCredits from './pages/BuyCredits.jsx'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

function Protected({ children }) {
  const session = useAuthStore(s => s.session)
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const navigate = useNavigate()
  const { session, setSession } = useAuthStore()

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => sub?.subscription?.unsubscribe()
  }, [setSession])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">DarkChannelAgent</Link>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          {session && <Link to="/app">App</Link>}
          {session && <Link to="/create">Criar Vídeos</Link>}
          {session && <Link to="/videos">Meus Vídeos</Link>}
          {session && <Link to="/youtube">YouTube</Link>}
          {session && <Link to="/buy">Comprar Créditos</Link>}
          {session && <Link to="/admin">Admin</Link>}
          {!session && <Link to="/login">Entrar</Link>}
          {!session && <Link to="/register">Cadastrar</Link>}
          {session && (
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>
              Sair
            </button>
          )}
        </nav>
      </header>
      <main style={{ marginTop: 24 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Protected><Dashboard /></Protected>} />
          <Route path="/create" element={<Protected><CreateVideos /></Protected>} />
          <Route path="/videos" element={<Protected><MyVideos /></Protected>} />
          <Route path="/youtube" element={<Protected><YouTube /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="/buy" element={<Protected><BuyCredits /></Protected>} />
        </Routes>
      </main>
    </div>
  )
}
