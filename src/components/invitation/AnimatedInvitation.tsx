'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import WaxEnvelope from '@/components/invitation/WaxEnvelope'
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
const TIMING = [5300, 9200, 13700] // reveal, couple, date — final card stays visible

export default function AnimatedInvitation({ event }: { event: EventData }) {
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const [envelopeVersion, setEnvelopeVersion] = useState(0)
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
  const lightTheme = ink(primary) === '#231e1c'
  const card = lightTheme ? `color-mix(in srgb, ${primary} 20%, #fffaf2)` : `color-mix(in srgb, ${primary} 78%, #18141a)`
  const vars = { '--card': card, '--envelope-ink': ink(primary), '--paper': primary, '--accent': secondary, '--ink': ink(primary), '--seal-ink': ink(secondary) } as CSSProperties
  const photo = event.coupleCutoutUrl && !photoFailed
  return <main className={`animated-invitation phase-${phase}`} style={vars}>
    <div className="animated-stage">
      <div className="animated-flowers" aria-hidden="true" />
      <div className="animated-wash" aria-hidden="true" />
      <div className="animated-border-flowers" aria-hidden="true"><div className="border-bouquet corner-top"><img src="/images/invitation-corner-ivory.webp" alt="" /></div><div className="border-bouquet corner-bottom"><img src="/images/invitation-corner-ivory.webp" alt="" /></div></div>
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
      <WaxEnvelope key={envelopeVersion} opening={phase !== 0} hidden={phase >= 2} groomName={event.groomName} brideName={event.brideName} onOpen={open} />
      {phase === 4 && <button className="animated-replay" onClick={() => { setPlaying(false); setPhase(0); setEnvelopeVersion(v => v + 1) }}>Revoir l’invitation</button>}
    </div>
    <style>{`
      .animated-invitation { min-height:100svh; background:var(--paper); color:var(--ink); display:flex; justify-content:center; }
      .animated-stage { position:relative; width:min(100%,calc(100svh * .5625)); container-type:inline-size; height:100svh; min-height:540px; overflow:hidden; isolation:isolate; background:var(--card); }
      .animated-flowers { position:absolute; inset:0; background:url('/images/floral-invitation-v2.webp') center/cover; filter:grayscale(1); mix-blend-mode:luminosity; opacity:.32; }
      .animated-wash { position:absolute; inset:0; background:linear-gradient(90deg,transparent,var(--card) 35%,var(--card) 65%,transparent); opacity:.42; }
      .animated-border-flowers { position:absolute; inset:0; z-index:4; pointer-events:none; }
      .border-bouquet { position:absolute; width:57%; aspect-ratio:1; filter:drop-shadow(0 4px 5px #0003); }
      .border-bouquet img { width:100%; height:100%; object-fit:contain; }
      .corner-top { right:-17%; top:-8%; transform:scale(.65) rotate(-6deg); transform-origin:85% 15%; }
      .corner-bottom { left:-17%; bottom:-8%; transform:rotate(180deg) scale(.65); transform-origin:50% 50%; }
      .animated-invitation:not(.phase-0) .corner-top { animation:corner-top-bloom 4.4s cubic-bezier(.22,.6,.25,1) both; }
      .animated-invitation:not(.phase-0) .corner-bottom { animation:corner-bottom-bloom 4.4s cubic-bezier(.22,.6,.25,1) .2s both; }
      @keyframes corner-top-bloom { 0% { transform:scale(.65) rotate(-6deg); } 55% { transform:translate(-5%,7%) scale(1.08) rotate(3deg); } 100% { transform:translate(-2%,3%) scale(1) rotate(0deg); } }
      @keyframes corner-bottom-bloom { 0% { transform:rotate(180deg) scale(.65); } 55% { transform:translate(5%,-7%) rotate(183deg) scale(1.08); } 100% { transform:translate(2%,-3%) rotate(180deg) scale(1); } }
      .animated-scene { position:absolute; inset:0; opacity:0; visibility:hidden; transform:translateY(12px); transition:opacity .9s ease,transform 1.2s ease,visibility .9s; text-align:center; padding:10% 9%; display:flex; flex-direction:column; align-items:center; justify-content:safe center; overflow-y:auto; }
      .animated-scene.visible { opacity:1; visibility:visible; transform:translateY(0); }
      .animated-copy { width:100%; max-width:440px; overflow-wrap:anywhere; }
      .animated-eyebrow { font:400 12px/1.7 var(--font-body,Arial),sans-serif; letter-spacing:.24em; text-transform:uppercase; }
      .animated-scene h1 { font:400 clamp(46px,12cqw,78px)/1.08 var(--font-display,Georgia),serif; margin:22px 0; }
      .animated-scene h1 em { font:400 clamp(62px,15cqw,100px)/1.1 var(--font-script,Georgia),serif; }
      .animated-message { font:400 clamp(14px,3.5cqw,18px)/1.7 var(--font-display,Georgia),serif; margin:28px auto 0; max-width:340px; white-space:pre-line; }
      .animated-scene.couple { justify-content:flex-start; padding-top:12%; }
      .animated-names { position:relative; z-index:1; font:400 clamp(42px,11cqw,76px)/1.05 var(--font-script,Georgia),serif; margin:0; overflow-wrap:anywhere; }
      .animated-names span { display:block; font-size:.6em; margin:6px; }
      .animated-cutout { position:absolute; bottom:0; left:5%; width:90%; height:62%; object-fit:contain; object-position:center bottom; filter:drop-shadow(0 8px 12px #0002); }
      .animated-final-names { font:400 clamp(30px,8cqw,50px)/1.2 var(--font-script,Georgia),serif; margin:14px 0 22px; }
      .animated-day { font:italic 20px/1.5 Georgia,serif; text-transform:capitalize; }
      .animated-number { font:400 clamp(72px,19cqw,120px)/1 var(--font-display,Georgia),serif; margin:8px 0; }
      .animated-month { font:400 19px/1.5 Georgia,serif; text-transform:capitalize; }
      .animated-time { font:italic 18px/1.7 Georgia,serif; margin:8px 0; }
      .animated-rule { height:1px; width:70px; margin:22px auto; background:currentColor; opacity:.4; }
      .animated-venue { font:400 clamp(20px,5cqw,30px)/1.3 var(--font-display,Georgia),serif; }
      .animated-address { font:400 13px/1.6 var(--font-body,Arial),sans-serif; margin:10px 0 0; }
      .animated-replay { position:absolute; z-index:4; bottom:calc(env(safe-area-inset-bottom) + 20px); left:50%; transform:translateX(-50%); font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.1em; padding:10px 14px; border:1px solid currentColor; border-radius:30px; background:var(--card); color:var(--ink); cursor:pointer; white-space:nowrap; }
      @media (prefers-reduced-motion:reduce) { .animated-scene { transition:none!important; transform:none!important; } .border-bouquet { animation:none!important; } }
      @media (max-height:650px) { .animated-scene { padding:7% 9% 65px; } .animated-final-names { margin:8px 0 10px; } .animated-number { font-size:68px; } .animated-rule { margin:12px auto; } }
    `}</style>
  </main>
}
