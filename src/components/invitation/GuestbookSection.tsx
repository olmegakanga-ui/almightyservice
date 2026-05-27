'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Heart } from 'lucide-react'

interface Props {
  guestId: string
  eventId: string
  guestName: string
  initialMessage: string | null
}

export default function GuestbookSection({
  guestId,
  eventId,
  guestName,
  initialMessage,
}: Props) {
  const [message, setMessage] = useState(initialMessage ?? '')
  const [submitted, setSubmitted] = useState(!!initialMessage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const MAX = 500

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, eventId, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur réseau')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p
            className="font-display"
            style={{
              fontSize: '6rem',
              fontWeight: 300,
              color: 'var(--gold)',
              opacity: 0.06,
              lineHeight: 1,
              marginBottom: '-32px',
              userSelect: 'none',
            }}
          >
            06
          </p>
          <p className="label-overline" style={{ marginBottom: '12px' }}>
            Livre d&apos;or
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'white',
              letterSpacing: '-0.01em',
            }}
          >
            Laissez un message
          </h2>
        </div>

        {!submitted ? (
          <div>
            {error && (
              <p style={{
                color: '#E89AA6',
                fontSize: '0.8rem',
                marginBottom: '16px',
                padding: '10px 16px',
                background: 'rgba(184,80,96,0.1)',
                borderRadius: '8px',
              }}>
                {error}
              </p>
            )}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <textarea
                value={message}
                onChange={e => {
                  if (e.target.value.length <= MAX) setMessage(e.target.value)
                }}
                placeholder={guestName.split(' ')[0] + ', vos vœux aux mariés…'}
                rows={6}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(201,169,110,0.2)',
                  borderRadius: '20px',
                  padding: '24px',
                  color: 'white',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  resize: 'none',
                  outline: 'none',
                  caretColor: 'var(--gold)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(201,169,110,0.2)' }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '18px',
                  fontSize: '0.72rem',
                  color: message.length > MAX * 0.85
                    ? '#E89AA6'
                    : 'rgba(255,255,255,0.2)',
                }}
              >
                {message.length}/{MAX}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '18px',
                borderRadius: '100px',
                border: '1px solid rgba(201,169,110,0.4)',
                background: message.trim() ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.03)',
                color: message.trim() ? 'var(--gold-light)' : 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: message.trim() && !loading ? 'pointer' : 'not-allowed',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <Send size={14} />
              {loading ? 'Envoi…' : 'Envoyer mon message'}
            </button>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '56px 32px',
              borderRadius: '24px',
              background: 'rgba(201,169,110,0.05)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}
          >
            <Heart
              size={36}
              color="var(--gold)"
              fill="rgba(201,169,110,0.3)"
              style={{ margin: '0 auto 20px', display: 'block' }}
            />
            <p
              className="font-display"
              style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}
            >
              Votre message a été transmis
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Les mariés seront touchés par vos mots 💛
            </p>
          </div>
        )}
      </div>
    </section>
  )
}