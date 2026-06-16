'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  groomName: string
  brideName: string
  guestName: string
  themeColor: string
  eventDate: string
  venueName: string
  onComplete: () => void
}

type Phase =
  | 's1_closed'
  | 's2_opening'
  | 's3_card'
  | 's4_invited'
  | 's5_names'
  | 's6_date'
  | 's7_formal'
  | 's8_monogram'
  | 's9_fadeout'

const timeline: Array<[number, Phase]> = [
  [1800, 's2_opening'],
  [4300, 's3_card'],
  [6600, 's4_invited'],
  [9600, 's5_names'],
  [12600, 's6_date'],
  [15600, 's7_formal'],
  [18600, 's8_monogram'],
  [22200, 's9_fadeout'],
]

function clampHex(hexColor: string) {
  const clean = hexColor?.replace('#', '').trim()
  return /^[0-9a-fA-F]{6}$/.test(clean || '') ? `#${clean}` : '#E8B4B8'
}

function shade(hexColor: string, amount: number) {
  const hex = clampHex(hexColor).replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

function extractDateParts(iso: string) {
  const date = new Date(iso)
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date
  return {
    date: `${String(validDate.getDate()).padStart(2, '0')} • ${String(validDate.getMonth() + 1).padStart(2, '0')} • ${validDate.getFullYear()}`,
    time: iso?.includes('T') ? iso.split('T')[1]?.slice(0, 5).replace(':', 'h') : '19h00',
  }
}

export default function EnvelopeIntro({
  groomName,
  brideName,
  guestName,
  themeColor,
  eventDate,
  venueName,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>('s1_closed')

  const colors = useMemo(() => {
    const base = clampHex(themeColor || '#E8B4B8')
    return {
      base,
      light: shade(base, 38),
      dark: shade(base, -46),
      ink: '#3A2118',
      paper: '#FFF9F4',
      gold: '#B98A45',
    }
  }, [themeColor])

  const dp = useMemo(() => extractDateParts(eventDate), [eventDate])

  const isAtLeast = useCallback(
    (target: Phase) => {
      const order: Phase[] = ['s1_closed', 's2_opening', 's3_card', 's4_invited', 's5_names', 's6_date', 's7_formal', 's8_monogram', 's9_fadeout']
      return order.indexOf(phase) >= order.indexOf(target)
    },
    [phase]
  )

  const skip = useCallback(() => {
    setPhase('s9_fadeout')
    window.setTimeout(onComplete, 850)
  }, [onComplete])

  useEffect(() => {
    const timers = timeline.map(([ms, next]) => window.setTimeout(() => setPhase(next), ms))
    const done = window.setTimeout(onComplete, 23800)
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(done)
    }
  }, [onComplete])

  const opening = isAtLeast('s2_opening')
  const cardVisible = isAtLeast('s3_card') && !isAtLeast('s8_monogram')
  const fading = phase === 's9_fadeout'

  const Florals = ({ opacity = 0.55 }: { opacity?: number }) => (
    <svg className="intro-florals" viewBox="0 0 400 260" aria-hidden="true">
      <g stroke={colors.dark} strokeWidth="0.8" fill="none" opacity={opacity}>
        <path d="M38 54 C65 26 92 28 120 48" />
        <path d="M45 65 C70 82 95 78 125 58" />
        <path d="M280 48 C310 25 346 29 368 56" />
        <path d="M276 60 C310 82 340 78 362 64" />
        <path d="M42 210 C78 185 108 188 130 214" />
        <path d="M270 214 C300 186 338 184 365 210" />
        {[[74, 43], [98, 57], [320, 45], [346, 62], [80, 202], [322, 204]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="8" ry="4" fill={colors.base} opacity="0.42" transform={`rotate(${i * 35} ${x} ${y})`} />
            <circle cx={x + 7} cy={y - 5} r="3" fill={colors.light} opacity="0.5" />
          </g>
        ))}
      </g>
    </svg>
  )

  const Butterfly = () => (
    <svg className="intro-butterfly" viewBox="0 0 220 150" aria-hidden="true">
      <defs>
        <radialGradient id="butterflyWing" cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor={colors.paper} stopOpacity="0.95" />
          <stop offset="58%" stopColor={colors.light} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.base} stopOpacity="0.62" />
        </radialGradient>
      </defs>
      <path d="M108 72 C58 8 14 22 18 61 C22 98 64 101 108 84Z" fill="url(#butterflyWing)" stroke={colors.dark} strokeWidth="1" />
      <path d="M112 72 C162 8 206 22 202 61 C198 98 156 101 112 84Z" fill="url(#butterflyWing)" stroke={colors.dark} strokeWidth="1" />
      <path d="M108 86 C61 96 47 128 73 139 C97 148 110 111 110 91Z" fill="url(#butterflyWing)" stroke={colors.dark} strokeWidth="0.8" opacity="0.82" />
      <path d="M112 86 C159 96 173 128 147 139 C123 148 110 111 110 91Z" fill="url(#butterflyWing)" stroke={colors.dark} strokeWidth="0.8" opacity="0.82" />
      <ellipse cx="110" cy="83" rx="4" ry="20" fill={colors.dark} opacity="0.82" />
      <circle cx="110" cy="62" r="4" fill={colors.dark} opacity="0.82" />
    </svg>
  )

  const Monogram = () => (
    <div className="intro-monogram-card">
      <svg className="intro-wreath" viewBox="0 0 320 320" aria-hidden="true">
        <circle cx="160" cy="160" r="118" fill="none" stroke={colors.gold} strokeWidth="1.4" opacity="0.75" />
        <circle cx="160" cy="160" r="128" fill="none" stroke={colors.base} strokeWidth="0.8" opacity="0.45" />
        {[...Array(18)].map((_, i) => {
          const a = (i * 20 * Math.PI) / 180
          const x = 160 + Math.cos(a) * 124
          const y = 160 + Math.sin(a) * 124
          return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 2 ? colors.gold : colors.base} opacity="0.65" />
        })}
        <text x="129" y="178" textAnchor="middle" className="intro-initial">{groomName?.[0] || 'G'}</text>
        <line x1="160" y1="112" x2="160" y2="190" stroke={colors.gold} strokeWidth="1" opacity="0.55" />
        <text x="193" y="178" textAnchor="middle" className="intro-initial">{brideName?.[0] || 'B'}</text>
        <text x="160" y="214" textAnchor="middle" fill={colors.gold} fontSize="18">♥</text>
      </svg>
      <p>{groomName} &amp; {brideName}</p>
    </div>
  )

  return (
    <div className={`intro-root ${fading ? 'is-fading' : ''}`} onClick={skip} style={{ '--intro-base': colors.base, '--intro-light': colors.light, '--intro-dark': colors.dark, '--intro-gold': colors.gold } as React.CSSProperties}>
      <div className="intro-bg-glow" />

      {[...Array(34)].map((_, i) => <span key={i} className="intro-particle" style={{ '--i': i } as React.CSSProperties} />)}

      {!cardVisible && !isAtLeast('s8_monogram') && (
        <div className={`intro-envelope ${opening ? 'is-open' : ''}`}>
          <div className="env-body"><Florals /></div>
          <div className="env-light" />
          <div className="env-flap env-left"><Florals opacity={0.36} /></div>
          <div className="env-flap env-right"><Florals opacity={0.36} /></div>
          <div className="env-flap env-top"><Florals opacity={0.36} /></div>
          <div className="env-flap env-bottom"><Florals opacity={0.32} /></div>
          {!opening && <div className="env-seal">A</div>}
        </div>
      )}

      {cardVisible && (
        <section className="intro-card" aria-label="Ouverture de l'invitation">
          <Florals opacity={0.28} />
          <div className="card-border" />
          <div className={`card-step butterfly-step ${isAtLeast('s3_card') ? 'show' : ''}`}><Butterfly /></div>

          <div className={`card-step ${isAtLeast('s4_invited') ? 'show' : ''}`}>
            <span className="overline">Vous êtes</span>
            <h1>Cordialement<br />invité(e)</h1>
            <span className="guest-name">{guestName}</span>
          </div>

          <div className={`card-step names-step ${isAtLeast('s5_names') ? 'show' : ''}`}>
            <h2>{groomName}</h2>
            <span>&amp;</span>
            <h2>{brideName}</h2>
          </div>

          <div className={`card-step date-step ${isAtLeast('s6_date') ? 'show' : ''}`}>
            <span className="overline">Save the date</span>
            <strong>{dp.date}</strong>
            <small>{venueName}</small>
          </div>

          <div className={`card-step formal-step ${isAtLeast('s7_formal') ? 'show' : ''}`}>
            <span className="rule" />
            <span className="overline">Invitation officielle</span>
            <strong>Mariage</strong>
          </div>
        </section>
      )}

      {isAtLeast('s8_monogram') && <Monogram />}

      <span className="intro-skip">Appuyez pour passer</span>

      <style jsx>{`
        .intro-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background:
            radial-gradient(circle at 50% 35%, rgba(255,255,255,0.92), transparent 34%),
            linear-gradient(135deg, #fffaf6 0%, #f9ece7 48%, #fff9f5 100%);
          opacity: 1;
          transition: opacity 900ms ease;
        }
        .intro-root.is-fading { opacity: 0; }
        .intro-bg-glow {
          position: absolute;
          width: 90vmin;
          height: 90vmin;
          border-radius: 999px;
          background: radial-gradient(circle, var(--intro-light), transparent 68%);
          opacity: 0.22;
          filter: blur(16px);
          animation: breathe 5s ease-in-out infinite;
        }
        .intro-particle {
          position: absolute;
          left: calc((var(--i) * 37) % 100 * 1%);
          top: calc((var(--i) * 53) % 100 * 1%);
          width: calc(3px + (var(--i) % 4) * 1px);
          height: calc(3px + (var(--i) % 5) * 1px);
          border-radius: 999px;
          background: var(--intro-base);
          opacity: 0;
          animation: floatUp calc(3s + (var(--i) % 5) * .55s) ease-in-out calc(var(--i) * .12s) infinite;
        }
        .intro-envelope {
          position: relative;
          width: min(76vw, 370px);
          aspect-ratio: 1.32 / 1;
          perspective: 1200px;
          animation: revealEnvelope 900ms cubic-bezier(.16,1,.3,1) both;
        }
        .env-body,
        .env-flap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 16px;
          background: linear-gradient(145deg, var(--intro-light), var(--intro-base) 55%, var(--intro-dark));
          box-shadow: 0 32px 90px rgba(70, 38, 26, .16), inset 0 1px 0 rgba(255,255,255,.46);
        }
        .env-body::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(32deg, transparent 49.5%, rgba(95,55,40,.16) 50%, transparent 50.5%),
            linear-gradient(-32deg, transparent 49.5%, rgba(95,55,40,.16) 50%, transparent 50.5%);
        }
        .intro-florals { position: absolute; inset: 0; width: 100%; height: 100%; }
        .env-flap { box-shadow: inset 0 1px 0 rgba(255,255,255,.36); }
        .env-left { clip-path: polygon(0 0, 54% 50%, 0 100%); transform-origin: left center; transition: transform 1.15s cubic-bezier(.2,.8,.2,1); z-index: 4; }
        .env-right { clip-path: polygon(100% 0, 46% 50%, 100% 100%); transform-origin: right center; transition: transform 1.15s cubic-bezier(.2,.8,.2,1) .12s; z-index: 4; }
        .env-top { clip-path: polygon(0 0, 100% 0, 50% 56%); transform-origin: top center; transition: transform 1.2s cubic-bezier(.2,.8,.2,1) .62s; z-index: 5; }
        .env-bottom { clip-path: polygon(0 100%, 100% 100%, 50% 44%); transform-origin: bottom center; transition: transform 1.2s cubic-bezier(.2,.8,.2,1) .74s; z-index: 5; }
        .intro-envelope.is-open .env-left { transform: rotateY(-66deg); }
        .intro-envelope.is-open .env-right { transform: rotateY(66deg); }
        .intro-envelope.is-open .env-top { transform: rotateX(-172deg); }
        .intro-envelope.is-open .env-bottom { transform: rotateX(172deg); }
        .env-light {
          position: absolute;
          inset: 18%;
          border-radius: 18px;
          background: radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,0) 72%);
          opacity: 0;
          transition: opacity 900ms ease .55s;
          z-index: 2;
        }
        .intro-envelope.is-open .env-light { opacity: 1; }
        .env-seal {
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 58px; height: 58px;
          border-radius: 999px;
          z-index: 8;
          display: grid;
          place-items: center;
          color: #fff9f2;
          font: italic 28px Georgia, serif;
          background: radial-gradient(circle at 35% 25%, var(--intro-light), var(--intro-dark));
          box-shadow: 0 10px 26px rgba(60,35,25,.22), inset 0 0 0 2px rgba(255,255,255,.42);
        }
        .intro-card {
          position: relative;
          width: min(84vw, 430px);
          min-height: 560px;
          padding: 54px 34px 42px;
          border-radius: 20px;
          text-align: center;
          background: linear-gradient(145deg, #fffdf9, #fff6f1);
          border: 1px solid rgba(185,138,69,.22);
          box-shadow: 0 36px 110px rgba(83,48,36,.14), inset 0 1px 0 rgba(255,255,255,.86);
          animation: cardIn 950ms cubic-bezier(.16,1,.3,1) both;
          overflow: hidden;
        }
        .card-border { position: absolute; inset: 14px; border-radius: 15px; border: 1px solid rgba(185,138,69,.22); pointer-events: none; }
        .card-step { position: relative; z-index: 2; opacity: 0; filter: blur(8px); transform: translateY(14px) scale(.98); transition: all 900ms cubic-bezier(.16,1,.3,1); }
        .card-step.show { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        .butterfly-step { margin-bottom: 22px; }
        .intro-butterfly { width: 116px; height: auto; filter: drop-shadow(0 12px 22px rgba(180,110,120,.22)); animation: butterflyFloat 3.8s ease-in-out infinite; }
        .overline { display: block; margin-bottom: 8px; color: var(--intro-dark); opacity: .62; font: 500 11px/1.3 Georgia, serif; letter-spacing: .34em; text-transform: uppercase; }
        h1 { margin: 0 0 10px; color: #392118; font: 400 clamp(1.45rem, 6vw, 2.1rem)/1.3 Georgia, serif; letter-spacing: .16em; text-transform: uppercase; }
        .guest-name { color: var(--intro-gold); font: italic 1rem Georgia, serif; }
        .names-step { margin-top: 22px; }
        .names-step h2 { margin: 0; color: #392118; font: italic 400 clamp(1.7rem, 7vw, 2.45rem)/1.04 Georgia, serif; }
        .names-step span { display: block; margin: 6px 0; color: var(--intro-gold); font: 1.2rem Georgia, serif; }
        .date-step { margin-top: 24px; }
        .date-step strong { display: block; color: #392118; font: 400 1.05rem Georgia, serif; letter-spacing: .22em; }
        .date-step small { display: block; margin-top: 8px; color: var(--intro-dark); opacity: .7; font: 10px Georgia, serif; letter-spacing: .24em; text-transform: uppercase; }
        .formal-step { margin-top: 26px; }
        .formal-step strong { display: block; color: #392118; font: 400 1rem Georgia, serif; letter-spacing: .2em; text-transform: uppercase; }
        .rule { display: block; width: 50%; height: 1px; margin: 0 auto 16px; background: linear-gradient(90deg, transparent, var(--intro-gold), transparent); opacity: .48; }
        .intro-monogram-card { position: relative; z-index: 5; display: grid; place-items: center; gap: 8px; animation: monogramIn 1.1s cubic-bezier(.16,1,.3,1) both; }
        .intro-wreath { width: min(72vw, 300px); height: auto; filter: drop-shadow(0 18px 36px rgba(80,50,40,.12)); animation: slowZoom 3.8s ease-in-out forwards; }
        .intro-initial { fill: #392118; font: italic 62px Georgia, serif; }
        .intro-monogram-card p { margin: 0; color: var(--intro-dark); opacity: .68; font: 11px Georgia, serif; letter-spacing: .3em; text-transform: uppercase; }
        .intro-skip { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); color: rgba(80,50,40,.38); font: 10px Georgia, serif; letter-spacing: .22em; text-transform: uppercase; white-space: nowrap; }
        @keyframes revealEnvelope { from { opacity: 0; transform: translateY(16px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(26px) scale(.93); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes monogramIn { from { opacity: 0; transform: scale(.84); filter: blur(12px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes butterflyFloat { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-8px) rotate(1deg); } }
        @keyframes floatUp { 0%,100% { opacity: 0; transform: translateY(18px) scale(.8); } 45% { opacity: .5; } 78% { opacity: .18; transform: translateY(-30px) scale(1); } }
        @keyframes breathe { 0%,100% { transform: scale(.94); } 50% { transform: scale(1.04); } }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @media (max-width: 420px) {
          .intro-card { min-height: 520px; padding: 46px 24px 36px; }
          .env-seal { width: 50px; height: 50px; }
        }
      `}</style>
    </div>
  )
}
