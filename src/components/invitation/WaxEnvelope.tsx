'use client'

import type { CSSProperties } from 'react'

const WAX_OUTLINE = 'M60 5C70 2 76 9 85 9C95 10 96 19 104 25C112 32 109 40 115 49C120 59 114 66 113 75C111 86 102 89 97 98C91 108 81 106 71 113C61 119 51 112 42 112C31 112 28 103 19 98C9 92 13 81 7 72C1 62 7 54 7 44C8 34 17 30 22 21C27 12 38 15 45 9C50 5 55 7 60 5Z'

const PETALS = Array.from({ length: 14 }, (_, i) => {
  const angle = i * 137.5
  const radians = angle * Math.PI / 180
  return {
    '--angle': `${angle}deg`,
    '--drift-x': `${Math.cos(radians) * (70 + i * 4)}cqw`,
    '--drift-y': `${Math.sin(radians) * (90 + i * 4)}cqw`,
    '--turn': `${angle + (i % 2 ? 150 : -180)}deg`,
    '--delay': `${2.05 + i * .025}s`,
    '--size': `${65 + (i % 4) * 10}px`,
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
            <radialGradient id="wax-body" cx="32%" cy="24%" r="80%">
              <stop stopColor="color-mix(in srgb,var(--accent) 75%,white)" />
              <stop offset=".3" stopColor="var(--accent)" />
              <stop offset=".65" stopColor="color-mix(in srgb,var(--accent) 90%,black)" />
              <stop offset=".85" stopColor="color-mix(in srgb,var(--accent) 72%,black)" />
              <stop offset="1" stopColor="color-mix(in srgb,var(--accent) 85%,white)" />
            </radialGradient>
            <radialGradient id="wax-imprint" cx="42%" cy="32%" r="80%">
              <stop stopColor="color-mix(in srgb,var(--accent) 93%,white)" />
              <stop offset=".8" stopColor="color-mix(in srgb,var(--accent) 88%,black)" />
              <stop offset="1" stopColor="color-mix(in srgb,var(--accent) 70%,black)" />
            </radialGradient>
            <filter id="wax-bevel" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="height" />
              <feSpecularLighting in="height" surfaceScale="4" specularConstant=".5" specularExponent="16" lightingColor="#fff7e8" result="shine"><fePointLight x="-50" y="-90" z="160" /></feSpecularLighting>
              <feComposite in="shine" in2="SourceAlpha" operator="in" result="edge" />
              <feBlend in="SourceGraphic" in2="edge" mode="screen" />
            </filter>
            <filter id="wax-grain">
              <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="3" seed="7" result="grain" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer><feFuncA type="linear" slope=".1" /></feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="in" result="texture" />
              <feBlend in="SourceGraphic" in2="texture" mode="soft-light" />
            </filter>
          </defs>
          <path d={WAX_OUTLINE} transform="translate(0 4)" fill="color-mix(in srgb,var(--accent) 58%,black)" />
          <path d={WAX_OUTLINE} fill="url(#wax-body)" filter="url(#wax-bevel)" />
          <path d={WAX_OUTLINE} fill="url(#wax-body)" opacity=".35" filter="url(#wax-grain)" />
          <circle cx="60" cy="60" r="41" fill="url(#wax-imprint)" stroke="color-mix(in srgb,var(--accent) 58%,black)" strokeWidth="2.4" />
          <circle cx="59.3" cy="59.1" r="42.5" fill="none" stroke="#fff8e6" strokeOpacity=".48" strokeWidth="1.3" />
          <circle cx="60.6" cy="61" r="38.5" fill="none" stroke="#fff8e6" strokeOpacity=".28" strokeWidth=".8" />
          <g className="wax-engraving" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M42 87Q23 68 34 42M78 87Q97 68 86 42M34 73Q24 71 27 61Q36 62 34 73M32 60Q25 54 29 48Q37 52 32 60M35 48Q30 40 37 35Q42 42 35 48M86 73Q96 71 93 61Q84 62 86 73M88 60Q95 54 91 48Q83 52 88 60M85 48Q90 40 83 35Q78 42 85 48" />
          </g>
          <text className="wax-monogram" x="60" y="69" textAnchor="middle">{groomName.charAt(0)}<tspan className="wax-amp">&amp;</tspan>{brideName.charAt(0)}</text>
        </svg>
      </button>
    </div>
    <div className="wax-blossom" aria-hidden="true"><img className="wax-rose" src="/images/intro-ivory-rose.webp" alt="" />{PETALS.map((style, i) => <i key={i} className="wax-petal" style={style} />)}</div>
    {!opening && <p className="wax-hint">Touchez le sceau pour ouvrir</p>}
    <style>{`
      .wax-envelope { position:absolute; inset:0; z-index:3; perspective:1200px; pointer-events:none; transition:opacity .55s; }
      .wax-envelope.finished { opacity:0; visibility:hidden; }
      .wax-back { position:absolute; inset:0; background:var(--paper); transition:opacity 1.15s ease .95s; }
      .wax-fold { position:absolute; inset:0; background:linear-gradient(120deg,#ffffff20,#00000020),var(--paper); backface-visibility:hidden; transform-origin:center top; }
      .wax-top { clip-path:polygon(0 0,100% 0,50% 51%); }
      .wax-bottom { transform-origin:center bottom; clip-path:polygon(0 100%,100% 100%,50% 49%); background:linear-gradient(30deg,#00000024,#ffffff16),var(--paper); }
      .wax-side { position:absolute; top:0; bottom:0; width:50%; transform-style:preserve-3d; backface-visibility:hidden; will-change:transform; filter:drop-shadow(5px 8px 8px #0004); }
      .wax-left { left:0; transform-origin:left center; z-index:2; }
      .wax-right { right:0; transform-origin:right center;  }
      .wax-side-paper { position:absolute; inset:0; background:linear-gradient(110deg,#ffffff28,#00000018),var(--paper); clip-path:polygon(0 0,100% 50%,0 100%); }
      .wax-right .wax-side-paper { clip-path:polygon(100% 0,0 50%,100% 100%); background:linear-gradient(250deg,#ffffff18,#00000028),var(--paper); }
      .wax-side-paper:after { content:''; position:absolute; inset:0; opacity:.25; background:repeating-linear-gradient(0deg,#fff1 0 1px,transparent 1px 3px); }
      .wax-seal { position:absolute; left:calc(100% - 52px); top:calc(50% - 52px); width:104px; height:104px; padding:0; border:0; background:none; color:var(--seal-ink); cursor:pointer; pointer-events:auto; transform:translateZ(8px); filter:drop-shadow(3px 7px 5px #0005); }
      .wax-seal:focus-visible { outline:2px solid var(--ink); outline-offset:5px; border-radius:50%; }
      .wax-seal svg { width:100%; height:100%; overflow:visible; }
      .wax-monogram { font:400 28px var(--font-script,Georgia),serif; fill:color-mix(in srgb,var(--seal-ink) 58%,var(--accent)); filter:drop-shadow(0 .8px 0 #ffffff70) drop-shadow(0 -.7px 0 #0003); }
      .wax-amp { font:italic 12px Georgia,serif; }
      .wax-engraving { opacity:.65; filter:drop-shadow(0 1px 0 #ffffff80); }
      .wax-hint { color:var(--envelope-ink); position:absolute; bottom:10%; width:100%; text-align:center; font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.13em; }
      .wax-blossom { position:absolute; left:50%; top:50%; width:0; height:0; z-index:4; opacity:0; }

      .wax-rose { max-width:none; position:absolute; width:clamp(170px,48cqw,260px); height:clamp(170px,48cqw,260px); left:0; top:0; margin-left:clamp(-130px,-24cqw,-85px); margin-top:clamp(-130px,-24cqw,-85px); object-fit:contain; opacity:0; filter:drop-shadow(0 10px 16px #0003); }
      .wax-petal { position:absolute; width:var(--size); height:var(--size); left:calc(var(--size) * -.5); top:calc(var(--size) * -.5); background:url('/images/intro-ivory-petal.webp') center/contain no-repeat; filter:drop-shadow(1px 4px 3px #0002); opacity:0; will-change:transform,opacity; }
      .wax-envelope.opening .wax-left { animation:wax-left-unfold 1.8s cubic-bezier(.32,.12,.22,1) .08s both; }
      .wax-envelope.opening .wax-right { animation:wax-right-unfold 1.8s cubic-bezier(.32,.12,.22,1) .23s both; }
      .wax-envelope.opening .wax-top { animation:wax-top-unfold 1.6s ease .45s both; }
      .wax-envelope.opening .wax-bottom { animation:wax-bottom-unfold 1.6s ease .55s both; }
      @keyframes wax-left-unfold {
        0% { transform:translateX(0) rotateY(0); opacity:1; }
        22% { transform:translateX(-6%) rotateY(-12deg); opacity:1; }
        58% { transform:translateX(-42%) rotateY(-52deg); opacity:1; }
        82% { opacity:1; }
        100% { transform:translateX(-116%) rotateY(-84deg); opacity:0; }
      }
      @keyframes wax-right-unfold {
        0% { transform:translateX(0) rotateY(0); opacity:1; }
        22% { transform:translateX(6%) rotateY(12deg); opacity:1; }
        58% { transform:translateX(42%) rotateY(52deg); opacity:1; }
        82% { opacity:1; }
        100% { transform:translateX(116%) rotateY(84deg); opacity:0; }
      }
      @keyframes wax-top-unfold {
        0% { transform:rotateX(0); opacity:1; }
        40% { transform:rotateX(12deg) translateY(-4%); opacity:1; }
        100% { transform:rotateX(35deg) translateY(-22%); opacity:0; }
      }
      @keyframes wax-bottom-unfold {
        0% { transform:rotateX(0); opacity:1; }
        40% { transform:rotateX(-12deg) translateY(4%); opacity:1; }
        100% { transform:rotateX(-35deg) translateY(22%); opacity:0; }
      }
      .wax-envelope.opening .wax-back { opacity:0; }
      .wax-envelope.opening .wax-blossom { opacity:1; }
      .wax-envelope.opening .wax-rose { animation:wax-rose-bloom 3.3s cubic-bezier(.22,.65,.3,1) .55s both; }
      .wax-envelope.opening .wax-petal { animation:wax-petal-flight 2.6s cubic-bezier(.28,.45,.3,1) var(--delay) both; }
      @keyframes wax-rose-bloom {
        0% { opacity:0; transform:scale(.15) rotate(-18deg); }
        30% { opacity:1; transform:scale(.82) rotate(-5deg); }
        52% { opacity:1; transform:scale(1) rotate(0deg); }
        66% { opacity:.7; transform:scale(1.12) rotate(4deg); }
        85%,100% { opacity:0; transform:scale(1.25) rotate(8deg); }
      }
      @keyframes wax-petal-flight {
        0% { opacity:0; transform:rotate(var(--angle)) translateY(-32px) scale(.4); }
        12% { opacity:1; transform:rotate(var(--angle)) translateY(-55px) scale(.8); }
        35% { opacity:1; transform:rotate(var(--angle)) translateY(-85px) scale(1); }
        75% { opacity:.85; }
        100% { opacity:0; transform:translate(var(--drift-x),var(--drift-y)) rotate(var(--turn)) rotateY(55deg) scale(1.35); }
      }
      @media (prefers-reduced-motion:reduce) { .wax-envelope.opening { display:none; } .wax-envelope * { animation:none!important; transition:none!important; } }
    `}</style>
  </div>
}
