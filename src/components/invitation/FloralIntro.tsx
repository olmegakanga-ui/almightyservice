'use client'

import { useEffect, useState } from 'react'
import { parseEventDate } from '@/lib/date-utils'

interface Props {
  groomName: string
  brideName: string
  guestName: string
  eventDate: string
  venueName: string
  photoUrl: string | null
  showCouple: boolean
  showBranding: boolean
  onComplete: () => void
}

export default function FloralIntro({
  groomName, brideName, guestName, eventDate, venueName,
  photoUrl, showCouple, showBranding, onComplete,
}: Props) {
  const [phase, setPhase] = useState(0)
  const { full: date, time } = parseEventDate(eventDate)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(onComplete, 100)
      return () => window.clearTimeout(timer)
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 450),
      window.setTimeout(() => setPhase(2), 1350),
      window.setTimeout(() => setPhase(3), 4200),
      window.setTimeout(() => setPhase(4), 6800),
      window.setTimeout(() => setPhase(5), 9100),
      window.setTimeout(onComplete, 9800),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [onComplete])

  return (
    <div className={`floral-intro phase-${phase}`} role="dialog" aria-label="Ouverture de l'invitation">
      <div className="floral-cover" aria-hidden="true">
        <div className="floral-envelope-paper" />
        <div className="floral-flap">
          <div className="floral-flap-paper" />
          <div className="floral-wax">
            <span>{groomName.charAt(0)}<small>&amp;</small>{brideName.charAt(0)}</span>
          </div>
        </div>
      </div>
      <div className="floral-pages">
        <div className="floral-page floral-page-one">
          <div className="floral-page-center">
            <p className="floral-eyebrow">Une histoire d’amour à célébrer</p>
            <h1>Vous êtes<br />invités</h1>
            <p className="floral-script">à notre mariage</p>
            <p className="floral-recipient">Une invitation pour {guestName}</p>
          </div>
        </div>
        <div className="floral-page floral-page-two">
          <div className="floral-page-center">
            {showCouple && <h2>{groomName} <span>&amp;</span> {brideName}</h2>}
            <p className="floral-eyebrow">ont l’honneur de vous inviter</p>
            {photoUrl && <div className="floral-couple-photo" style={{ backgroundImage: `url("${photoUrl.replaceAll('"', '%22')}")` }} role="img" aria-label="Photo du couple" />}
            <p className="floral-venue">{venueName}</p>
          </div>
        </div>
        <div className="floral-page floral-page-three">
          <div className="floral-page-center">
            <p className="floral-script">Le Mariage</p>
            <p className="floral-eyebrow">Nous serions heureux de vous y retrouver</p>
            <p className="floral-date">{date}</p>
            <p className="floral-venue">à {time} · {venueName}</p>
          </div>
        </div>
      </div>
      {showBranding && <span className="floral-brand">AlmightyService</span>}
      <button type="button" className="floral-skip" onClick={onComplete}>Passer</button>
      <style>{`
        .floral-intro { position:fixed; inset:0; z-index:9999; overflow:hidden; background:#edc9c2; color:#765b5a; transition:opacity .7s ease; }
        .floral-intro.phase-5 { opacity:0; pointer-events:none; }
        .floral-pages,.floral-page { position:absolute; inset:0; }
        .floral-page { display:grid; place-items:center; background:#f4d7ce url('/images/floral-invitation-v2.webp') center/cover no-repeat; text-align:center; padding:18vh 9vw 14vh; opacity:0; transform:scale(1.035); transition:opacity .85s ease,transform 1.7s ease; }
        .phase-0 .floral-page-one,.phase-1 .floral-page-one,.phase-2 .floral-page-one,.phase-3 .floral-page-two,.phase-4 .floral-page-three { opacity:1; transform:scale(1); }
        .floral-page-one .floral-page-center { opacity:0; transform:translateY(12px); transition:opacity 1s ease .45s,transform 1.2s ease .45s; }
        .phase-2 .floral-page-one .floral-page-center { opacity:1; transform:translateY(0); }
        .floral-page-center { width:min(100%,560px); padding:1.5rem 1rem; text-shadow:0 1px 14px #fff9f5; }
        .floral-eyebrow { font:500 clamp(10px,2vw,13px)/1.6 Arial,sans-serif; text-transform:uppercase; letter-spacing:.22em; }
        .floral-page h1 { margin:18px 0 4px; font:normal clamp(48px,13vw,100px)/.99 Georgia,serif; letter-spacing:-.045em; }
        .floral-script { margin:12px 0; font:italic clamp(29px,7vw,60px)/1.1 Georgia,serif; }
        .floral-recipient { margin-top:36px; font:italic clamp(16px,3vw,23px) Georgia,serif; }
        .floral-page h2 { margin:0 0 14px; font:italic clamp(44px,10vw,78px)/1.08 Georgia,serif; }
        .floral-page h2 span { color:#ad777c; font-size:.65em; }
        .floral-couple-photo { width:min(58vw,290px); height:min(34vh,315px); margin:22px auto 10px; border:7px solid #fff6f0; border-radius:48% 48% 4px 4px; background-size:cover; background-position:center; box-shadow:0 12px 35px #956b6b55; }
        .floral-date { font:normal clamp(36px,9vw,68px)/1.1 Georgia,serif; margin:38px auto 12px; }
        .floral-venue { font:italic clamp(17px,3vw,24px)/1.45 Georgia,serif; }
        .floral-cover { position:absolute; inset:0; z-index:3; overflow:hidden; pointer-events:none; }
        .floral-envelope-paper { position:absolute; inset:0; background:linear-gradient(125deg,#fff0ec 0%,#f5d6d5 50%,#eac3c5 100%); box-shadow:12px 0 26px #8b626b35; transition:transform 1.15s cubic-bezier(.4,0,.2,1); }
        .floral-envelope-paper:before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,#ffffff0a 0 1px,transparent 1px 3px); }
        .floral-flap { position:absolute; top:0; bottom:0; right:0; width:78%; filter:drop-shadow(-8px 9px 10px #77515e45); transition:transform .95s cubic-bezier(.4,0,.2,1); }
        .floral-flap-paper { position:absolute; inset:0; clip-path:polygon(100% 0,18% 50%,100% 100%); background:linear-gradient(115deg,#fff3ef 0%,#f8dfe0 48%,#eed0d3 100%); }
        .floral-wax { position:absolute; top:calc(50% - 39px); left:calc(18% - 39px); width:78px; height:78px; border-radius:47% 53% 50% 46%; display:grid; place-items:center; background:radial-gradient(circle at 35% 28%,#fff7e9,#e8d4bf 70%,#cba996); border:1px solid #d2b6a0; box-shadow:inset 0 0 0 4px #f2dfc9,inset 0 0 0 5px #c9ab92,2px 5px 10px #81586740; color:#967563; font:italic 27px var(--font-script,Georgia),serif; }
        .floral-wax span { display:flex; align-items:center; gap:2px; text-shadow:0 1px 0 #fff4e4; }
        .floral-wax small { font:italic 13px Georgia,serif; }
        .floral-intro:not(.phase-0) .floral-flap { transform:translateX(118%); }
        .phase-2 .floral-envelope-paper,.phase-3 .floral-envelope-paper,.phase-4 .floral-envelope-paper,.phase-5 .floral-envelope-paper { transform:translateX(-105%); }
        .floral-skip { position:absolute; z-index:5; top:calc(env(safe-area-inset-top) + 18px); right:20px; padding:9px 17px; border:1px solid #a9797b; border-radius:30px; color:#694c50; background:#fff7f0d9; font:12px Arial,sans-serif; cursor:pointer; }
        .floral-brand { position:absolute; z-index:2; bottom:calc(env(safe-area-inset-bottom) + 20px); left:50%; transform:translateX(-50%); font:italic 17px Georgia,serif; }
        @media (max-height:610px) { .floral-page { padding-top:13vh; padding-bottom:10vh; } .floral-couple-photo { height:27vh; } .floral-page h1 { font-size:clamp(38px,10vw,65px); } }
        @media (prefers-reduced-motion:reduce) { .floral-intro * { animation:none!important; transition:none!important; } }
      `}</style>
    </div>
  )
}
