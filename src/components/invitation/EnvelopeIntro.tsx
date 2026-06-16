'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  groomName:  string
  brideName:  string
  guestName:  string
  themeColor: string
  onComplete: () => void
}

export default function EnvelopeIntro({
  groomName, brideName, guestName, themeColor, onComplete
}: Props) {
  const [phase, setPhase] = useState
    'enter' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'card' | 'monogram' | 'text' | 'fadeout'
  >('enter')

  const gold   = themeColor || '#C9A96E'
  const goldD  = '#8B6914'
  const goldL  = '#E8D5A3'

  const skip = useCallback(() => {
    setPhase('fadeout')
    setTimeout(onComplete, 900)
  }, [onComplete])

  useEffect(() => {
    const times: [number, typeof phase][] = [
      [400,  'flap1'],
      [900,  'flap2'],
      [1300, 'flap3'],
      [1700, 'flap4'],
      [2400, 'card'],
      [3200, 'monogram'],
      [3800, 'text'],
      [5200, 'fadeout'],
    ]
    const handles = times.map(([ms, p]) =>
      setTimeout(() => setPhase(p), ms)
    )
    const done = setTimeout(onComplete, 6100)
    return () => { handles.forEach(clearTimeout); clearTimeout(done) }
  }, [onComplete])

  const opened = ['flap1','flap2','flap3','flap4','card','monogram','text','fadeout'].includes(phase)
  const cardOut = ['card','monogram','text','fadeout'].includes(phase)
  const showMono = ['monogram','text','fadeout'].includes(phase)
  const showText = ['text','fadeout'].includes(phase)
  const fading  = phase === 'fadeout'

  const flap1 = ['flap1','flap2','flap3','flap4','card','monogram','text','fadeout'].includes(phase)
  const flap2 = ['flap2','flap3','flap4','card','monogram','text','fadeout'].includes(phase)
  const flap3 = ['flap3','flap4','card','monogram','text','fadeout'].includes(phase)
  const flap4 = ['flap4','card','monogram','text','fadeout'].includes(phase)

  return (
    <div
      onClick={skip}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     '#0A0806',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        opacity:        fading ? 0 : 1,
        transition:     fading ? 'opacity 0.9s ease' : 'none',
        overflow:       'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: `radial-gradient(ellipse 60% 50% at 50% 55%, ${gold}12 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity:    cardOut ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }} />

      {/* Floating particles */}
      {cardOut && [...Array(18)].map((_, i) => {
        const angle  = (i / 18) * 360
        const dist   = 80 + (i % 5) * 30
        const size   = 1.5 + (i % 3) * 1.2
        const delay  = (i * 0.12).toFixed(2)
        const dur    = (2.5 + (i % 4) * 0.8).toFixed(1)
        return (
          <div key={i} style={{
            position:  'absolute',
            width:     `${size}px`,
            height:    `${size}px`,
            borderRadius: '50%',
            background: i % 3 === 0 ? gold : i % 3 === 1 ? goldL : goldD,
            left:      `calc(50% + ${Math.cos(angle * Math.PI / 180) * dist}px)`,
            top:       `calc(50% + ${Math.sin(angle * Math.PI / 180) * dist * 0.6}px)`,
            opacity:   0,
            animation: `particle ${dur}s ease-in-out ${delay}s infinite`,
            pointerEvents: 'none',
          }} />
        )
      })}

      {/* Logo */}
      <p style={{
        position:    'absolute',
        top:         '32px',
        left:        '50%',
        transform:   'translateX(-50%)',
        fontFamily:  'var(--font-script, Georgia, serif)',
        fontSize:    'clamp(1.1rem, 2.5vw, 1.5rem)',
        color:       gold,
        opacity:     0.5,
        whiteSpace:  'nowrap',
        letterSpacing: '0.05em',
        pointerEvents: 'none',
      }}>
        AlmightyService
      </p>

      {/* ── ENVELOPE ── */}
      <div style={{
        position:   'relative',
        width:      'clamp(260px, 55vw, 400px)',
        height:     'clamp(182px, 38.5vw, 280px)',
        opacity:    phase === 'enter' ? 0 : 1,
        transform:  phase === 'enter' ? 'translateY(24px) scale(0.94)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Envelope body */}
        <div style={{
          position:     'absolute',
          inset:        0,
          background:   `linear-gradient(160deg, #1e1a14 0%, #13100b 100%)`,
          borderRadius: '3px 3px 6px 6px',
          border:       `1px solid ${gold}35`,
          overflow:     'hidden',
          boxShadow:    `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${gold}15, inset 0 1px 0 ${gold}20`,
        }}>
          {/* Lining pattern */}
          <div style={{
            position:   'absolute',
            inset:      0,
            backgroundImage: `repeating-linear-gradient(45deg, ${gold}06 0px, ${gold}06 1px, transparent 1px, transparent 8px)`,
          }} />
          {/* Bottom triangle */}
          <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'60%' }} viewBox="0 0 400 168" preserveAspectRatio="none">
            <polygon points="0,168 200,68 400,168" fill={`${gold}12`} />
            <polygon points="0,168 200,68 400,168" fill="none" stroke={`${gold}25`} strokeWidth="0.5" />
          </svg>
          {/* Left triangle */}
          <svg style={{ position:'absolute', top:0, left:0, width:'52%', height:'100%' }} viewBox="0 0 208 280" preserveAspectRatio="none">
            <polygon points="0,0 208,140 0,280" fill={`${gold}08`} />
          </svg>
          {/* Right triangle */}
          <svg style={{ position:'absolute', top:0, right:0, width:'52%', height:'100%' }} viewBox="0 0 208 280" preserveAspectRatio="none">
            <polygon points="208,0 0,140 208,280" fill={`${gold}08`} />
          </svg>
        </div>

        {/* ── FOUR FLAPS ── */}

        {/* Flap Left */}
        <div style={{
          position:        'absolute',
          top:             0, left: 0,
          width:           '52%', height: '100%',
          transformOrigin: 'left center',
          transform:       flap1 ? 'perspective(800px) rotateY(-35deg)' : 'perspective(800px) rotateY(0deg)',
          transition:      'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          zIndex:          flap2 ? 2 : 4,
          backfaceVisibility: 'hidden',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 208 280" preserveAspectRatio="none">
            <polygon points="0,0 208,140 0,280" fill="#1a1510" stroke={`${gold}30`} strokeWidth="0.5"/>
            <polygon points="0,0 208,140 0,280" fill={`${gold}06`}/>
          </svg>
        </div>

        {/* Flap Right */}
        <div style={{
          position:        'absolute',
          top:             0, right: 0,
          width:           '52%', height: '100%',
          transformOrigin: 'right center',
          transform:       flap2 ? 'perspective(800px) rotateY(35deg)' : 'perspective(800px) rotateY(0deg)',
          transition:      'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          zIndex:          3,
          backfaceVisibility: 'hidden',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 208 280" preserveAspectRatio="none">
            <polygon points="208,0 0,140 208,280" fill="#1a1510" stroke={`${gold}30`} strokeWidth="0.5"/>
            <polygon points="208,0 0,140 208,280" fill={`${gold}06`}/>
          </svg>
        </div>

        {/* Flap Bottom */}
        <div style={{
          position:        'absolute',
          bottom:          0, left: 0, right: 0,
          height:          '65%',
          transformOrigin: 'bottom center',
          transform:       flap3 ? 'perspective(800px) rotateX(30deg)' : 'perspective(800px) rotateX(0deg)',
          transition:      'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          zIndex:          5,
          backfaceVisibility: 'hidden',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 168" preserveAspectRatio="none">
            <polygon points="0,168 200,68 400,168" fill="#181410" stroke={`${gold}30`} strokeWidth="0.5"/>
            <polygon points="0,168 200,68 400,168" fill={`${gold}08`}/>
          </svg>
        </div>

        {/* Flap Top — with seal */}
        <div style={{
          position:        'absolute',
          top:             0, left: 0, right: 0,
          height:          '60%',
          transformOrigin: 'top center',
          transform:       flap4
            ? 'perspective(800px) rotateX(-165deg)'
            : 'perspective(800px) rotateX(0deg)',
          transition:      'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
          zIndex:          6,
          backfaceVisibility: 'hidden',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 168" preserveAspectRatio="none">
            <polygon points="0,0 400,0 200,150" fill="#1c1812" stroke={`${gold}35`} strokeWidth="0.5"/>
            <polygon points="0,0 400,0 200,150" fill={`${gold}06`}/>
            {/* Floral corner left */}
            <g stroke={`${gold}40`} strokeWidth="0.6" fill="none">
              <circle cx="28" cy="20" r="8"/>
              <circle cx="28" cy="20" r="4"/>
              <line x1="20" y1="20" x2="36" y2="20"/>
              <line x1="28" y1="12" x2="28" y2="28"/>
              <line x1="22" y1="14" x2="34" y2="26"/>
              <line x1="34" y1="14" x2="22" y2="26"/>
            </g>
            {/* Floral corner right */}
            <g stroke={`${gold}40`} strokeWidth="0.6" fill="none">
              <circle cx="372" cy="20" r="8"/>
              <circle cx="372" cy="20" r="4"/>
              <line x1="364" y1="20" x2="380" y2="20"/>
              <line x1="372" y1="12" x2="372" y2="28"/>
              <line x1="366" y1="14" x2="378" y2="26"/>
              <line x1="378" y1="14" x2="366" y2="26"/>
            </g>
            {/* Wax seal */}
            <circle cx="200" cy="88" r="22" fill={`${gold}18`} stroke={gold} strokeWidth="1"/>
            <circle cx="200" cy="88" r="17" fill={`${gold}12`} stroke={`${gold}60`} strokeWidth="0.5"/>
            <text x="200" y="94" textAnchor="middle" fill={gold} fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" opacity="0.9">A</text>
          </svg>
        </div>

        {/* ── CARD rising from envelope ── */}
        <div style={{
          position:   'absolute',
          left:       '7%', right: '7%',
          bottom:     '6%',
          background: `linear-gradient(160deg, #1f1b14 0%, #171310 100%)`,
          border:     `1px solid ${gold}30`,
          borderRadius: '3px',
          padding:    'clamp(12px, 2.5vw, 22px)',
          transform:  cardOut ? 'translateY(-90%)' : 'translateY(5%)',
          transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
          zIndex:     7,
          boxShadow:  `0 8px 40px rgba(0,0,0,0.6), 0 0 24px ${gold}10`,
          textAlign:  'center',
          overflow:   'hidden',
        }}>
          {/* Card inner border */}
          <div style={{
            position:     'absolute',
            inset:        '6px',
            border:       `1px solid ${gold}20`,
            borderRadius: '2px',
            pointerEvents:'none',
          }}/>

          {/* Corner ornaments */}
          {[[0,0,'0 0'],[0,'auto','0 0'],['auto',0,'0 0'],['auto','auto','0 0']].map((_, i) => (
            <svg key={i} style={{
              position: 'absolute',
              top:    i < 2 ? '6px' : 'auto', bottom: i >= 2 ? '6px' : 'auto',
              left:   i % 2 === 0 ? '6px' : 'auto', right: i % 2 !== 0 ? '6px' : 'auto',
              width: '16px', height: '16px',
              transform: `rotate(${i * 90}deg)`,
            }} viewBox="0 0 16 16">
              <path d="M2,14 L2,2 L14,2" stroke={`${gold}50`} strokeWidth="0.8" fill="none"/>
              <circle cx="2" cy="2" r="1.5" fill={gold} opacity="0.6"/>
            </svg>
          ))}

          {/* Monogram */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            'clamp(4px, 1vw, 8px)',
            marginBottom:   'clamp(6px, 1.5vw, 12px)',
            opacity:        showMono ? 1 : 0,
            transform:      showMono ? 'scale(1)' : 'scale(0.8)',
            transition:     'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, transparent, ${gold}50)` }}/>
            <p style={{
              fontFamily:    'Georgia, serif',
              fontSize:      'clamp(1.2rem, 3vw, 1.8rem)',
              color:         gold,
              letterSpacing: '0.15em',
              lineHeight:    1,
              margin:        0,
            }}>
              {groomName[0]}&nbsp;&amp;&nbsp;{brideName[0]}
            </p>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, ${gold}50, transparent)` }}/>
          </div>

          {/* Text content */}
          <div style={{
            opacity:    showText ? 1 : 0,
            transform:  showText ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <p style={{
              fontFamily:    'Georgia, serif',
              fontSize:      'clamp(0.75rem, 1.8vw, 1rem)',
              color:         'rgba(255,255,255,0.85)',
              lineHeight:    1.3,
              margin:        '0 0 clamp(4px,1vw,8px)',
              letterSpacing: '0.05em',
            }}>
              {groomName} &amp; {brideName}
            </p>
            <p style={{
              fontFamily:    'var(--font-body, sans-serif)',
              fontSize:      'clamp(0.55rem, 1.2vw, 0.68rem)',
              color:         `${gold}90`,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin:        '0 0 clamp(6px,1.2vw,10px)',
            }}>
              vous prient de leur faire l&apos;honneur
            </p>
            <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}40, transparent)`, margin: '0 20%' }}/>
            <p style={{
              fontFamily:    'Georgia, serif',
              fontSize:      'clamp(0.7rem, 1.6vw, 0.9rem)',
              color:         goldL,
              marginTop:     'clamp(6px,1.2vw,10px)',
              fontStyle:     'italic',
              opacity:       0.9,
              letterSpacing: '0.03em',
            }}>
              {guestName}
            </p>
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <p style={{
        position:      'absolute',
        bottom:        '24px',
        left:          '50%',
        transform:     'translateX(-50%)',
        fontFamily:    'var(--font-body, sans-serif)',
        fontSize:      'clamp(0.6rem, 1.3vw, 0.7rem)',
        color:         'rgba(255,255,255,0.15)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        whiteSpace:    'nowrap',
        pointerEvents: 'none',
      }}>
        Appuyez pour passer
      </p>

      <style>{`
        @keyframes particle {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          30%  { opacity:0.7; }
          100% { opacity:0; transform:translate(0,-28px) scale(0.2); }
        }
      `}</style>
    </div>
  )
}