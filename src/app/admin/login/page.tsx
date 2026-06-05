'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Send, Check, AlertCircle } from 'lucide-react'

function LoginForm() {
  const [mode, setMode]         = useState<'password' | 'magic'>('magic')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [sent, setSent]         = useState(false)
  const router                  = useRouter()
  const searchParams            = useSearchParams()
  const reason                  = searchParams.get('reason')

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase  = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push('/admin/events')
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase  = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '14px 16px',
    background:   'rgba(255,255,255,0.04)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color:        'white',
    fontFamily:   'var(--font-body)',
    fontSize:     '0.9rem',
    outline:      'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Fond décoratif */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--font-script)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '8px' }}>
            AlmightyService
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
            Administration
          </p>
        </div>

        {/* Message raison (lien expiré ou invalide) */}
        {reason === 'expired' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(184,80,96,0.08)', border: '1px solid rgba(184,80,96,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
            <AlertCircle size={16} color="#E89AA6" style={{ flexShrink: 0 }} />
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Ce lien n&apos;est plus actif — le mariage est terminé ou archivé.
            </p>
          </div>
        )}

        {reason === 'invalid' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(184,80,96,0.08)', border: '1px solid rgba(184,80,96,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
            <AlertCircle size={16} color="#E89AA6" style={{ flexShrink: 0 }} />
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Lien invalide ou révoqué. Contactez AlmightyService.
            </p>
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '24px', padding: '40px' }}>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: 'white', marginBottom: '28px', textAlign: 'center' }}>
            Connexion
          </h1>

          {/* Onglets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
            <button
              onClick={() => { setMode('magic'); setError(null); setSent(false) }}
              style={{
                padding:        '10px',
                borderRadius:   '10px',
                border:         mode === 'magic' ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background:     mode === 'magic' ? 'rgba(201,169,110,0.1)' : 'transparent',
                color:          mode === 'magic' ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
                cursor:         'pointer',
                fontSize:       '0.78rem',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '6px',
                transition:     'all 0.2s ease',
              }}
            >
              <Mail size={13} /> Lien magique
            </button>
            <button
              onClick={() => { setMode('password'); setError(null); setSent(false) }}
              style={{
                padding:        '10px',
                borderRadius:   '10px',
                border:         mode === 'password' ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background:     mode === 'password' ? 'rgba(201,169,110,0.1)' : 'transparent',
                color:          mode === 'password' ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
                cursor:         'pointer',
                fontSize:       '0.78rem',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '6px',
                transition:     'all 0.2s ease',
              }}
            >
              <Lock size={13} /> Mot de passe
            </button>
          </div>

          {/* ── Magic Link envoyé ── */}
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(90,138,106,0.15)', border: '1px solid rgba(90,138,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={28} color="#7EC89A" />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#7EC89A', marginBottom: '8px' }}>
                Lien envoyé !
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Consultez votre boîte mail{' '}
                <span style={{ color: 'var(--gold-light)' }}>{email}</span>{' '}
                et cliquez sur le lien de connexion.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Utiliser un autre email
              </button>
            </div>
          ) : (
            <>
              {/* ── Mode Magic Link ── */}
              {mode === 'magic' && (
                <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '10px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      Pour les <span style={{ color: 'var(--gold-light)' }}>Mariés</span> et l&apos;équipe{' '}
                      <span style={{ color: '#7EC89A' }}>Protocole</span> — un lien de connexion sera envoyé à votre email.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="votre@email.com"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px', border: '1px solid rgba(184,80,96,0.2)' }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: '8px', padding: '16px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Send size={14} />
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </form>
              )}

              {/* ── Mode Mot de passe ── */}
              {mode === 'password' && (
                <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '10px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      Réservé aux <span style={{ color: '#F5A623' }}>Super Admins</span> — connexion avec email et mot de passe.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px', border: '1px solid rgba(184,80,96,0.2)' }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: '8px', padding: '16px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease' }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
          AlmightyService © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Chargement...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}