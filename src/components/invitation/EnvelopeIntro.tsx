'use client'

import { useEffect, useState, useCallback } from 'react'
import { EventData } from '@/types/invitation'

interface Props {
  groomName:    string
  brideName:    string
  guestName:    string
  themeColor:   string
  eventDate:    string
  venueName:    string
  onComplete:   () => void
}

type Phase =
  | 's1_closed'
  | 's2_flap_lr'
  | 's2_flap_tb'
  | 's3_card'
  | 's4_cordially'
  | 's5_names'
  | 's6_date'
  | 's7_formal'
  | 's8_monogram'
  | 's9_fadeout'

function extractDateParts(iso: string) {
  const date   = new Date(iso)
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  const timePart = iso.includes('T') ? iso.split('T')[1].slice(0,5).replace(':','h') : '19h00'
  return {
    day:   days[date.getDay()],
    date:  `${date.getDate()} • ${String(date.getMonth()+1).padStart(2,'0')} • ${date.getFullYear()}`,
    time:  timePart,
    month: months[date.getMonth()],
    year:  date.getFullYear(),
  }
}

export default function EnvelopeIntro({
  groomName, brideName, guestName, themeColor, eventDate, venueName, onComplete
}: Props) {
  const [phase, setPhase] = useState<Phase>('s1_closed')

  const pink  = themeColor || '#E8B4B8'
  const pinkD = (() => {
    const hex = pink.replace('#','')
    const r   = Math.max(0, parseInt(hex.slice(0,2),16) - 40)
    const g   = Math.max(0, parseInt(hex.slice(2,4),16) - 40)
    const b   = Math.max(0, parseInt(hex.slice(4,6),16) - 40)
    return `rgb(${r},${g},${b})`
  })()
  const pinkL = (() => {
    const hex = pink.replace('#','')
    const r   = Math.min(255, parseInt(hex.slice(0,2),16) + 40)
    const g   = Math.min(255, parseInt(hex.slice(2,4),16) + 40)
    const b   = Math.min(255, parseInt(hex.slice(4,6),16) + 40)
    return `rgb(${r},${g},${b})`
  })()

  const dp = extractDateParts(eventDate)

  const skip = useCallback(() => {
    setPhase('s9_fadeout')
    setTimeout(onComplete, 1000)
  }, [onComplete])

  useEffect(() => {
    const seq: [number, Phase][] = [
      [2000,  's2_flap_lr'],
      [3500,  's2_flap_tb'],
      [5000,  's3_card'],
      [8000,  's4_cordially'],
      [12000, 's5_names'],
      [16000, 's6_date'],
      [20000, 's7_formal'],
      [24000, 's8_monogram'],
      [28000, 's9_fadeout'],
    ]
    const handles = seq.map(([ms, p]) => setTimeout(() => setPhase(p), ms))
    const done    = setTimeout(onComplete, 30000)
    return () => { handles.forEach(clearTimeout); clearTimeout(done) }
  }, [onComplete])

  const flapLR     = ['s2_flap_lr','s2_flap_tb','s3_card','s4_cordially','s5_names','s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const flapTB     = ['s2_flap_tb','s3_card','s4_cordially','s5_names','s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showCard   = ['s3_card','s4_cordially','s5_names','s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showCord   = ['s4_cordially','s5_names','s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showNames  = ['s5_names','s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showDate   = ['s6_date','s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showFormal = ['s7_formal','s8_monogram','s9_fadeout'].includes(phase)
  const showMono   = ['s8_monogram','s9_fadeout'].includes(phase)
  const fading     = phase === 's9_fadeout'

  const envelopeVisible = !showCard
  const cardPhase       = showCard

  // Fond : clair dès l'ouverture
  const bgColor = flapTB
    ? '#FDF8F5'
    : phase === 's1_closed' ? '#FDF8F5' : '#FDF8F5'

  // ── Floral pattern ──────────────────────────────────────
  const Florals = ({ opacity = 0.5 }: { opacity?: number }) => (
    <g stroke={pinkD} strokeWidth="0.7" fill="none" opacity={opacity}>
      {/* Coin haut gauche */}
      <path d="M15,15 Q25,35 20,55"/>
      <circle cx="11" cy="30" r="5" fill={pink} opacity="0.6"/><circle cx="8" cy="25" r="3" fill={pinkL} opacity="0.5"/>
      <circle cx="14" cy="38" r="4" fill={pink} opacity="0.5"/><circle cx="10" cy="22" r="2.5" fill={pinkL} opacity="0.4"/>
      <path d="M15,15 Q5,25 8,38"/><path d="M18,35 Q8,40 5,52"/>
      {/* Coin haut droit */}
      <path d="M385,15 Q375,35 380,55"/>
      <circle cx="389" cy="30" r="5" fill={pink} opacity="0.6"/><circle cx="392" cy="25" r="3" fill={pinkL} opacity="0.5"/>
      <circle cx="386" cy="38" r="4" fill={pink} opacity="0.5"/>
      <path d="M385,15 Q395,25 392,38"/><path d="M382,35 Q392,40 395,52"/>
      {/* Coin bas gauche */}
      <path d="M15,545 Q25,525 20,505"/>
      <circle cx="11" cy="530" r="5" fill={pink} opacity="0.6"/><circle cx="14" cy="520" r="4" fill={pink} opacity="0.5"/>
      <path d="M15,545 Q5,535 8,522"/>
      {/* Coin bas droit */}
      <path d="M385,545 Q375,525 380,505"/>
      <circle cx="389" cy="530" r="5" fill={pink} opacity="0.6"/><circle cx="386" cy="520" r="4" fill={pink} opacity="0.5"/>
      <path d="M385,545 Q395,535 392,522"/>
      {/* Pétales épars */}
      {[[60,80],[320,60],[180,20],[80,480],[300,500],[150,520],[250,30]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="4" ry="7" fill={pink} opacity="0.3"
          transform={`rotate(${i*45},${x},${y})`}/>
      ))}
    </g>
  )

  // ── Butterfly ───────────────────────────────────────────
  const Butterfly = ({ size = 120 }: { size?: number }) => (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} style={{ filter:`drop-shadow(0 4px 12px ${pink}40)` }}>
      <defs>
        <radialGradient id="wg" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor={pinkL} stopOpacity="0.95"/>
          <stop offset="70%" stopColor={pink} stopOpacity="0.75"/>
          <stop offset="100%" stopColor={pinkD} stopOpacity="0.5"/>
        </radialGradient>
      </defs>
      <path d="M100,70 Q55,15 15,28 Q5,55 28,78 Q58,95 100,82" fill="url(#wg)" stroke={pinkD} strokeWidth="0.8"/>
      <path d="M100,70 Q145,15 185,28 Q195,55 172,78 Q142,95 100,82" fill="url(#wg)" stroke={pinkD} strokeWidth="0.8"/>
      <path d="M100,82 Q48,98 33,122 Q55,138 88,118 Q99,102 100,92" fill="url(#wg)" stroke={pinkD} strokeWidth="0.6" opacity="0.85"/>
      <path d="M100,82 Q152,98 167,122 Q145,138 112,118 Q101,102 100,92" fill="url(#wg)" stroke={pinkD} strokeWidth="0.6" opacity="0.85"/>
      <path d="M100,74 Q72,42 32,36" stroke={pinkD} strokeWidth="0.5" fill="none" opacity="0.4"/>
      <path d="M100,74 Q128,42 168,36" stroke={pinkD} strokeWidth="0.5" fill="none" opacity="0.4"/>
      <ellipse cx="100" cy="80" rx="3.5" ry="16" fill={pinkD} opacity="0.9"/>
      <circle cx="100" cy="64" r="3.5" fill={pinkD} opacity="0.9"/>
      <path d="M100,64 Q88,50 82,40" stroke={pinkD} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <circle cx="81" cy="39" r="2" fill={pinkD} opacity="0.7"/>
      <path d="M100,64 Q112,50 118,40" stroke={pinkD} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <circle cx="119" cy="39" r="2" fill={pinkD} opacity="0.7"/>
    </svg>
  )

  // ── Monogram wreath ─────────────────────────────────────
  const Monogram = () => (
    <svg viewBox="0 0 300 300" width="clamp(200px,50vw,260px)" height="clamp(200px,50vw,260px)">
      <defs>
        <radialGradient id="mg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pinkL} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={pink} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="150" cy="150" r="140" fill="url(#mg)"/>
      {/* Cercle doré */}
      <circle cx="150" cy="150" r="110" fill="none" stroke={pink} strokeWidth="1.5" opacity="0.6"/>
      <circle cx="150" cy="150" r="105" fill="none" stroke={pinkL} strokeWidth="0.5" opacity="0.4"/>
      {/* Branches florales */}
      {[0,60,120,180,240,300].map((angle,i)=>{
        const rad = angle * Math.PI / 180
        const x1  = 150 + Math.cos(rad) * 80
        const y1  = 150 + Math.sin(rad) * 80
        const x2  = 150 + Math.cos(rad) * 108
        const y2  = 150 + Math.sin(rad) * 108
        const mx  = 150 + Math.cos(rad) * 94
        const my  = 150 + Math.sin(rad) * 94
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={pink} strokeWidth="1" opacity="0.6"/>
            <circle cx={mx} cy={my} r="4" fill={pink} opacity="0.5"/>
            <circle cx={x2} cy={y2} r="5" fill={pink} opacity="0.6"/>
            <circle cx={x2} cy={y2} r="3" fill={pinkL} opacity="0.8"/>
          </g>
        )
      })}
      {/* Initiales */}
      <text x="118" y="168" textAnchor="middle" fontFamily="Georgia, serif" fontSize="56" fill={pinkD} opacity="0.85" fontStyle="italic">
        {groomName[0]}
      </text>
      <text x="182" y="168" textAnchor="middle" fontFamily="Georgia, serif" fontSize="56" fill={pinkD} opacity="0.85" fontStyle="italic">
        {brideName[0]}
      </text>
      {/* Petit cœur bas */}
      <text x="150" y="195" textAnchor="middle" fontSize="12" fill={pink} opacity="0.7">♡</text>
      {/* Ligne séparatrice */}
      <line x1="138" y1="118" x2="138" y2="175" stroke={pink} strokeWidth="0.8" opacity="0.4"/>
    </svg>
  )

  return (
    <div
      onClick={skip}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     bgColor,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        overflow:       'hidden',
        opacity:        fading ? 0 : 1,
        transition:     fading ? 'opacity 1.2s ease' : 'background 1s ease',
      }}
    >

      {/* Particules flottantes */}
      {flapTB && [...Array(24)].map((_,i) => (
        <div key={i} style={{
          position:     'absolute',
          width:        `${2+(i%4)}px`,
          height:       `${3+(i%5)}px`,
          borderRadius: '50%',
          background:   i%3===0 ? pink : i%3===1 ? pinkL : pinkD,
          left:         `${5+(i*13%90)}%`,
          top:          `${5+(i*17%90)}%`,
          opacity:      0,
          animation:    `floatDot ${2+(i%4)}s ease-in-out ${i*0.2}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* ══════════════════════════════════════════
          SÉQUENCES 1-2 : ENVELOPPE
      ══════════════════════════════════════════ */}
      <div style={{
        position:   'relative',
        width:      'clamp(240px, 65vw, 340px)',
        height:     'clamp(240px, 65vw, 340px)',
        opacity:    envelopeVisible ? 1 : 0,
        transform:  envelopeVisible ? 'scale(1)' : 'scale(1.1)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        display:    envelopeVisible ? 'block' : 'none',
      }}>

        {/* Corps */}
        <div style={{
          position:     'absolute',
          inset:        0,
          background:   `linear-gradient(145deg, ${pinkL} 0%, ${pink} 50%, ${pinkD} 100%)`,
          borderRadius: '6px',
          boxShadow:    `0 20px 60px ${pink}50, 0 4px 16px rgba(0,0,0,0.1)`,
          overflow:     'hidden',
        }}>
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 400 400">
            <Florals opacity={0.55}/>
            {/* Croix centrale (jonction rabats) */}
            <line x1="200" y1="0" x2="200" y2="400" stroke={`${pinkD}30`} strokeWidth="0.5"/>
            <line x1="0" y1="200" x2="400" y2="200" stroke={`${pinkD}30`} strokeWidth="0.5"/>
          </svg>
        </div>

        {/* Sceau cire centre */}
        {!flapLR && (
          <div style={{
            position:       'absolute',
            top:'50%', left:'50%',
            transform:      'translate(-50%, -50%)',
            width:          'clamp(44px,12vw,60px)',
            height:         'clamp(44px,12vw,60px)',
            borderRadius:   '50%',
            background:     `radial-gradient(circle at 40% 35%, ${pinkL}, ${pinkD})`,
            boxShadow:      `0 4px 12px ${pinkD}60`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            zIndex:         10,
          }}>
            <svg viewBox="0 0 40 40" width="70%" height="70%">
              <circle cx="20" cy="20" r="14" fill="none" stroke="white" strokeWidth="0.8" opacity="0.7"/>
              <text x="20" y="25" textAnchor="middle" fontSize="14" fill="white" fontFamily="Georgia,serif" fontStyle="italic" opacity="0.9">A</text>
              <g stroke="white" strokeWidth="0.6" fill="none" opacity="0.5">
                <circle cx="20" cy="6" r="3"/><circle cx="34" cy="20" r="3"/>
                <circle cx="20" cy="34" r="3"/><circle cx="6" cy="20" r="3"/>
              </g>
            </svg>
          </div>
        )}

        {/* ── Rabat Gauche ── */}
        <div style={{
          position:           'absolute',
          top:0, left:0,
          width:'55%', height:'100%',
          transformOrigin:    'left center',
          transform:          flapLR
            ? 'perspective(800px) rotateY(-45deg)'
            : 'perspective(800px) rotateY(0deg)',
          transition:         'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             3,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', background:`linear-gradient(160deg,${pinkL},${pink})` }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 220 400" preserveAspectRatio="none">
              <Florals opacity={0.5}/>
              <polygon points="0,0 220,200 0,400" fill={`${pinkD}15`}/>
              <polygon points="0,0 220,200 0,400" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── Rabat Droit ── */}
        <div style={{
          position:           'absolute',
          top:0, right:0,
          width:'55%', height:'100%',
          transformOrigin:    'right center',
          transform:          flapLR
            ? 'perspective(800px) rotateY(45deg)'
            : 'perspective(800px) rotateY(0deg)',
          transition:         'transform 0.7s cubic-bezier(0.4,0,0.2,1) 0.15s',
          zIndex:             3,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', background:`linear-gradient(200deg,${pinkL},${pink})` }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 220 400" preserveAspectRatio="none">
              <Florals opacity={0.5}/>
              <polygon points="220,0 0,200 220,400" fill={`${pinkD}15`}/>
              <polygon points="220,0 0,200 220,400" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── Rabat Haut ── */}
        <div style={{
          position:           'absolute',
          top:0, left:0, right:0,
          height:'55%',
          transformOrigin:    'top center',
          transform:          flapTB
            ? 'perspective(800px) rotateX(-165deg)'
            : 'perspective(800px) rotateX(0deg)',
          transition:         'transform 0.75s cubic-bezier(0.4,0,0.2,1)',
          zIndex:             4,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', background:`linear-gradient(170deg,${pinkL},${pink})`, borderRadius:'6px 6px 0 0' }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 400 220" preserveAspectRatio="none">
              <Florals opacity={0.5}/>
              <polygon points="0,0 400,0 200,220" fill={`${pinkD}18`}/>
              <polygon points="0,0 400,0 200,220" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* ── Rabat Bas ── */}
        <div style={{
          position:           'absolute',
          bottom:0, left:0, right:0,
          height:'55%',
          transformOrigin:    'bottom center',
          transform:          flapTB
            ? 'perspective(800px) rotateX(165deg)'
            : 'perspective(800px) rotateX(0deg)',
          transition:         'transform 0.75s cubic-bezier(0.4,0,0.2,1) 0.15s',
          zIndex:             4,
          backfaceVisibility: 'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', background:`linear-gradient(180deg,${pink},${pinkD})`, borderRadius:'0 0 6px 6px' }}>
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 400 220" preserveAspectRatio="none">
              <Florals opacity={0.5}/>
              <polygon points="0,220 400,220 200,0" fill={`${pinkD}18`}/>
              <polygon points="0,220 400,220 200,0" fill="none" stroke={`${pinkD}35`} strokeWidth="0.6"/>
            </svg>
          </div>
        </div>

        {/* Lumière centrale */}
        <div style={{
          position:   'absolute',
          top:'20%', left:'20%', right:'20%', bottom:'20%',
          borderRadius:'4px',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
          opacity:    flapLR ? 1 : 0,
          transition: 'opacity 0.6s ease',
          zIndex:     2,
          pointerEvents:'none',
        }}/>
      </div>

      {/* ══════════════════════════════════════════
          SÉQUENCES 3-9 : CARTE
      ══════════════════════════════════════════ */}
      {cardPhase && (
        <div style={{
          position:   'absolute',
          inset:      0,
          display:    'flex',
          flexDirection:'column',
          alignItems: 'center',
          justifyContent:'center',
          padding:    '24px',
        }}>

          {/* Carte blanche */}
          <div style={{
            position:     'relative',
            width:        'clamp(280px, 80vw, 420px)',
            background:   'linear-gradient(145deg, #FFFCFA 0%, #FFF8F5 100%)',
            borderRadius: '8px',
            padding:      'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 36px)',
            boxShadow:    `0 24px 80px ${pink}30, 0 4px 20px rgba(0,0,0,0.06)`,
            border:       `1px solid ${pink}30`,
            textAlign:    'center',
            overflow:     'hidden',
            opacity:      showCard ? 1 : 0,
            transform:    showCard ? 'scale(1)' : 'scale(0.92)',
            transition:   'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Bordure intérieure carte */}
            <div style={{ position:'absolute', inset:'10px', border:`1px solid ${pink}25`, borderRadius:'6px', pointerEvents:'none' }}/>

            {/* Ornements coins carte */}
            {[0,1,2,3].map(i => (
              <svg key={i} style={{
                position:'absolute',
                top:    i<2?'10px':'auto', bottom: i>=2?'10px':'auto',
                left:   i%2===0?'10px':'auto', right: i%2!==0?'10px':'auto',
                width:'20px', height:'20px',
                transform:`rotate(${i*90}deg)`,
              }} viewBox="0 0 20 20">
                <path d="M2,18 L2,2 L18,2" stroke={`${pink}60`} strokeWidth="0.8" fill="none"/>
                <circle cx="2" cy="2" r="2" fill={pink} opacity="0.5"/>
                <circle cx="18" cy="2" r="1" fill={pink} opacity="0.3"/>
              </svg>
            ))}

            {/* Papillon Séquence 3 */}
            <div style={{
              display:       'flex',
              justifyContent:'center',
              marginBottom:  'clamp(12px,3vw,20px)',
              opacity:       showCard ? 1 : 0,
              transform:     showCard ? 'translateY(0)' : 'translateY(-16px)',
              transition:    'opacity 0.8s ease, transform 0.8s ease',
              animation:     showCard ? 'flutter 3s ease-in-out infinite' : 'none',
            }}>
              <Butterfly size={80}/>
            </div>

            {/* Séquence 4 — CORDIALEMENT INVITÉ */}
            <div style={{
              opacity:    showCord ? 1 : 0,
              filter:     showCord ? 'blur(0px)' : 'blur(8px)',
              transform:  showCord ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.96)',
              transition: 'opacity 0.9s ease, filter 0.9s ease, transform 0.9s ease',
              marginBottom: showCord ? 'clamp(12px,2.5vw,20px)' : 0,
            }}>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.65rem,1.5vw,0.78rem)', color:`${pinkD}`, letterSpacing:'0.3em', textTransform:'uppercase', margin:'0 0 4px', opacity:0.7 }}>
                Vous êtes
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.1rem,3.5vw,1.6rem)', color:'#2C1810', letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 4px', fontWeight:400 }}>
                Cordialement
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.65rem,1.5vw,0.78rem)', color:pinkD, letterSpacing:'0.3em', textTransform:'uppercase', margin:'0 0 8px', opacity:0.7 }}>
                Invité(e)
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.7rem,1.6vw,0.82rem)', color:pink, fontStyle:'italic', margin:0, opacity:0.8 }}>
                {guestName}
              </p>
            </div>

            {/* Diviseur */}
            {showCord && (
              <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,${pink}50,transparent)`, margin:'clamp(8px,2vw,14px) 15%' }}/>
            )}

            {/* Séquence 5 — NOMS */}
            <div style={{
              opacity:    showNames ? 1 : 0,
              filter:     showNames ? 'blur(0px)' : 'blur(6px)',
              transform:  showNames ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.9s ease, filter 0.9s ease, transform 0.9s ease',
              position:   'relative',
              marginBottom: showNames ? 'clamp(8px,2vw,14px)' : 0,
            }}>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.3rem,4vw,1.9rem)', color:'#2C1810', margin:'0 0 2px', fontStyle:'italic', letterSpacing:'0.05em' }}>
                {groomName}
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.9rem,2.5vw,1.1rem)', color:pink, margin:'0 0 2px', opacity:0.8 }}>
                &amp;
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.3rem,4vw,1.9rem)', color:'#2C1810', margin:0, fontStyle:'italic', letterSpacing:'0.05em' }}>
                {brideName}
              </p>
            </div>

            {/* Séquence 6 — DATE */}
            <div style={{
              opacity:    showDate ? 1 : 0,
              filter:     showDate ? 'blur(0px)' : 'blur(6px)',
              transform:  showDate ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.9s ease 0.2s, filter 0.9s ease 0.2s, transform 0.9s ease 0.2s',
              marginBottom: showDate ? 'clamp(8px,2vw,14px)' : 0,
            }}>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.55rem,1.2vw,0.65rem)', color:pinkD, letterSpacing:'0.3em', textTransform:'uppercase', margin:'0 0 4px', opacity:0.6 }}>
                Save the Date
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.9rem,2.2vw,1.1rem)', color:'#2C1810', letterSpacing:'0.2em', margin:'0 0 2px', fontWeight:400 }}>
                {dp.date}
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.6rem,1.4vw,0.72rem)', color:pinkD, letterSpacing:'0.2em', textTransform:'uppercase', margin:0, opacity:0.7 }}>
                {venueName}
              </p>
            </div>

            {/* Séquence 7 — INVITATION OFFICIELLE */}
            <div style={{
              opacity:    showFormal ? 1 : 0,
              filter:     showFormal ? 'blur(0px)' : 'blur(6px)',
              transform:  showFormal ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.9s ease, filter 0.9s ease, transform 0.9s ease',
            }}>
              <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,${pink}40,transparent)`, margin:'0 20% clamp(8px,1.5vw,12px)' }}/>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.55rem,1.2vw,0.65rem)', color:pinkD, letterSpacing:'0.3em', textTransform:'uppercase', margin:'0 0 2px', opacity:0.6 }}>
                Invitation Officielle
              </p>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(0.8rem,2vw,0.95rem)', color:'#2C1810', letterSpacing:'0.15em', textTransform:'uppercase', margin:0, fontWeight:400 }}>
                Mariage
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SÉQUENCE 8 — MONOGRAMME FINAL
      ══════════════════════════════════════════ */}
      {showMono && (
        <div style={{
          position:   'fixed',
          inset:      0,
          display:    'flex',
          alignItems: 'center',
          justifyContent:'center',
          background: `radial-gradient(ellipse at center, ${pinkL}60 0%, #FFFCFA 60%)`,
          opacity:    showMono ? 1 : 0,
          transition: 'opacity 0.8s ease',
          zIndex:     10,
        }}>
          <div style={{
            display:    'flex',
            flexDirection:'column',
            alignItems: 'center',
            gap:        '16px',
            transform:  phase === 's9_fadeout' ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 2s ease',
          }}>
            <Monogram/>
            <p style={{
              fontFamily:    'Georgia,serif',
              fontSize:      'clamp(0.6rem,1.4vw,0.72rem)',
              color:         pinkD,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              opacity:       0.6,
              margin:        0,
            }}>
              {groomName} &amp; {brideName}
            </p>
          </div>
        </div>
      )}

      {/* Skip */}
      <p style={{
        position:      'absolute',
        bottom:        '20px',
        left:          '50%',
        transform:     'translateX(-50%)',
        fontFamily:    'Georgia,serif',
        fontSize:      'clamp(0.55rem,1.2vw,0.65rem)',
        color:         'rgba(140,100,90,0.35)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        whiteSpace:    'nowrap',
        pointerEvents: 'none',
        margin:        0,
      }}>
        Appuyez pour passer
      </p>

      <style>{`
        @keyframes flutter {
          0%,100% { transform:translateY(0) scaleX(1); }
          25%      { transform:translateY(-5px) scaleX(0.96); }
          75%      { transform:translateY(-2px) scaleX(0.98); }
        }
        @keyframes floatDot {
          0%,100% { opacity:0; transform:translateY(0); }
          40%     { opacity:0.45; }
          70%     { opacity:0.2; }
          100%    { opacity:0; transform:translateY(-22px); }
        }
      `}</style>
    </div>
  )
}