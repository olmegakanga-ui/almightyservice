'use client'

import { useEffect, useState } from 'react'
import { EventData, GuestData } from '@/types/invitation'
import { ChevronDown } from 'lucide-react'

interface Props {
  event: EventData
  guest: GuestData
}

function formatEventDate(isoString: string) {
  const date = new Date(isoString)
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  return {
    day: days[date.getDay()],
    date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
    time: `${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`,
  }
}

export default function HeroSection({ event, guest }: Props) {
  const [mounted, setMounted] = useState(false)
  const { day, date, time } = formatEventDate(event.eventDate)
  const firstName = guest.fullName.split(' ')[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: '0 24px' }}
    >
      {/* Gradient bas — transition vers sections suivantes */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '220px',
          background: 'linear-gradient(to bottom, transparent, var(--slate-900))',
        }}
      />

      {/* Gradient haut léger */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
        }}
      />

      {/* Badge AlmightyService — top center */}
      <div
        className="absolute top-10 left-1/2 z-20"
        style={{
          transform: 'translateX(-50%)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.2s ease 0.2s',
        }}
      >
        <span className="label-overline" style={{ opacity: 0.5 }}>
          AlmightyService
        </span>
      </div>

      {/* Contenu principal — disposition verticale centrée */}
      <div className="relative z-20 text-center max-w-4xl mx-auto w-full">

        {/* Ligne décorative top */}
        <div
          className="mx-auto mb-10"
          style={{
            width: mounted ? '80px' : '0px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
        />

        {/* "Invitation" — mot-titre géant */}
        <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(72px, 12vw, 160px)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              color: 'white',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(60px)',
              transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s',
            }}
          >
            Invitation
          </h1>
        </div>

        {/* Nom des mariés — script doré */}
        <div style={{ overflow: 'hidden', marginBottom: '40px' }}>
          <p
            className="font-script"
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              color: 'var(--gold)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.7s',
            }}
          >
            {event.groomName} &amp; {event.brideName}
          </p>
        </div>

        {/* Divider doré animé */}
        <div
          className="mx-auto mb-12"
          style={{
            width: mounted ? '120px' : '0px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.9s',
          }}
        />

        {/* Nom de l'invité — zone principale droite */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.1s',
            marginBottom: '48px',
          }}
        >
          <p className="label-overline mb-4" style={{ opacity: 0.5 }}>
            Cette invitation est adressée à
          </p>
          <h2
            className="font-script"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              color: 'white',
              lineHeight: 1.1,
              textShadow: '0 2px 40px rgba(201,169,110,0.25)',
            }}
          >
            {guest.fullName}
          </h2>
        </div>

        {/* Infos événement — ligne horizontale élégante */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 1.4s',
            marginBottom: '60px',
          }}
        >
          <div
            className="glass-light inline-flex items-center gap-6 md:gap-10 px-8 py-4 rounded-full"
            style={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <div className="text-center">
              <p className="label-overline mb-1">Jour</p>
              <p style={{ color: 'var(--gold-light)', fontSize: '0.9rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                {day}
              </p>
            </div>

            <div style={{ width: '1px', height: '32px', background: 'var(--gold-border)', flexShrink: 0 }} />

            <div className="text-center">
              <p className="label-overline mb-1">Date</p>
              <p style={{ color: 'var(--gold-light)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
                {date}
              </p>
            </div>

            <div style={{ width: '1px', height: '32px', background: 'var(--gold-border)', flexShrink: 0 }} />

            <div className="text-center">
              <p className="label-overline mb-1">Heure</p>
              <p style={{ color: 'var(--gold-light)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
                {time}
              </p>
            </div>

            {guest.tableName && (
              <>
                <div style={{ width: '1px', height: '32px', background: 'var(--gold-border)', flexShrink: 0 }} />
                <div className="text-center">
                  <p className="label-overline mb-1">Table</p>
                  <p style={{ color: 'var(--gold-light)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
                    {guest.tableName}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Texte d'invite */}
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            marginBottom: '64px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1s ease 1.6s',
          }}
        >
          Préparez-vous à vivre des instants inoubliables en notre compagnie
        </p>

        {/* Flèche scroll */}
        <div
          className="animate-bounce-arrow"
          style={{
            opacity: mounted ? 0.6 : 0,
            transition: 'opacity 1s ease 2s',
          }}
        >
          <ChevronDown
            size={28}
            color="var(--gold)"
          />
        </div>

      </div>
    </section>
  )
}