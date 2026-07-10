'use client'

import { useEffect, useState } from 'react'

interface Props {
  groomName:  string
  brideName:  string
  guestName:  string
  themeColor: string
  eventDate:  string
  venueName:  string
  onComplete: () => void
}

type Phase = 'idle' | 'seal-out' | 'open' | 'fadeout'

// Dérive des teintes claires/foncées depuis la couleur du thème
function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return hex
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp(parseInt(h.slice(0, 2), 16) + amount)
  const g = clamp(parseInt(h.slice(2, 4), 16) + amount)
  const b = clamp(parseInt(h.slice(4, 6), 16) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

export default function EnvelopeIntro({
  groomName, brideName, themeColor, onComplete,
}: Props) {
  const [phase, setPhase]         = useState<Phase>('idle')
  const [reduced, setReduced]     = useState(false)

  const base  = themeColor || '#C9A96E'
  const light = shade(base, 45)
  const dark  = shade(base, -55)
  const deep  = shade(base, -90)

  const initials = `${(groomName?.[0] ?? '').toUpperCase()} · ${(brideName?.[0] ?? '').toUpperCase()}`

  // Respect de prefers-reduced-motion — on saute l'animation
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setReduced(true)
      const t = setTimeout(onComplete, 200)
      return () => clearTimeout(t)
    }
  }, [onComplete])

  // Séquence automatique (même logique de timers qu'avant)
  useEffect(() => {
    if (reduced) return
    const t1 = setTimeout(() => setPhase('seal-out'), 1400) // le sceau part
    const t2 = setTimeout(() => setPhase('open'),     1900) // les rabats s'ouvrent
    const t3 = setTimeout(() => setPhase('fadeout'),  3400) // fondu de l'overlay
    const t4 = setTimeout(() => onComplete(),         4400) // retrait du DOM
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [reduced, onComplete])

  if (reduced) return null

  const opened = phase === 'open' || phase === 'fadeout'

  // Style commun d'un rabat
  const flapBase: React.CSSProperties = {
    position:           'absolute',
    inset:              0,
    backfaceVisibility: 'hidden',
    transition:         'transform 1.2s cubic-bezier(0.45,0,0.2,1)',
    willChange:         'transform',
  }

  return (
    <div
      aria-hidden
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     deep,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        opacity:        phase === 'fadeout' ? 0 : 1,
        transition:     'opacity 1s ease',
        pointerEvents:  phase === 'fadeout' ? 'none' : 'all',
        perspective:    '1200px',
      }}
    >
      {/* Lueur radiale dérivée du thème */}
      <div style={{
        position:      'absolute',
        inset:         0,
        background:    `radial-gradient(ellipse at 50% 50%, ${base}14 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Conteneur des 4 rabats (carré centré, responsive) */}
      <div style={{
        position: 'relative',
        width:    'min(150vw, 150vh)',
        height:   'min(150vw, 150vh)',
        transformStyle: 'preserve-3d',
      }}>

        {/* RABAT HAUT — pivote vers le haut (rotateX négatif) */}
        <div style={{
          ...flapBase,
          transformOrigin: 'center top',
          transform:       opened ? 'rotateX(-115deg)' : 'rotateX(0deg)',
          transitionDelay: '0s',
          clipPath:        'polygon(0 0, 100% 0, 50% 50%)',
          background:      `linear-gradient(180deg, ${light} 0%, ${base} 100%)`,
          boxShadow:       `inset 0 2px 6px ${dark}55`,
        }} />

        {/* RABAT BAS — pivote vers le bas (rotateX positif) */}
        <div style={{
          ...flapBase,
          transformOrigin: 'center bottom',
          transform:       opened ? 'rotateX(115deg)' : 'rotateX(0deg)',
          transitionDelay: '0.15s',
          clipPath:        'polygon(0 100%, 100% 100%, 50% 50%)',
          background:      `linear-gradient(0deg, ${dark} 0%, ${base} 100%)`,
          boxShadow:       `inset 0 -2px 6px ${dark}55`,
        }} />

        {/* RABAT GAUCHE — pivote vers la gauche (rotateY positif) */}
        <div style={{
          ...flapBase,
          transformOrigin: 'left center',
          transform:       opened ? 'rotateY(115deg)' : 'rotateY(0deg)',
          transitionDelay: '0.3s',
          clipPath:        'polygon(0 0, 0 100%, 50% 50%)',
          background:      `linear-gradient(90deg, ${light} 0%, ${base} 100%)`,
          boxShadow:       `inset 2px 0 6px ${dark}55`,
        }} />

        {/* RABAT DROIT — pivote vers la droite (rotateY négatif) */}
        <div style={{
          ...flapBase,
          transformOrigin: 'right center',
          transform:       opened ? 'rotateY(-115deg)' : 'rotateY(0deg)',
          transitionDelay: '0.45s',
          clipPath:        'polygon(100% 0, 100% 100%, 50% 50%)',
          background:      `linear-gradient(270deg, ${dark} 0%, ${base} 100%)`,
          boxShadow:       `inset -2px 0 6px ${dark}55`,
        }} />
      </div>

      {/* SCEAU central — part en premier (fade + scale-down) */}
      <div style={{
        position:       'absolute',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         5,
        opacity:        phase === 'idle' ? 1 : 0,
        transform:      phase === 'idle' ? 'scale(1)' : 'scale(0.7)',
        transition:     'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents:  'none',
      }}>
        <div style={{
          width:          'clamp(64px, 14vw, 92px)',
          height:         'clamp(64px, 14vw, 92px)',
          borderRadius:   '50%',
          background:     `radial-gradient(circle at 38% 32%, ${light}, ${dark})`,
          border:         `1px solid ${light}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      `0 6px 20px ${deep}, inset 0 0 12px ${deep}55`,
        }}>
          <span style={{
            fontFamily:    'var(--font-script, serif)',
            fontSize:      'clamp(1rem, 3vw, 1.5rem)',
            color:         '#fff',
            letterSpacing: '0.08em',
            textShadow:    `0 1px 3px ${deep}`,
          }}>
            {initials}
          </span>
        </div>
      </div>
    </div>
  )
}