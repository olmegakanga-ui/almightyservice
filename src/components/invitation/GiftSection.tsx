'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  guestId: string
  eventId: string
  initialChoice: 'envelope' | 'present' | null
}

type GiftType = 'envelope' | 'present' | null

const options = [
  {
    id: 'envelope' as const,
    label: 'Enveloppe',
    sub: 'Don en espèces',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="4" width="20" height="16" rx="3"/>
        <path d="M2 7l10 7 10-7"/>
      </svg>
    ),
  },
  {
    id: 'present' as const,
    label: 'Présent',
    sub: 'Cadeau emballé',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="8" width="18" height="14" rx="2"/>
        <path d="M12 8V22M2 13h20"/>
        <path d="M12 8C12 8 10 4 8 4S6 6 8 6s4-2 4-2M12 8C12 8 14 4 16 4s2 2 0 2-4-2-4-2"/>
      </svg>
    ),
  },
]

export default function GiftSection({ guestId, eventId, initialChoice }: Props) {
  const [choice, setChoice] = useState<GiftType>(initialChoice)
  const [saving, setSaving] = useState(false)
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

  const select = async (id: GiftType) => {
    const next = choice === id ? null : id
    setChoice(next)
    if (!next) return

    setSaving(true)
    try {
      await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, eventId, giftType: next }),
      })
    } catch (err) {
      console.error('Erreur sauvegarde cadeau:', err)
    } finally {
      setSaving(false)
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
            07
          </p>
          <p className="label-overline" style={{ marginBottom: '12px' }}>
            Votre présent
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
            Type de cadeau
          </h2>
          {saving && (
            <p style={{ color: 'var(--gold)', fontSize: '0.75rem', marginTop: '8px' }}>
              Sauvegarde...
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {options.map((opt, i) => {
            const isSel = choice === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => select(opt.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  padding: '40px 24px',
                  borderRadius: '24px',
                  background: isSel ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.02)',
                  border: isSel
                    ? '1px solid rgba(201,169,110,0.5)'
                    : '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  transform: isSel ? 'translateY(-4px)' : 'translateY(0)',
                  color: isSel ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                  opacity: visible ? 1 : 0,
                  transitionDelay: i * 0.08 + 's',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: isSel ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
                    border: isSel
                      ? '1px solid rgba(201,169,110,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    color: isSel ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {opt.icon}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p
                    className="font-display"
                    style={{
                      fontSize: '1.3rem',
                      color: isSel ? 'var(--gold-light)' : 'rgba(255,255,255,0.7)',
                      marginBottom: '4px',
                    }}
                  >
                    {opt.label}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                    {opt.sub}
                  </p>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isSel ? 'var(--gold)' : 'transparent',
                    border: isSel ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {isSel && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="#0D0B09"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {choice && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Sélectionné :{' '}
            <span style={{ color: 'var(--gold)' }}>
              {choice === 'envelope' ? 'une enveloppe' : 'un présent'}
            </span>
          </p>
        )}
      </div>
    </section>
  )
}