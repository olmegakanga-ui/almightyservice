'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { EventData } from '@/types/invitation'
import { parseEventDate } from '@/lib/date-utils'

// Keep the palette independent of the choreography, for future wedding themes.
function palette(raw: string, fallback: string) {
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback
}
function ink(hex: string) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2] > .179 ? '#231e1c' : '#fffaf4'
}
const TIMING = [1100, 4300, 8000] // reveal, couple, date — final card stays visible

export default function AnimatedInvitation({ event }: { event: EventData }) {
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const [photoFailed, setPhotoFailed] = useState(false)
  const primary = palette(event.themeColor, '#C9A96E')
  const secondary = palette(event.themeColorSecondary, '#E8D5B0')
  const date = parseEventDate(event.eventDate)
  useEffect(() => {
    if (!playing) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = TIMING.map((time, i) => window.setTimeout(() => setPhase(i + 2), reduced ? (i + 1) * 3500 : time))
    return () => timers.forEach(window.clearTimeout)
  }, [playing, run])
  const open = () => { setPhase(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 2 : 1); setPlaying(true); setRun(v => v + 1) }
  const vars = { '--paper': primary, '--accent': secondary, '--ink': ink(primary), '--seal-ink': ink(secondary) } as CSSProperties
  const photo = event.coupleCutoutUrl && !photoFailed
  return <main className={`animated-invitation phase-${phase}`} style={vars}>
    <div className="animated-stage">
      <div className="animated-flowers" aria-hidden="true" />
      <div className="animated-wash" aria-hidden="true" />
      <section className={`animated-scene announce ${phase === 2 ? 'visible' : ''}`} aria-hidden={phase !== 2}>
        <div className="animated-copy"><p className="animated-eyebrow">Vous êtes invités</p><h1>à notre<br /><em>mariage</em></h1>
          <p className="animated-message">{event.heroMessage || event.invitationText}</p>
        </div>
      </section>
      <section className={`animated-scene couple ${phase === 3 ? 'visible' : ''}`} aria-hidden={phase !== 3}>
        <h2 className="animated-names">{event.groomName}<span>&amp;</span>{event.brideName}</h2>
        {photo && <img className="animated-cutout" src={event.coupleCutoutUrl!} alt={`${event.groomName} et ${event.brideName}`} onError={() => setPhotoFailed(true)} />}
      </section>
      <section className={`animated-scene details ${phase === 4 ? 'visible' : ''}`} aria-hidden={phase !== 4}>
        <div className="animated-copy"><p className="animated-eyebrow">Le mariage de</p>
          <h2 className="animated-final-names">{event.groomName} &amp; {event.brideName}</h2>
          <p className="animated-day">{date.dayName}</p><p className="animated-number">{date.dayNumber}</p>
          <p className="animated-month">{date.monthName} {date.year}</p><p className="animated-time">à {date.time}</p>
          <div className="animated-rule" /><p className="animated-venue">{event.venueName}</p><p className="animated-address">{event.venueAddress}</p>
        </div>
      </section>
      <div className="animated-envelope" aria-hidden={phase !== 0}>
        <div className="animated-paper" />
        <div className="animated-flap"><div className="animated-flap-paper" />
          <button className="animated-seal" onClick={open} disabled={phase !== 0} aria-label="Ouvrir l’invitation">{event.groomName.charAt(0)}<small>&amp;</small>{event.brideName.charAt(0)}</button>
        </div>
        {phase === 0 && <p className="animated-open-hint">Touchez le sceau pour ouvrir</p>}
      </div>
      {phase === 4 && <button className="animated-replay" onClick={open}>Revoir l’invitation</button>}
    </div>
    <style>{`
      .animated-invitation { min-height:100svh; background:var(--paper); color:var(--ink); display:flex; justify-content:center; }
      .animated-stage { position:relative; width:min(100%,640px); height:100svh; min-height:540px; overflow:hidden; isolation:isolate; background:var(--paper); }
      .animated-flowers { position:absolute; inset:0; background:url('/images/floral-invitation-v2.webp') center/cover; filter:grayscale(1); mix-blend-mode:luminosity; opacity:.48; }
      .animated-wash { position:absolute; inset:0; background:linear-gradient(90deg,transparent,var(--paper) 35%,var(--paper) 65%,transparent); opacity:.62; }
      .animated-scene { position:absolute; inset:0; opacity:0; visibility:hidden; transform:translateY(12px); transition:opacity .9s ease,transform 1.2s ease,visibility .9s; text-align:center; padding:10% 9%; display:flex; flex-direction:column; align-items:center; justify-content:safe center; overflow-y:auto; }
      .animated-scene.visible { opacity:1; visibility:visible; transform:translateY(0); }
      .animated-copy { width:100%; max-width:440px; overflow-wrap:anywhere; }
      .animated-eyebrow { font:400 12px/1.7 var(--font-body,Arial),sans-serif; letter-spacing:.24em; text-transform:uppercase; }
      .animated-scene h1 { font:400 clamp(46px,12vw,78px)/1.08 var(--font-display,Georgia),serif; margin:22px 0; }
      .animated-scene h1 em { font:400 clamp(62px,15vw,100px)/1.1 var(--font-script,Georgia),serif; }
      .animated-message { font:400 clamp(14px,3.5vw,18px)/1.7 var(--font-display,Georgia),serif; margin:28px auto 0; max-width:340px; white-space:pre-line; }
      .animated-scene.couple { justify-content:flex-start; padding-top:12%; }
      .animated-names { position:relative; z-index:1; font:400 clamp(42px,11vw,76px)/1.05 var(--font-script,Georgia),serif; margin:0; overflow-wrap:anywhere; }
      .animated-names span { display:block; font-size:.6em; margin:6px; }
      .animated-cutout { position:absolute; bottom:0; left:5%; width:90%; height:62%; object-fit:contain; object-position:center bottom; filter:drop-shadow(0 8px 12px #0002); }
      .animated-final-names { font:400 clamp(30px,8vw,50px)/1.2 var(--font-script,Georgia),serif; margin:14px 0 22px; }
      .animated-day { font:italic 20px/1.5 Georgia,serif; text-transform:capitalize; }
      .animated-number { font:400 clamp(72px,19vw,120px)/1 var(--font-display,Georgia),serif; margin:8px 0; }
      .animated-month { font:400 19px/1.5 Georgia,serif; text-transform:capitalize; }
      .animated-time { font:italic 18px/1.7 Georgia,serif; margin:8px 0; }
      .animated-rule { height:1px; width:70px; margin:22px auto; background:currentColor; opacity:.4; }
      .animated-venue { font:400 clamp(20px,5vw,30px)/1.3 var(--font-display,Georgia),serif; }
      .animated-address { font:400 13px/1.6 var(--font-body,Arial),sans-serif; margin:10px 0 0; }
      .animated-envelope { position:absolute; inset:0; z-index:3; pointer-events:none; }
      .animated-paper { position:absolute; inset:0; background:linear-gradient(120deg,#ffffff22,#00000012),var(--paper); box-shadow:12px 0 26px #0003; transition:transform 1.15s cubic-bezier(.4,0,.2,1); }
      .animated-paper:after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,#fff1 0 1px,transparent 1px 3px); opacity:.3; }
      .animated-flap { position:absolute; top:0; bottom:0; right:0; width:78%; filter:drop-shadow(-8px 9px 10px #0003); transition:transform .95s cubic-bezier(.4,0,.2,1); }
      .animated-flap-paper { position:absolute; inset:0; clip-path:polygon(100% 0,18% 50%,100% 100%); background:linear-gradient(115deg,#ffffff44,#00000008),var(--paper); }
      .animated-seal { position:absolute; top:calc(50% - 43px); left:calc(18% - 43px); width:86px; height:86px; border-radius:48% 52% 49% 47%; border:1px solid #0002; background:radial-gradient(circle at 30% 25%,#ffffff55,transparent 70%),var(--accent); color:var(--seal-ink); box-shadow:inset 0 0 0 4px #ffffff33,inset 0 0 0 5px #0002,2px 5px 10px #0003; font:400 30px var(--font-script,Georgia),serif; pointer-events:auto; cursor:pointer; }
      .animated-seal small { font:italic 13px Georgia,serif; margin:0 2px; }
      .animated-open-hint { position:absolute; bottom:12%; width:100%; text-align:center; font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.13em; }
      .animated-invitation:not(.phase-0) .animated-flap { transform:translateX(118%); }
      .phase-2 .animated-paper,.phase-3 .animated-paper,.phase-4 .animated-paper { transform:translateX(-105%); }
      .animated-replay { position:absolute; z-index:4; bottom:calc(env(safe-area-inset-bottom) + 20px); left:50%; transform:translateX(-50%); font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.1em; padding:10px 14px; border:1px solid currentColor; border-radius:30px; background:var(--paper); color:var(--ink); cursor:pointer; white-space:nowrap; }
      @media (prefers-reduced-motion:reduce) { .animated-stage * { transition:none!important; transform:none!important; } .animated-invitation:not(.phase-0) .animated-envelope { display:none; } }
      @media (max-height:650px) { .animated-scene { padding:7% 9% 65px; } .animated-final-names { margin:8px 0 10px; } .animated-number { font-size:68px; } .animated-rule { margin:12px auto; } }
    `}</style>
  </main>
}
