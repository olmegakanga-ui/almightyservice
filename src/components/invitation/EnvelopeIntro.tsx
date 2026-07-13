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

export default function EnvelopeIntro({ groomName, brideName, guestName, themeColor, onComplete }: Props) {
  const [phase, setPhase] = useState<'idle' | 'open' | 'rise' | 'fadeout'>('idle')

  useEffect(() => {
    // Phase 1 — apparition enveloppe
    const t1 = setTimeout(() => setPhase('open'),    800)
    // Phase 2 — ouverture rabat
    const t2 = setTimeout(() => setPhase('rise'),    2200)
    // Phase 3 — carte monte
    const t3 = setTimeout(() => setPhase('fadeout'), 3800)
    // Phase 4 — disparition complète
    const t4 = setTimeout(() => onComplete(),        4800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  const gold = themeColor || '#C9A96E'

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     '#0D0B09',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        opacity:        phase === 'fadeout' ? 0 : 1,
        transition:     phase === 'fadeout' ? 'opacity 1s ease' : 'none',
        pointerEvents:  phase === 'fadeout' ? 'none' : 'all',
      }}
    >
      {/* Fond radial doré */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${gold}08 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Logo */}
      <p style={{
        fontFamily:  'var(--font-script)',
        fontSize:    'clamp(1.4rem, 3vw, 2rem)',
        color:       gold,
        opacity:     0.6,
        marginBottom:'48px',
        letterSpacing: '0.05em',
        position:    'relative',
        zIndex:      2,
      }}>
        AlmightyService
      </p>

      {/* Enveloppe */}
      <div style={{
        position:   'relative',
        width:      'clamp(280px, 50vw, 420px)',
        zIndex:     2,
        opacity:    phase === 'idle' ? 0 : 1,
        transform:  phase === 'idle' ? 'translateY(30px) scale(0.95)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Corps enveloppe */}
        <div style={{
          width:        '100%',
          paddingTop:   '65%',
          background:   `linear-gradient(145deg, #1a1510, #120f0a)`,
          border:       `1px solid ${gold}40`,
          borderRadius: '4px 4px 8px 8px',
          position:     'relative',
          boxShadow:    `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${gold}10`,
          overflow:     'hidden',
        }}>

          {/* Lignes décoratives intérieures */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${gold}05 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${gold}05 25%, transparent 25%) -10px 0`, backgroundSize: '20px 20px' }} />

          {/* Diagonales bas enveloppe */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%' }} viewBox="0 0 420 160" preserveAspectRatio="none">
            <polygon points="0,160 210,60 420,160" fill={`${gold}18`} />
            <polygon points="0,160 210,60 420,160" fill="none" stroke={`${gold}30`} strokeWidth="0.5" />
          </svg>
        </div>

        {/* Rabat supérieur — s'ouvre */}
        <div style={{
          position:       'absolute',
          top:            0,
          left:           0,
          right:          0,
          height:         '55%',
          transformOrigin:'top center',
          transform:      phase === 'open' || phase === 'rise' || phase === 'fadeout'
            ? 'perspective(600px) rotateX(-160deg)'
            : 'perspective(600px) rotateX(0deg)',
          transition:     'transform 1s cubic-bezier(0.4,0,0.2,1)',
          zIndex:         3,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 420 160" preserveAspectRatio="none">
            <polygon points="0,0 420,0 210,140" fill="#1a1510" stroke={`${gold}40`} strokeWidth="0.5" />
            {/* Sceau central */}
            <circle cx="210" cy="60" r="20" fill={`${gold}20`} stroke={`${gold}60`} strokeWidth="1" />
            <text x="210" y="65" textAnchor="middle" fill={gold} fontSize="14" fontFamily="serif" opacity="0.8">A</text>
          </svg>
        </div>

        {/* Carte qui sort de l'enveloppe */}
        <div style={{
          position:   'absolute',
          left:       '8%',
          right:      '8%',
          bottom:     '5%',
          background: `linear-gradient(160deg, #1e1812, #16120d)`,
          border:     `1px solid ${gold}35`,
          borderRadius:'4px',
          padding:    'clamp(16px, 3vw, 28px)',
          transform:  phase === 'rise' || phase === 'fadeout'
            ? 'translateY(-85%)'
            : 'translateY(10%)',
          transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1)',
          zIndex:     phase === 'rise' || phase === 'fadeout' ? 5 : 1,
          boxShadow:  `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${gold}15`,
          textAlign:  'center',
        }}>

          {/* Ligne décorative top */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}60, transparent)`, marginBottom: 'clamp(10px, 2vw, 16px)' }} />

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', letterSpacing: '0.3em', textTransform: 'uppercase', color: `${gold}80`, marginBottom: 'clamp(6px, 1.5vw, 10px)' }}>
            Invitation
          </p>

          <p style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', color: 'white', lineHeight: 1.2, marginBottom: 'clamp(4px, 1vw, 8px)' }}>
            {groomName} &amp; {brideName}
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.6rem, 1.3vw, 0.72rem)', color: `rgba(255,255,255,0.45)`, marginBottom: 'clamp(6px, 1.5vw, 12px)', fontStyle: 'italic' }}>
            vous prient de leur faire l&apos;honneur
          </p>

          <p style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', color: gold, opacity: 0.9 }}>
            {guestName}
          </p>

          {/* Ligne décorative bottom */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}60, transparent)`, marginTop: 'clamp(10px, 2vw, 16px)' }} />
        </div>
      </div>

      {/* Texte invitation sous enveloppe */}
      <p style={{
        marginTop:   '40px',
        fontFamily:  'var(--font-body)',
        fontSize:    'clamp(0.65rem, 1.5vw, 0.75rem)',
        letterSpacing:'0.25em',
        textTransform:'uppercase',
        color:       `rgba(255,255,255,0.2)`,
        position:    'relative',
        zIndex:      2,
        opacity:     phase === 'rise' || phase === 'fadeout' ? 1 : 0,
        transition:  'opacity 0.8s ease 0.5s',
      }}>
        Découvrez votre invitation
      </p>

      {/* Particules dorées */}
      {(phase === 'rise' || phase === 'fadeout') && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position:     'absolute',
                width:        `${2 + Math.random() * 3}px`,
                height:       `${2 + Math.random() * 3}px`,
                borderRadius: '50%',
                background:   gold,
                left:         `${20 + Math.random() * 60}%`,
                top:          `${30 + Math.random() * 40}%`,
                opacity:      0,
                animation:    `particle${i % 3} 1.5s ease-out ${i * 0.1}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes particle0 {
          0%   { opacity: 0; transform: translate(0, 0) scale(1); }
          20%  { opacity: 0.8; }
          100% { opacity: 0; transform: translate(${Math.random() > 0.5 ? '' : '-'}${30 + Math.floor(Math.random() * 60)}px, -${40 + Math.floor(Math.random() * 80)}px) scale(0); }
        }
        @keyframes particle1 {
          0%   { opacity: 0; transform: translate(0, 0) scale(1); }
          20%  { opacity: 0.6; }
          100% { opacity: 0; transform: translate(${Math.random() > 0.5 ? '' : '-'}${20 + Math.floor(Math.random() * 50)}px, -${30 + Math.floor(Math.random() * 70)}px) scale(0); }
        }
        @keyframes particle2 {
          0%   { opacity: 0; transform: translate(0, 0) scale(1); }
          20%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(${Math.random() > 0.5 ? '' : '-'}${40 + Math.floor(Math.random() * 40)}px, -${50 + Math.floor(Math.random() * 60)}px) scale(0); }
        }
      `}</style>
    </div>
  )
}