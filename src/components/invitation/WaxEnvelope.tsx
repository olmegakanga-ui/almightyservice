'use client'

import type { CSSProperties } from 'react'

const PETALS = Array.from({ length: 14 }, (_, i) => {
  const angle = i * 137.5
  const radians = angle * Math.PI / 180
  return {
    '--angle': `${angle}deg`,
    '--drift-x': `${Math.cos(radians) * (280 + i * 18)}px`,
    '--drift-y': `${Math.sin(radians) * (320 + i * 18)}px`,
    '--turn': `${angle + (i % 2 ? 150 : -180)}deg`,
    '--delay': `${1.05 + i * .035}s`,
    '--size': `${64 + (i % 4) * 12}px`,
  } as CSSProperties
})

export default function WaxEnvelope({ opening, hidden, groomName, brideName, onOpen }: {
  opening: boolean; hidden: boolean; groomName: string; brideName: string; onOpen: () => void
}) {
  return <div className={`wax-envelope ${opening ? 'opening' : ''} ${hidden ? 'finished' : ''}`} aria-hidden={opening}>
    <div className="wax-back" />
    <div className="wax-fold wax-top" /><div className="wax-fold wax-bottom" />
    <div className="wax-side wax-right"><div className="wax-side-paper" /></div>
    <div className="wax-side wax-left"><div className="wax-side-paper" />
      <button className="wax-seal" onClick={onOpen} disabled={opening} aria-label="Ouvrir l’invitation">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <radialGradient id="wax-body" cx="30%" cy="22%" r="85%"><stop stopColor="var(--accent)" /><stop offset=".4" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent)" /></radialGradient>
            <linearGradient id="wax-light" x2=".8" y2="1"><stop stopColor="#ffffff" stopOpacity=".5" /><stop offset=".45" stopColor="#ffffff" stopOpacity="0" /><stop offset="1" stopColor="#000000" stopOpacity=".35" /></linearGradient>
            <filter id="wax-grain"><feTurbulence type="fractalNoise" baseFrequency=".28" numOctaves="3" seed="7" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".12" /></feComponentTransfer><feComposite in2="SourceGraphic" operator="in" result="texture" /><feBlend in="SourceGraphic" in2="texture" mode="soft-light" /></filter>
          </defs>
          <path className="wax-body" d="M60 5C70 2 76 9 85 9C95 10 96 19 104 25C112 32 109 40 115 49C120 59 114 66 113 75C111 86 102 89 97 98C91 108 81 106 71 113C61 119 51 112 42 112C31 112 28 103 19 98C9 92 13 81 7 72C1 62 7 54 7 44C8 34 17 30 22 21C27 12 38 15 45 9C50 5 55 7 60 5Z" fill="url(#wax-body)" />
          <path d="M60 5C70 2 76 9 85 9C95 10 96 19 104 25C112 32 109 40 115 49C120 59 114 66 113 75C111 86 102 89 97 98C91 108 81 106 71 113C61 119 51 112 42 112C31 112 28 103 19 98C9 92 13 81 7 72C1 62 7 54 7 44C8 34 17 30 22 21C27 12 38 15 45 9C50 5 55 7 60 5Z" fill="url(#wax-light)" filter="url(#wax-grain)" />
          <circle cx="60" cy="60" r="42" fill="none" stroke="#000000" strokeOpacity=".23" strokeWidth="3" />
          <circle cx="59" cy="59" r="41" fill="none" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.5" />
          <g className="wax-engraving" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M42 87Q23 68 34 42M78 87Q97 68 86 42M34 73Q24 71 27 61Q36 62 34 73M32 60Q25 54 29 48Q37 52 32 60M35 48Q30 40 37 35Q42 42 35 48M86 73Q96 71 93 61Q84 62 86 73M88 60Q95 54 91 48Q83 52 88 60M85 48Q90 40 83 35Q78 42 85 48" />
          </g>
        </svg>
        <span className="wax-initials">{groomName.charAt(0)}<small>&amp;</small>{brideName.charAt(0)}</span>
      </button>
    </div>
    <div className="wax-blossom" aria-hidden="true">{PETALS.map((style, i) => <i key={i} className="wax-petal" style={style} />)}</div>
    {!opening && <p className="wax-hint">Touchez le sceau pour ouvrir</p>}
    <style>{`
      .wax-envelope { position:absolute; inset:0; z-index:3; perspective:1200px; pointer-events:none; transition:opacity .4s; }
      .wax-envelope.finished { opacity:0; visibility:hidden; }
      .wax-back { position:absolute; inset:0; background:var(--paper); transition:opacity 1s ease 1.1s; }
      .wax-fold { position:absolute; inset:0; background:linear-gradient(120deg,#ffffff20,#00000020),var(--paper); transition:transform 1.4s cubic-bezier(.22,.6,.25,1) .45s; }
      .wax-top { clip-path:polygon(0 0,100% 0,50% 51%); }
      .wax-bottom { clip-path:polygon(0 100%,100% 100%,50% 49%); background:linear-gradient(30deg,#00000024,#ffffff16),var(--paper); }
      .wax-side { position:absolute; top:0; bottom:0; width:50%; transform-style:preserve-3d; transition:transform 1.65s cubic-bezier(.35,.05,.2,1); filter:drop-shadow(5px 8px 8px #0004); }
      .wax-left { left:0; transform-origin:left center; z-index:2; }
      .wax-right { right:0; transform-origin:right center; transition-delay:.12s; }
      .wax-side-paper { position:absolute; inset:0; background:linear-gradient(110deg,#ffffff28,#00000018),var(--paper); clip-path:polygon(0 0,100% 50%,0 100%); }
      .wax-right .wax-side-paper { clip-path:polygon(100% 0,0 50%,100% 100%); background:linear-gradient(250deg,#ffffff18,#00000028),var(--paper); }
      .wax-side-paper:after { content:''; position:absolute; inset:0; opacity:.25; background:repeating-linear-gradient(0deg,#fff1 0 1px,transparent 1px 3px); }
      .wax-seal { position:absolute; left:calc(100% - 52px); top:calc(50% - 52px); width:104px; height:104px; padding:0; border:0; background:none; color:var(--seal-ink); cursor:pointer; pointer-events:auto; transform:translateZ(8px); filter:drop-shadow(3px 7px 5px #0005); }
      .wax-seal:focus-visible { outline:2px solid var(--ink); outline-offset:5px; border-radius:50%; }
      .wax-seal svg { width:100%; height:100%; overflow:visible; }
      .wax-initials { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:1px; padding-bottom:5px; font:400 28px var(--font-script,Georgia),serif; text-shadow:0 1px 0 #ffffff70,0 -1px 0 #0005; }
      .wax-initials small { font:italic 12px Georgia,serif; }
      .wax-engraving { opacity:.65; filter:drop-shadow(0 1px 0 #ffffff80); }
      .wax-hint { position:absolute; bottom:10%; width:100%; text-align:center; font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.13em; }
      .wax-blossom { position:absolute; left:50%; top:50%; width:0; height:0; z-index:4; opacity:0; }
      .wax-petal { position:absolute; width:var(--size); height:calc(var(--size) * .72); left:calc(var(--size) * -.5); top:calc(var(--size) * -.35); border-radius:64% 36% 57% 43% / 73% 52% 48% 27%; background:radial-gradient(ellipse at 30% 25%,#ffffff 0%,#fffaf4 35%,color-mix(in srgb,var(--accent) 28%,#f2e6dd) 72%,#c4b8ab 100%); box-shadow:inset 1px 3px 6px #fff9,inset -3px -4px 8px #715a4322,2px 5px 8px #0002; transform:rotate(var(--angle)) translateY(-18px) rotateX(35deg) scale(.35); opacity:0; }
      .wax-envelope.opening .wax-left { transform:translateX(-32%) rotateY(-112deg); }
      .wax-envelope.opening .wax-right { transform:translateX(32%) rotateY(112deg); }
      .wax-envelope.opening .wax-top { transform:translateY(-100%); }
      .wax-envelope.opening .wax-bottom { transform:translateY(100%); }
      .wax-envelope.opening .wax-back { opacity:0; }
      .wax-envelope.opening .wax-blossom { opacity:1; }
      .wax-envelope.opening .wax-petal { animation:wax-petal-flight 2.3s cubic-bezier(.2,.6,.3,1) var(--delay) both; }
      @keyframes wax-petal-flight {
        0% { opacity:0; transform:rotate(var(--angle)) translateY(-12px) rotateX(35deg) scale(.35); }
        18% { opacity:1; transform:rotate(var(--angle)) translateY(-24px) rotateX(20deg) scale(.9); }
        38% { opacity:1; transform:rotate(var(--angle)) translateY(-45px) rotateX(0) scale(1.15); }
        78% { opacity:.85; }
        100% { opacity:0; transform:translate(var(--drift-x),var(--drift-y)) rotate(var(--turn)) rotateY(65deg) scale(1.7); }
      }
      @media (prefers-reduced-motion:reduce) { .wax-envelope.opening { display:none; } .wax-envelope * { animation:none!important; transition:none!important; } }
    `}</style>
  </div>
}
