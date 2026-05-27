'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, X, Clock } from 'lucide-react'

interface Props {
  deadline: string
  guestId: string
  eventId: string
  initialStatus: 'pending' | 'confirmed' | 'declined'
}

type Status = 'pending' | 'confirmed' | 'declined'

function daysLeft(deadline: string) {
  return Math.max(0, Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86400000
  ))
}

function formatDeadline(iso: string) {
  const d = new Date(iso)
  const months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc']
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
}

export default function RsvpSection({
  deadline,
  guestId,
  eventId,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const updateRsvp = async (next: Status) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, eventId, status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur réseau')
      setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const days = daysLeft(deadline)

  return (
    <section
      ref={sectionRef}
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: visible ? '50%' : '0',
          background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)',
          transition: 'height 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s',
        }}
      />

      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
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
          03
        </p>

        <p className="label-overline" style={{ marginBottom: '16px' }}>
          Confirmation de présence
        </p>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 300,
            color: 'white',
            marginBottom: '48px',
            letterSpacing: '-0.01em',
          }}
        >
          RSVP
        </h2>

        {days > 0 && status === 'pending' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '48px',
            }}
          >
            <Clock size={13} color="var(--gold)" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
              Date limite :{' '}
              <span style={{ color: 'var(--gold-light)' }}>
                {formatDeadline(deadline)}
              </span>
              {' '}· {days}j restant{days > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <p style={{
            color: '#E89AA6',
            fontSize: '0.8rem',
            marginBottom: '16px',
            padding: '10px 16px',
            background: 'rgba(184,80,96,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(184,80,96,0.2)',
          }}>
            {error}
          </p>
        )}

        {status === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => updateRsvp('confirmed')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '18px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(201,169,110,0.5)',
                background: 'rgba(201,169,110,0.1)',
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <Check size={15} />
              {loading ? 'Confirmation...' : 'Confirmer ma présence'}
            </button>

            <button
              onClick={() => updateRsvp('declined')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '16px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <X size={14} />
              {loading ? '...' : "Décliner l'invitation"}
            </button>
          </div>
        )}

        {status === 'confirmed' && (
          <div
            style={{
              padding: '48px 32px',
              borderRadius: '24px',
              background: 'rgba(90,138,106,0.08)',
              border: '1px solid rgba(90,138,106,0.25)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(90,138,106,0.15)',
                border: '1px solid rgba(90,138,106,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Check size={28} color="#7EC89A" />
            </div>
            <p
              className="font-display"
              style={{ fontSize: '1.6rem', color: '#7EC89A', marginBottom: '8px' }}
            >
              Présence confirmée
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Nous avons hâte de vous retrouver ✨
            </p>
            <button
              onClick={() => updateRsvp('pending')}
              disabled={loading}
              style={{
                marginTop: '24px',
                padding: '10px 24px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Annuler
            </button>
          </div>
        )}

        {status === 'declined' && (
          <div
            style={{
              padding: '48px 32px',
              borderRadius: '24px',
              background: 'rgba(184,80,96,0.08)',
              border: '1px solid rgba(184,80,96,0.2)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(184,80,96,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <X size={28} color="#E89AA6" />
            </div>
            <p
              className="font-display"
              style={{ fontSize: '1.6rem', color: '#E89AA6', marginBottom: '8px' }}
            >
              Invitation déclinée
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Vous nous manquerez.
            </p>
            <button
              onClick={() => updateRsvp('pending')}
              disabled={loading}
              style={{
                marginTop: '24px',
                padding: '10px 24px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Changer ma réponse
            </button>
          </div>
        )}
      </div>
    </section>
  )
}