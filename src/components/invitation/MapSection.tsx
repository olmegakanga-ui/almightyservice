'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  venueName: string
  venueAddress: string
  lat: number
  lng: number
}

export default function MapSection({ venueName, venueAddress, lat, lng }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

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
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng
  const embedUrl = 'https://maps.google.com/maps?q=' + lat + ',' + lng + '&z=15&output=embed'

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    borderRadius: '100px',
    border: '1px solid rgba(201,169,110,0.5)',
    background: 'rgba(201,169,110,0.1)',
    color: 'var(--gold-light)' as string,
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: '100px 24px 0', position: 'relative' }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '56px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
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
            07
          </p>

          <p className="label-overline" style={{ marginBottom: '12px' }}>
            Lieu de réception
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'white',
              letterSpacing: '-0.01em',
              marginBottom: '8px',
            }}
          >
            {venueName}
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
            {venueAddress}
          </p>
        </div>

        {/* Carte */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(201,169,110,0.15)',
            position: 'relative',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.15s',
          }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="320"
            style={{
              border: 0,
              display: 'block',
              filter: 'grayscale(40%) contrast(1.05) brightness(0.9)',
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lieu du mariage"
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(13,11,9,0.6))',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Bouton navigation */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s',
          }}
        >
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
            📍 Ouvrir l&apos;itinéraire
          </a>
        </div>

      </div>
    </section>
  )
}