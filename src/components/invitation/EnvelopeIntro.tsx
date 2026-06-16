'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  groomName:  string
  brideName:  string
  guestName:  string
  themeColor: string
  onComplete: () => void
}

type Phase =
  | 'enter'
  | 'flap_left'
  | 'flap_right'
  | 'flap_top'
  | 'flap_bottom'
  | 'open'
  | 'butterfly'
  | 'cordially'
  | 'names'
  | 'fadeout'

export default function EnvelopeIntro({
  groomName, brideName, guestName, themeColor, onComplete
}: Props) {
  const [phase, setPhase] = useState<Phase>('enter')

  const pink   = themeColor || '#E8B4B8'
  const pinkD  = '#C4858A'
  const pinkL  = '#F5D5D7'
  const silver = '#C8C0BC'

  const skip = useCallback(() => {
    setPhase('fadeout')
    setTimeout(onComplete, 1000)
  }, [onComplete])

  useEffect(() => {
    const seq: [number, Phase][] = [
      [500,  'flap_left'],
      [1100, 'flap_right'],
      [1700, 'flap_top'],
      [2300, 'flap_bottom'],
      [3000, 'open'],
      [3800, 'butterfly'],
      [4600, 'cordially'],
      [5600, 'names'],
      [7200, 'fadeout'],
    ]
    const handles = seq.map(([ms, p]) => setTimeout(() => setPhase(p), ms))
    const done    = setTimeout(onComplete, 8200)
    return () => { handles.forEach(clearTimeout); clearTimeout(done) }
  }, [onComplete])

  const flapLeft   = ['flap_left','flap_right','flap_top','flap_bottom','open','butterfly','cordially','names','fadeout'].includes(phase)
  const flapRight  = ['flap_right','flap_top','flap_bottom','open','butterfly','cordially','names','fadeout'].includes(phase)
  const flapTop    = ['flap_top','flap_bottom','open','butterfly','cordially','names','fadeout'].includes(phase)
  const flapBottom = ['flap_bottom','open','butterfly','cordially','names','fadeout'].includes(phase)
  const isOpen     = ['open','butterfly','cordially','names','fadeout'].includes(phase)
  const showBfly   = ['butterfly','cordially','names','fadeout'].includes(phase)
  const showCord   = ['cordially','names','fadeout'].includes(phase)
  const showNames  = ['names','fadeout'].includes(phase)
  const fading     = phase === 'fadeout'

  // Floral SVG pattern
  const FloralPattern = ({ color }: { color: string }) => (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
      {/* Branche gauche */}
      <g stroke={color} strokeWidth="0.8" fill="none" opacity="0.6">
        <path d="M30,80 Q45,120 35,180 Q25,240 40,300 Q55,360 40,420"/>
        <path d="M35,120 Q15,110 10,90"/>
        <circle cx="10" cy="88" r="5" fill={color} opacity="0.5"/>
        <circle cx="8" cy="84" r="3" fill={color} opacity="0.4"/>
        <circle cx="13" cy="91" r="3.5" fill={color} opacity="0.45"/>
        <path d="M33,180 Q12,165 8,145"/>
        <circle cx="7" cy="143" r="6" fill={color} opacity="0.5"/>
        <circle cx="4" cy="138" r="3.5" fill={color} opacity="0.4"/>
        <circle cx="10" cy="147" r="4" fill={color} opacity="0.45"/>
        <path d="M38,260 Q18,248 14,228"/>
        <circle cx="13" cy="226" r="7" fill={color} opacity="0.55"/>
        <circle cx="9" cy="220" r="4" fill={color} opacity="0.4"/>
        <circle cx="16" cy="230" r="4.5" fill={color} opacity="0.45"/>
        <circle cx="10" cy="225" r="2.5" fill={color} opacity="0.35"/>
        <path d="M40,340 Q22,325 18,305"/>
        <circle cx="17" cy="303" r="6" fill={color} opacity="0.5"/>
        <circle cx="14" cy="297" r="3.5" fill={color} opacity="0.4"/>
      </g>
      {/* Branche droite */}
      <g stroke={color} strokeWidth="0.8" fill="none" opacity="0.6">
        <path d="M370,100 Q355,150 365,210 Q375,270 360,330 Q345,390 360,450"/>
        <path d="M365,140 Q385,130 390,110"/>
        <circle cx="391" cy="108" r="6" fill={color} opacity="0.55"/>
        <circle cx="394" cy="103" r="3.5" fill={color} opacity="0.4"/>
        <circle cx="388" cy="111" r="4" fill={color} opacity="0.45"/>
        <path d="M367,210 Q388,198 392,178"/>
        <circle cx="393" cy="176" r="7" fill={color} opacity="0.55"/>
        <circle cx="396" cy="170" r="4" fill={color} opacity="0.4"/>
        <circle cx="390" cy="180" r="4.5" fill={color} opacity="0.45"/>
        <path d="M362,300 Q382,288 386,268"/>
        <circle cx="387" cy="266" r="6" fill={color} opacity="0.5"/>
        <circle cx="390" cy="260" r="3.5" fill={color} opacity="0.4"/>
        <path d="M358,380 Q376,366 380,346"/>
        <circle cx="381" cy="344" r="7" fill={color} opacity="0.55"/>
        <circle cx="384" cy="338" r="4" fill={color} opacity="0.4"/>
        <circle cx="378" cy="348" r="4.5" fill={color} opacity="0.45"/>
      </g>
      {/* Pétales épars */}
      {[
        [80,50],[160,30],[280,40],[320,80],
        [100,200],[300,180],[60,350],[340,320],
        [130,480],[260,500],[200,150],
      ].map(([x,y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="4" ry="6"
          fill={color} opacity="0.25"
          transform={`rotate(${i * 35}, ${x}, ${y})`}/>
      ))}
    </svg>
  )

  // Butterfly SVG
  const Butterfly = () => (
    <svg viewBox="0 0 200 140" style={{ width:'clamp(120px,30vw,180px)', height:'auto' }}>
      <defs>
        <radialGradient id="wing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pinkL} stopOpacity="0.9"/>
          <stop offset="60%" stopColor={pink} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={pinkD} stopOpacity="0.5"/>
        </radialGradient>
      </defs>
      {/* Aile gauche haut */}
      <path d="M100,70 Q60,20 20,30 Q10,55 30,75 Q55,90 100,80" fill="url(#wing)" stroke={pinkD} strokeWidth="0.8" opacity="0.85"/>
      {/* Aile droite haut */}
      <path d="M100,70 Q140,20 180,30 Q190,55 170,75 Q145,90 100,80" fill="url(#wing)" stroke={pinkD} strokeWidth="0.8" opacity="0.85"/>
      {/* Aile gauche bas */}
      <path d="M100,80 Q50,95 35,120 Q55,135 85,115 Q98,100 100,90" fill="url(#wing)" stroke={pinkD} strokeWidth="0.7" opacity="0.75"/>
      {/* Aile droite bas */}
      <path d="M100,80 Q150,95 165,120 Q145,135 115,115 Q102,100 100,90" fill="url(#wing)" stroke={pinkD} strokeWidth="0.7" opacity="0.75"/>
      {/* Nervures ailes */}
      <path d="M100,75 Q70,45 35,38" stroke={pinkD} strokeWidth="0.5" fill="none" opacity="0.5"/>
      <path d="M100,75 Q130,45 165,38" stroke={pinkD} strokeWidth="0.5" fill="none" opacity="0.5"/>
      <path d="M100,82 Q75,100 50,118" stroke={pinkD} strokeWidth="0.4" fill="none" opacity="0.4"/>
      <path d="M100,82 Q125,100 150,118" stroke={pinkD} strokeWidth="0.4" fill="none" opacity="0.4"/>
      {/* Corps */}
      <ellipse cx="100" cy="80" rx="4" ry="18" fill={pinkD} opacity="0.9"/>
      <circle cx="100" cy="62" r="4" fill={pinkD} opacity="0.9"/>
      {/* Antennes */}
      <path d="M100,62 Q88,48 82,38" stroke={pinkD} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <circle cx="82" cy="37" r="2" fill={pinkD} opacity="0.7"/>
      <path d="M100,62 Q112,48 118,38" stroke={pinkD} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <circle cx="118" cy="37" r="2" fill={pinkD} opacity="0.7"/>
    </svg>
  )

  return (
    <div
      onClick={skip}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        overflow:       'hidden',
        background:     isOpen ? '#FAFAF8' : '#0A0806',
        opacity:        fading ? 0 : 1,
        transition:     fading
          ? 'opacity 1s ease'
          : isOpen
            ? 'background 1s ease'
            : 'none',
      }}
    >

      {/* ── Particules roses (fond blanc) ── */}
      {showBfly && [...Array(20)].map((_, i) => (
        <div key={i} style={{
          position:     'absolute',
          width:        `${2 + (i % 4)}px`,
          height:       `${2 + (i % 4)}px`,
          borderRadius: '50%',
          background:   i % 2 === 0 ? pink : pinkL,
          left:         `${5 + (i * 17 % 90)}%`,
          top:          `${10 + (i * 13 % 80)}%`,
          opacity:      0,
          animation:    `floatDot ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* ── ENVELOPPE ── */}
      <div style={{
        position:   'relative',
        width:      'clamp(260px, 70vw, 360px)',
        height:     'clamp(390px, 105vw, 540px)',
        opacity:    phase === 'enter' ? 0 : isOpen ? 0 : 1,
        transform:  phase === 'enter'
          ? 'scale(0.9) translateY(20px)'
          : isOpen ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.8s ease, transform 1s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Corps enveloppe */}
        <div style={{
          position:     'absolute',
          inset:        0,
          background:   `linear-gradient(160deg, ${pinkL} 0%, ${pink} 60%, ${pinkD} 100%)`,
          borderRadius: '4px',
          border:       `1px solid ${pinkD}40`,
          overflow:     'hidden',
          boxShadow:    `0 32px 80px rgba(0,0,0,0.35), 0 8px 24px ${pink}40`,
        }}>
          <FloralPattern color={pinkD} />
          {/* Triangle bas */}
          <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'55%' }} viewBox="0 0 360 300" preserveAspectRatio="none">
            <polygon points="0,300 180,80 360,300" fill={`${pinkD}25`}/>
            <polygon points="0,300 180,80 360,300" fill="none" stroke={`${pinkD}40`} strokeWidth="0.5"/>
          </svg>
        </div>

        {/* ── RABAT GAUCHE ── */}
        <div style={{
          position:           'absolute',
          top:0, left:0,
          width:              '55%', height:'100%',
          transformOrigin:    'left center',
          transform:          flapLeft
            ? 'perspective(900px) rotateY(-42deg)'
            : 'perspective(900px) rotateY(0deg)',
          transition:         'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             2,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'4px 0 0 4px' }}>
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(160deg, ${pinkL} 0%, ${pink} 100%)`,
            }}>
              <FloralPattern color={pinkD}/>
            </div>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 198 540" preserveAspectRatio="none">
              <polygon points="0,0 198,270 0,540" fill={`${pinkD}15`}/>
              <polygon points="0,0 198,270 0,540" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── RABAT DROIT ── */}
        <div style={{
          position:           'absolute',
          top:0, right:0,
          width:              '55%', height:'100%',
          transformOrigin:    'right center',
          transform:          flapRight
            ? 'perspective(900px) rotateY(42deg)'
            : 'perspective(900px) rotateY(0deg)',
          transition:         'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             3,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'0 4px 4px 0' }}>
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(200deg, ${pinkL} 0%, ${pink} 100%)`,
            }}>
              <FloralPattern color={pinkD}/>
            </div>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 198 540" preserveAspectRatio="none">
              <polygon points="198,0 0,270 198,540" fill={`${pinkD}15`}/>
              <polygon points="198,0 0,270 198,540" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── RABAT BAS ── */}
        <div style={{
          position:           'absolute',
          bottom:0, left:0, right:0,
          height:             '60%',
          transformOrigin:    'bottom center',
          transform:          flapBottom
            ? 'perspective(900px) rotateX(38deg)'
            : 'perspective(900px) rotateX(0deg)',
          transition:         'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             4,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'0 0 4px 4px' }}>
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(180deg, ${pinkL} 0%, ${pink} 100%)`,
            }}>
              <FloralPattern color={pinkD}/>
            </div>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 360 324" preserveAspectRatio="none">
              <polygon points="0,324 180,80 360,324" fill={`${pinkD}20`}/>
              <polygon points="0,324 180,80 360,324" fill="none" stroke={`${pinkD}40`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── RABAT HAUT — avec sceau ── */}
        <div style={{
          position:           'absolute',
          top:0, left:0, right:0,
          height:             '58%',
          transformOrigin:    'top center',
          transform:          flapTop
            ? 'perspective(900px) rotateX(-168deg)'
            : 'perspective(900px) rotateX(0deg)',
          transition:         'transform 0.75s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             5,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'4px 4px 0 0' }}>
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(170deg, ${pinkL} 0%, ${pink} 70%, ${pinkD} 100%)`,
            }}>
              <FloralPattern color={pinkD}/>
            </div>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 360 312" preserveAspectRatio="none">
              <polygon points="0,0 360,0 180,260" fill={`${pinkD}20`}/>
              <polygon points="0,0 360,0 180,260" fill="none" stroke={`${pinkD}40`} strokeWidth="0.6"/>
              {/* Sceau argent */}
              <circle cx="180" cy="175" r="28" fill={silver} opacity="0.9"/>
              <circle cx="180" cy="175" r="22" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8"/>
              <circle cx="180" cy="175" r="16" fill="none" stroke="white" strokeWidth="0.8" opacity="0.6"/>
              <text x="180" y="181" textAnchor="middle" fill="white" fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" opacity="0.95">A</text>
            </svg>
          </div>
        </div>

        {/* Intérieur nacré visible quand ouvert */}
        <div style={{
          position:   'absolute',
          inset:      '8%',
          background: `linear-gradient(135deg, #F8F4F0 0%, #FFFFFF 50%, #F5EEE8 100%)`,
          borderRadius:'2px',
          opacity:    flapBottom ? 1 : 0,
          transition: 'opacity 0.4s ease',
          zIndex:     1,
          boxShadow:  'inset 0 0 30px rgba(200,180,160,0.15)',
        }}/>
      </div>

      {/* ── CONTENU FOND BLANC ── */}
      <div style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        opacity:        showBfly ? 1 : 0,
        transition:     'opacity 0.8s ease',
        pointerEvents:  showBfly ? 'none' : 'none',
      }}>

        {/* Papillon */}
        <div style={{
          opacity:    showBfly ? 1 : 0,
          transform:  showBfly ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
          transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          marginBottom: 'clamp(24px, 5vw, 48px)',
          animation:  showBfly ? 'flutter 3s ease-in-out infinite' : 'none',
        }}>
          <Butterfly />
        </div>

        {/* "You're cordially invited" */}
        <div style={{
          textAlign:  'center',
          opacity:    showCord ? 1 : 0,
          transform:  showCord ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(0.7rem, 1.8vw, 0.9rem)',
            color:         pink,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            margin:        '0 0 4px',
            opacity:       0.8,
          }}>
            Vous êtes
          </p>
          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(1.4rem, 4vw, 2rem)',
            color:         '#2C2420',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin:        '0 0 4px',
            fontWeight:    400,
          }}>
            Cordialement
          </p>
          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(0.7rem, 1.8vw, 0.9rem)',
            color:         pink,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            margin:        0,
            opacity:       0.8,
          }}>
            Invité(e)
          </p>
        </div>

        {/* Noms des mariés */}
        <div style={{
          textAlign:  'center',
          marginTop:  'clamp(20px, 4vw, 36px)',
          opacity:    showNames ? 1 : 0,
          transform:  showNames ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          position:   'relative',
        }}>
          {/* Grand & en arrière-plan */}
          <p style={{
            position:   'absolute',
            top:        '50%',
            left:       '50%',
            transform:  'translate(-50%, -50%)',
            fontFamily: 'Georgia, serif',
            fontSize:   'clamp(4rem, 12vw, 7rem)',
            color:      pink,
            opacity:    0.12,
            lineHeight: 1,
            margin:     0,
            userSelect: 'none',
          }}>
            &amp;
          </p>

          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(0.65rem, 1.6vw, 0.8rem)',
            color:         '#888',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin:        '0 0 8px',
          }}>
            Se marient
          </p>

          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(1.6rem, 5vw, 2.4rem)',
            color:         '#2C2420',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin:        '0 0 2px',
            fontWeight:    400,
            position:      'relative',
            zIndex:        1,
          }}>
            {groomName}
          </p>
          <p style={{
            fontFamily:    'Georgia, serif',
            fontSize:      'clamp(1.6rem, 5vw, 2.4rem)',
            color:         '#2C2420',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin:        0,
            fontWeight:    400,
            position:      'relative',
            zIndex:        1,
          }}>
            {brideName}
          </p>
        </div>
      </div>

      {/* Skip hint */}
      <p style={{
        position:      'absolute',
        bottom:        '20px',
        left:          '50%',
        transform:     'translateX(-50%)',
        fontFamily:    'Georgia, serif',
        fontSize:      'clamp(0.55rem, 1.2vw, 0.65rem)',
        color:         isOpen ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        whiteSpace:    'nowrap',
        pointerEvents: 'none',
        margin:        0,
        transition:    'color 0.5s ease',
      }}>
        Appuyez pour passer
      </p>

      <style>{`
        @keyframes flutter {
          0%,100% { transform: translateY(0) scaleY(1); }
          25%      { transform: translateY(-6px) scaleY(0.95); }
          75%      { transform: translateY(-3px) scaleY(0.97); }
        }
        @keyframes floatDot {
          0%,100% { opacity:0; transform:translateY(0); }
          30%     { opacity:0.5; }
          70%     { opacity:0.3; }
          100%    { opacity:0; transform:translateY(-20px); }
        }
      `}</style>
    </div>
  )
}