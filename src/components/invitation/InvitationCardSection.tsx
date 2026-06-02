'use client'

import { useEffect, useRef, useState } from 'react'
import { EventData, GuestData } from '@/types/invitation'

interface Props {
  event: EventData
  guest: GuestData
}

function formatDate(isoString: string): string {
  const date   = new Date(isoString)
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function extractTime(isoString: string): string {
  if (!isoString.includes('T')) return '00h00'
  const timePart = isoString.split('T')[1].slice(0, 5)
  const [h, m]   = timePart.split(':')
  return `${h}h${m}`
}

export default function InvitationCardSection({ event, guest }: Props) {
  const sectionRef            = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const dateFormatted         = formatDate(event.eventDate)
  const timeFormatted         = extractTime(event.eventDate)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: '120px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(48px, 6vw, 96px)', alignItems: 'start' }}>

          {/* Colonne gauche — texte invitation */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1)' }}>
            <p className="font-display" style={{ fontSize: '7rem', fontWeight: 300, color: 'var(--gold)', opacity: 0.08, lineHeight: 1, marginBottom: '-40px', userSelect: 'none' }}>
              01
            </p>
            <p className="label-overline" style={{ marginBottom: '24px', opacity: 0.9 }}>Invitation</p>

            <h2 className="font-script" style={{ fontSize: 'clamp(40px, 5vw, 64px)', color: 'white', lineHeight: 1.1, marginBottom: '32px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {guest.fullName}
            </h2>

            <p className="font-display" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '40px', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
              {event.invitationText}
            </p>

            <div style={{ borderLeft: '2px solid var(--gold)', marginBottom: '40px', background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: '0 12px 12px 0' }}>
              <p className="font-display" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: 'var(--gold-light)', marginBottom: '4px', fontWeight: 500 }}>
                {dateFormatted}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                à {timeFormatted} — {event.venueName}
              </p>
            </div>

            <p className="font-script" style={{ fontSize: '2rem', color: 'var(--gold)', opacity: 0.85, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Cordialement,<br />
              <span style={{ opacity: 0.95, fontSize: '2.4rem' }}>
                {event.groomName} &amp; {event.brideName}
              </span>
            </p>
          </div>

          {/* Colonne droite — programme */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(30px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>
            <p className="font-display" style={{ fontSize: '7rem', fontWeight: 300, color: 'var(--gold)', opacity: 0.08, lineHeight: 1, marginBottom: '-40px', userSelect: 'none' }}>
              02
            </p>
            <p className="label-overline" style={{ marginBottom: '40px', opacity: 0.9 }}>Programme du jour</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {event.programItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display:             'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap:                 '24px',
                    padding:             '24px 0',
                    borderBottom:        idx < event.programItems.length - 1 ? '1px solid rgba(201,169,110,0.2)' : 'none',
                    opacity:             visible ? 1 : 0,
                    transform:           visible ? 'translateY(0)' : 'translateY(20px)',
                    transition:          `all 0.8s cubic-bezier(0.16,1,0.3,1) ${0.3 + idx * 0.1}s`,
                  }}
                >
                  <p className="font-display" style={{ fontSize: '1.3rem', color: 'var(--gold)', opacity: 1, paddingTop: '2px', fontWeight: 500 }}>
                    {item.time}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', lineHeight: 1.6, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Lieu */}
            <div style={{ marginTop: '40px', padding: '20px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(201,169,110,0.3)', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div>
                <p className="label-overline" style={{ marginBottom: '4px', opacity: 0.7 }}>Lieu</p>
                <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', fontWeight: 500 }}>{event.venueName}</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginTop: '2px' }}>{event.venueAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}