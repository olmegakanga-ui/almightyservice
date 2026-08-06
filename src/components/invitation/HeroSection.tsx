'use client'

import { useEffect, useState } from 'react'
import { EventData, GuestData } from '@/types/invitation'
import { ChevronDown } from 'lucide-react'
import { parseEventDate } from '@/lib/date-utils'

interface Props {
  event: EventData
  guest: GuestData
}

export default function HeroSection({ event, guest }: Props) {
  const [mounted, setMounted] = useState(false)
  const { dayName: day, full: date, time } = parseEventDate(event.eventDate)

  useEffect(() => { setMounted(true) }, [])

  // Cellules d'information — construites dynamiquement
  const infoCells: { label: string; value: string }[] = [
    { label: 'Jour',  value: day },
    { label: 'Date',  value: date },
    { label: 'Heure', value: time },
  ]
  if (guest.tableName)   infoCells.push({ label: 'Table',      value: guest.tableName })
  if (event.dressCode)   infoCells.push({ label: 'Dress code', value: event.dressCode })

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: '0 20px' }}
    >
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: '220px', background: 'linear-gradient(to bottom, transparent, var(--slate-900))' }} />
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: '120px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)' }} />

      <div className="absolute top-10 left-1/2 z-20"
        style={{ transform: 'translateX(-50%)', opacity: mounted ? 1 : 0, transition: 'opacity 1.2s ease 0.2s' }}>
        <span className="label-overline" style={{ opacity: 0.5 }}>AlmightyService</span>
      </div>

      <div className="relative z-20 text-center max-w-4xl mx-auto w-full">

        <div className="mx-auto mb-10" style={{ width: mounted ? '80px' : '0px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s' }} />

        <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(60px, 12vw, 160px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 0.9, color: 'white', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(60px)', transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s' }}>
            Invitation
          </h1>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: '40px' }}>
          <p className="font-script" style={{ fontSize: 'clamp(26px, 5vw, 52px)', color: 'var(--gold)', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(40px)', transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.7s' }}>
            {event.groomName} &amp; {event.brideName}
          </p>
        </div>

        <div className="mx-auto mb-12" style={{ width: mounted ? '120px' : '0px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.9s' }} />

        {/* Nom de l'invité */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.1s', marginBottom: 'clamp(36px, 7vw, 56px)' }}>
          <p className="label-overline" style={{ opacity: 0.5, marginBottom: '20px', letterSpacing: '0.3em' }}>
            Cette invitation est adressée à
          </p>
          <h2 className="font-script" style={{ fontSize: 'clamp(32px, 6vw, 72px)', color: 'white', lineHeight: 1.2, textShadow: '0 2px 40px rgba(201,169,110,0.25)' }}>
            {guest.fullName}
          </h2>
        </div>

        {/* Barre d'infos — grille responsive */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 1.4s', marginBottom: 'clamp(40px, 8vw, 60px)' }}>
          <div
            className="info-bar glass-light"
            style={{
              display:      'grid',
              gap:          '1px',
              background:   'var(--gold-border)',
              borderRadius: 'clamp(16px, 4vw, 100px)',
              overflow:     'hidden',
              margin:       '0 auto',
              maxWidth:     '100%',
            }}
          >
            {infoCells.map((cell, i) => (
              <div
                key={i}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  textAlign:      'center',
                  padding:        'clamp(12px, 2.5vw, 16px) clamp(12px, 3vw, 28px)',
                  background:     'rgba(255,255,255,0.03)',
                  minWidth:       0,
                }}
              >
                <p className="label-overline" style={{ marginBottom: '6px', display: 'block', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {cell.label}
                </p>
                <p style={{
                  color:      'var(--gold-light)',
                  fontSize:   'clamp(0.78rem, 2.2vw, 0.9rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  textAlign:  'center',
                  lineHeight: 1.3,
                  wordBreak:  'break-word',
                }}>
                  {cell.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)', letterSpacing: '0.05em', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 'clamp(40px, 9vw, 64px)', opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}>
          Préparez-vous à vivre des instants inoubliables en notre compagnie
        </p>

        <div className="animate-bounce-arrow" style={{ opacity: mounted ? 0.6 : 0, transition: 'opacity 1s ease 2s' }}>
          <ChevronDown size={28} color="var(--gold)" />
        </div>
      </div>

      <style>{`
        /* Mobile — 2 colonnes */
        .info-bar {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          width: 100%;
          max-width: 420px;
        }
        /* Tablette — 3 colonnes */
        @media (min-width: 560px) {
          .info-bar {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            max-width: 560px;
          }
        }
        /* Desktop — tout sur une ligne */
        @media (min-width: 900px) {
          .info-bar {
            grid-template-columns: repeat(${infoCells.length}, minmax(0, auto));
            width: auto;
            max-width: none;
            display: inline-grid;
          }
        }
      `}</style>
    </section>
  )
}