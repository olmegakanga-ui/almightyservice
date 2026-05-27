'use client'

import { useEffect, useRef, useState } from 'react'
import { EventData } from '@/types/invitation'

interface Props {
  event: EventData
}

export default function FooterSection({ event }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const d = new Date(event.eventDate)
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

  return (
    <footer
      ref={sectionRef}
      style={{ padding: '120px 24px 60px', position: 'relative', textAlign: 'center' }}
    >
      {/* Gradient top vers le noir */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, transparent, rgba(13,11,9,0.8))',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Initiales monumentales */}
        <p
          className="font-script"
          style={{
            fontSize: 'clamp(56px, 10vw, 112px)',
            color: 'var(--gold)',
            opacity: 0.2,
            lineHeight: 1,
            marginBottom: '40px',
          }}
        >
          {event.groomName[0]} &amp; {event.brideName[0]}
        </p>

        {/* Prénoms complets */}
        <p
          className="font-script"
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: 'white',
            marginBottom: '32px',
            opacity: 0.85,
          }}
        >
          {event.groomName} &amp; {event.brideName}
        </p>

        {/* Date / heure en ligne */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '56px',
            padding: '14px 32px',
            borderRadius: '100px',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          <span
            className="font-display"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}
          >
            {d.getDate()} {months[d.getMonth()]} {d.getFullYear()}
          </span>
          <span style={{ width: '1px', height: '20px', background: 'rgba(201,169,110,0.2)', flexShrink: 0 }} />
          <span
            className="font-display"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}
          >
            {d.getHours()}h{String(d.getMinutes()).padStart(2,'0')}
          </span>
        </div>

        {/* Divider */}
        <div className="divider-gold" style={{ opacity: 0.2, marginBottom: '32px' }} />

        {/* Copyright */}
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', letterSpacing: '0.2em' }}>
          © {new Date().getFullYear()} INVITATION BY{' '}
          <span style={{ color: 'var(--gold)', opacity: 0.5 }}>ALMIGHTYSERVICE</span>
          {' '}· ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  )
}