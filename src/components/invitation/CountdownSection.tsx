'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  eventDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isToday: boolean
  isPast: boolean
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (diff <= 0) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const targetStart = new Date(targetDate)
    targetStart.setHours(0, 0, 0, 0)
    const isToday = todayStart.getTime() === targetStart.getTime()
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday, isPast: !isToday }
  }

  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isToday: false,
    isPast:  false,
  }
}

interface TimeUnitProps {
  value: number
  label: string
  large?: boolean
}

function TimeUnit({ value, label, large = false }: TimeUnitProps) {
  const [flash, setFlash] = useState(false)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(true)
      prevRef.current = value
      const t = setTimeout(() => setFlash(false), 350)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        flex: large ? '0 0 auto' : '0 0 auto',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: large
            ? 'clamp(56px, 10vw, 110px)'
            : 'clamp(36px, 6vw, 68px)',
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: large ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
          opacity: flash ? 0.4 : 1,
          transform: flash ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'block',
          minWidth: large ? '2ch' : '2ch',
          textAlign: 'center',
        }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function CountdownSection({ eventDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(eventDate))
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [eventDate])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ padding: '80px 24px', position: 'relative' }}
    >
      {/* Ligne décorative top */}
      <div
        style={{
          width: visible ? '200px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
          margin: '0 auto 64px',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}
      >
        {/* Cas : aujourd'hui */}
        {mounted && timeLeft?.isToday && (
          <div>
            <p
              className="font-script"
              style={{
                fontSize: 'clamp(48px, 8vw, 96px)',
                color: 'var(--gold)',
                lineHeight: 1.1,
                marginBottom: '16px',
              }}
            >
              C&apos;est aujourd&apos;hui !
            </p>
            <p
              className="font-display"
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
              }}
            >
              Le grand jour est arrivé 🎊
            </p>
          </div>
        )}

        {/* Cas : passé */}
        {mounted && timeLeft?.isPast && (
          <p
            className="font-script"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              color: 'var(--gold)',
              opacity: 0.7,
            }}
          >
            Merci d&apos;avoir partagé ce moment
          </p>
        )}

        {/* Cas : countdown actif */}
        {(!mounted || !timeLeft || (!timeLeft.isToday && !timeLeft.isPast)) && (
          <>
            {/* Label discret */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '48px',
              }}
            >
              Le mariage dans
            </p>

            {/* Chiffres */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 'clamp(12px, 3vw, 40px)',
                flexWrap: 'nowrap',
              }}
            >
              <TimeUnit
                value={mounted && timeLeft ? timeLeft.days : 0}
                label="Jours"
                large
              />

              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(24px, 5vw, 56px)',
                  color: 'var(--gold)',
                  opacity: 0.2,
                  fontWeight: 300,
                  paddingBottom: 'clamp(16px, 3vw, 28px)',
                  flexShrink: 0,
                }}
              >
                :
              </span>

              <TimeUnit
                value={mounted && timeLeft ? timeLeft.hours : 0}
                label="Heures"
              />

              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(18px, 3vw, 36px)',
                  color: 'var(--gold)',
                  opacity: 0.15,
                  fontWeight: 300,
                  paddingBottom: 'clamp(10px, 2vw, 18px)',
                  flexShrink: 0,
                }}
              >
                :
              </span>

              <TimeUnit
                value={mounted && timeLeft ? timeLeft.minutes : 0}
                label="Minutes"
              />

              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(12px, 2vw, 24px)',
                  color: 'var(--gold)',
                  opacity: 0.1,
                  fontWeight: 300,
                  paddingBottom: 'clamp(6px, 1.5vw, 12px)',
                  flexShrink: 0,
                }}
              >
                :
              </span>

              <TimeUnit
                value={mounted && timeLeft ? timeLeft.seconds : 0}
                label="Secondes"
              />
            </div>

            {/* Phrase italique */}
            <p
              className="font-display"
              style={{
                marginTop: '56px',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                letterSpacing: '0.05em',
              }}
            >
              Chaque seconde nous rapproche de ce moment inoubliable
            </p>
          </>
        )}
      </div>

      {/* Ligne décorative bas */}
      <div
        style={{
          width: visible ? '200px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
          margin: '64px auto 0',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s',
        }}
      />
    </section>
  )
}