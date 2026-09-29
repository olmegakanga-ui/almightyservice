'use client'

import { useEffect, useState } from 'react'
import { parseEventDate } from '@/lib/date-utils'

interface Props {
  groomName: string
  brideName: string
  guestName: string
  eventDate: string
  venueName: string
  backgroundImageUrl: string
  showCouple: boolean
  showBranding: boolean
  onComplete: () => void
}

export default function FloralIntro({
  groomName, brideName, guestName, eventDate, venueName,
  backgroundImageUrl, showCouple, showBranding, onComplete,
}: Props) {
  const [phase, setPhase] = useState(0)
  const { full: date } = parseEventDate(eventDate)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const timer = window.setTimeout(onComplete, 100)
      return () => window.clearTimeout(timer)
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 600),
      window.setTimeout(() => setPhase(2), 1900),
      window.setTimeout(() => setPhase(3), 3900),
      window.setTimeout(() => setPhase(4), 6700),
      window.setTimeout(onComplete, 7500),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [onComplete])

  return (
    <div className={`floral-intro phase-${phase}`} role="dialog" aria-label="Ouverture de l'invitation">
      <div className="floral-stage">
        <div className="floral-flowers" aria-hidden="true">✿ <span>❀</span> ✿</div>
        <div className="floral-envelope" aria-hidden="true">
          <div className="floral-flap" />
          <div className="floral-seal">{groomName.charAt(0)} &amp; {brideName.charAt(0)}</div>
        </div>
        <div className="floral-paper">
          <div className="floral-first">
            <span className="floral-overline">Une belle nouvelle à partager</span>
            <span className="floral-rose" aria-hidden="true">❀</span>
            <h1>Vous êtes invités<br /><em>à notre mariage</em></h1>
            <span className="floral-guest">Cher·e {guestName}</span>
          </div>
          <div className="floral-second">
            <span className="floral-overline">Nous avons la joie de vous inviter</span>
            {showCouple && <h2>{groomName} <span>&amp;</span> {brideName}</h2>}
            <div className="floral-photo" style={{ backgroundImage: `url("${backgroundImageUrl.replaceAll('"', '%22')}")` }} role="img" aria-label="Photo des mariés" />
            <p>{date}<br />{venueName}</p>
            <span className="floral-continue">Découvrir l’invitation ↓</span>
          </div>
        </div>
      </div>
      {showBranding && <span className="floral-brand">AlmightyService</span>}
      <button type="button" className="floral-skip" onClick={onComplete}>Passer l’introduction</button>
      <style>{`
        .floral-intro { position:fixed; inset:0; z-index:9999; display:grid; place-items:center; overflow:hidden; background:radial-gradient(circle at 50% 30%,#fff8f5,#ead6d1 85%); color:#654b4d; transition:opacity .8s ease; }
        .floral-intro.phase-4 { opacity:0; pointer-events:none; }
        .floral-stage { position:relative; width:min(88vw,400px); height:min(76vh,690px); max-height:690px; perspective:1000px; }
        .floral-flowers { position:absolute; inset:-8% -12% auto; text-align:center; font-size:clamp(35px,9vw,65px); color:#d7a6a6; letter-spacing:25px; opacity:.65; }
        .floral-flowers span { color:#f9f0e9; text-shadow:0 3px 12px #c98988; }
        .floral-envelope { position:absolute; inset:25% 0 25%; background:linear-gradient(145deg,#fff5f3,#dcbebc); border:1px solid #d4aaa6; box-shadow:0 28px 65px #7d55504d; z-index:3; transition:transform 1s ease,opacity .8s ease; }
        .floral-envelope:after { content:''; position:absolute; inset:30% 0 0; background:linear-gradient(35deg,transparent 49%,#f8e7e3 50%) left/50% 100% no-repeat,linear-gradient(-35deg,transparent 49%,#f8e7e3 50%) right/50% 100% no-repeat; }
        .floral-flap { position:absolute; inset:0 0 49%; background:#efd6d2; clip-path:polygon(0 0,100% 0,50% 100%); transform-origin:top; transition:transform 1.2s ease; z-index:4; }
        .floral-seal { position:absolute; top:39%; left:calc(50% - 30px); z-index:5; width:60px; height:60px; display:grid; place-items:center; border-radius:50%; border:1px solid #ac8382; background:#e8ccca; font:italic 18px Georgia,serif; transition:opacity .3s; }
        .phase-1 .floral-flap,.phase-2 .floral-flap,.phase-3 .floral-flap,.phase-4 .floral-flap { transform:rotateX(175deg); }
        .phase-1 .floral-seal,.phase-2 .floral-seal,.phase-3 .floral-seal,.phase-4 .floral-seal { opacity:0; }
        .phase-2 .floral-envelope,.phase-3 .floral-envelope { transform:translateY(50%) scale(.88); opacity:0; }
        .floral-paper { position:absolute; inset:5% 0; overflow:hidden; background:linear-gradient(160deg,#fffaf7,#f4e0de); border:1px solid #e9c9c6; box-shadow:0 20px 50px #8f676744; opacity:0; transform:translateY(28%) scale(.85); transition:transform 1.2s cubic-bezier(.16,1,.3,1),opacity 1s; }
        .phase-2 .floral-paper,.phase-3 .floral-paper { opacity:1; transform:translateY(0) scale(1); }
        .floral-paper:before,.floral-paper:after { content:'❀'; position:absolute; font-size:110px; line-height:1; color:#e8bbba70; pointer-events:none; }
        .floral-paper:before { top:-35px; left:-30px; } .floral-paper:after { bottom:-35px; right:-30px; }
        .floral-first,.floral-second { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; transition:opacity .8s,transform .8s; }
        .floral-first { gap:18px; } .floral-second { gap:14px; opacity:0; transform:translateY(30px); }
        .phase-3 .floral-first { opacity:0; transform:translateY(-30px); } .phase-3 .floral-second { opacity:1; transform:none; }
        .floral-overline { font:10px Arial,sans-serif; letter-spacing:.22em; text-transform:uppercase; }
        .floral-rose { font-size:95px; line-height:1; color:#d6a5a4; }
        .floral-first h1 { font:normal clamp(30px,8vw,44px)/1.3 Georgia,serif; margin:0; }
        .floral-first h1 em { font-weight:normal; font-size:.8em; } .floral-guest { font:italic 17px Georgia,serif; }
        .floral-second h2 { font:italic clamp(36px,9vw,53px) Georgia,serif; margin:0; }
        .floral-second h2 span { font-size:.6em; color:#bd8d8b; }
        .floral-photo { width:78%; height:38%; background-size:cover; background-position:center; border-radius:48% 48% 4px 4px; box-shadow:0 8px 25px #8f676744; }
        .floral-second p { font:15px/1.7 Georgia,serif; margin:0; }
        .floral-continue { font:11px Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; }
        .floral-brand { position:absolute; bottom:30px; font:italic 18px Georgia,serif; opacity:.7; }
        .floral-skip { position:absolute; right:20px; top:20px; color:#654b4d; border:1px solid #caa9a6; border-radius:30px; background:#fff9f5c9; padding:9px 14px; cursor:pointer; font:12px Arial,sans-serif; }
        @media (max-height:600px) { .floral-stage { height:72vh; } .floral-rose { font-size:45px; } .floral-first { gap:8px; } .floral-flowers { display:none; } }
      `}</style>
    </div>
  )
}
