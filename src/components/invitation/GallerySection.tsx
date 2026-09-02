'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  images:     string[]
  groomName:  string
  brideName:  string
}

export default function GallerySection({ images, groomName, brideName }: Props) {
  const sectionRef            = useRef<HTMLElement>(null)
  const scrollRef             = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive]   = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Apparition au défilement
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Fermeture de la vue plein écran au clavier
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(i => i === null ? null : Math.min(images.length - 1, i + 1))
      if (e.key === 'ArrowLeft')  setLightbox(i => i === null ? null : Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, images.length])

  // Suit la photo au centre du carrousel
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.72))
    setActive(Math.max(0, Math.min(images.length - 1, idx)))
  }

  const scrollTo = (idx: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth * 0.72, behavior: 'smooth' })
  }

  if (!images || images.length === 0) return null

  return (
    <section ref={sectionRef} style={{ padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* En-tête */}
        <div style={{
          textAlign:    'center',
          padding:      '0 24px',
          marginBottom: '40px',
          opacity:      visible ? 1 : 0,
          transform:    visible ? 'translateY(0)' : 'translateY(24px)',
          transition:   'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <p className="label-overline" style={{ marginBottom: '14px', opacity: 0.9 }}>
            Notre album
          </p>
          <h2 className="font-script" style={{
            fontSize:   'clamp(32px, 5vw, 56px)',
            color:      'var(--gold-light)',
            lineHeight: 1.2,
            textShadow: '0 2px 18px rgba(0,0,0,0.7)',
          }}>
            {groomName} &amp; {brideName}
          </h2>
          <div className="divider-gold" style={{ marginTop: '20px' }} />
        </div>

        {/* Carrousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="gallery-scroll"
          style={{
            opacity:    visible ? 1 : 0,
            transition: 'opacity 1s ease 0.2s',
          }}
        >
          {images.map((url, idx) => (
            <button
              key={url + idx}
              onClick={() => setLightbox(idx)}
              className="gallery-item"
              aria-label={'Agrandir la photo ' + (idx + 1)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={'Photo ' + (idx + 1) + ' de ' + groomName + ' et ' + brideName}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '28px', padding: '0 24px' }}>
            <button
              onClick={() => scrollTo(Math.max(0, active - 1))}
              aria-label="Photo précédente"
              className="gallery-nav"
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={'Aller à la photo ' + (i + 1)}
                  style={{
                    width:        i === active ? '22px' : '7px',
                    height:       '7px',
                    borderRadius: '100px',
                    border:       'none',
                    padding:      0,
                    background:   i === active ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
                    cursor:       'pointer',
                    transition:   'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => scrollTo(Math.min(images.length - 1, active + 1))}
              aria-label="Photo suivante"
              className="gallery-nav"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Vue plein écran */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         2000,
            background:     'rgba(0,0,0,0.94)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '20px',
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
            aria-label="Fermer"
            style={{
              position: 'fixed', top: '20px', right: '20px',
              width: '42px', height: '42px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          {lightbox > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1) }}
              aria-label="Photo précédente"
              className="gallery-nav"
              style={{ position: 'fixed', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {lightbox < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1) }}
              aria-label="Photo suivante"
              className="gallery-nav"
              style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightbox]}
            alt={'Photo ' + (lightbox + 1)}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth:     '100%',
              maxHeight:    '88vh',
              objectFit:    'contain',
              borderRadius: '8px',
              boxShadow:    '0 20px 80px rgba(0,0,0,0.8)',
            }}
          />

          <p style={{
            position:  'fixed',
            bottom:    '20px',
            left:      0,
            right:     0,
            textAlign: 'center',
            color:     'rgba(255,255,255,0.45)',
            fontSize:  '0.8rem',
            fontFamily:'var(--font-body)',
          }}>
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}

      <style>{`
        .gallery-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 0 24px 8px;
          scrollbar-width: none;
        }
        .gallery-scroll::-webkit-scrollbar { display: none; }

        .gallery-item {
          flex: 0 0 auto;
          width: 72vw;
          max-width: 340px;
          aspect-ratio: 3 / 4;
          scroll-snap-align: center;
          border-radius: 16px;
          overflow: hidden;
          padding: 0;
          border: 1px solid var(--gold-border);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease;
        }
        .gallery-item:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
        }

        @media (min-width: 900px) {
          .gallery-scroll { padding: 0 48px 8px; justify-content: flex-start; }
          .gallery-item { width: 300px; }
        }

        .gallery-nav {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid var(--gold-border);
          background: rgba(0,0,0,0.45);
          color: var(--gold-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.25s ease;
          z-index: 2010;
        }
        .gallery-nav:hover {
          background: rgba(0,0,0,0.7);
          border-color: var(--gold);
        }
      `}</style>
    </section>
  )
}
