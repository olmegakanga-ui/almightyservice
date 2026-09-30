'use client'

import type { CSSProperties } from 'react'

const WAX_OUTLINE = 'M60 5C70 2 76 9 85 9C95 10 96 19 104 25C112 32 109 40 115 49C120 59 114 66 113 75C111 86 102 89 97 98C91 108 81 106 71 113C61 119 51 112 42 112C31 112 28 103 19 98C9 92 13 81 7 72C1 62 7 54 7 44C8 34 17 30 22 21C27 12 38 15 45 9C50 5 55 7 60 5Z'

const PETALS = Array.from({ length: 14 }, (_, i) => {
  const angle = i * 137.5
  const radians = angle * Math.PI / 180
  return {
    '--angle': `${angle}deg`,
    '--origin-x': `${Math.cos(radians) * (12 + i % 3 * 2)}cqw`,
    '--origin-y': `${Math.sin(radians) * (12 + i % 3 * 2)}cqw`,
    '--drift-x': `${Math.cos(radians) * (70 + i * 4)}cqw`,
    '--drift-y': `${Math.sin(radians) * (90 + i * 4)}cqw`,
    '--turn': `${angle + (i % 2 ? 150 : -180)}deg`,
    '--delay': `${4.15 + i * .045}s`,
    '--size': `${11 + (i % 4) * 2}cqw`,
  } as CSSProperties
})

export default function WaxEnvelope({ opening, hidden, groomName, brideName, onOpen }: {
  opening: boolean; hidden: boolean; groomName: string; brideName: string; onOpen: () => void
}) {
  return <div className={`wax-envelope ${opening ? 'opening' : ''} ${hidden ? 'finished' : ''}`} aria-hidden={opening}>
    <div className="wax-back" />
    <div className="wax-fold wax-top" /><div className="wax-fold wax-bottom" />
    <div className="wax-side wax-right"><svg className="wax-side-paper" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 Q48 4 100 50 Q48 96 0 100Z" /></svg></div>
    <div className="wax-side wax-left"><svg className="wax-side-paper" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 Q48 4 100 50 Q48 96 0 100Z" /></svg>
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
          <defs>
            <linearGradient id="wax-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff5d6"/><stop offset=".35" stopColor="var(--accent)"/><stop offset=".7" stopColor="color-mix(in srgb,var(--accent) 48%,#442b14)"/><stop offset="1" stopColor="color-mix(in srgb,var(--accent) 80%,white)"/></linearGradient>
            <filter id="wax-relief"><feDropShadow dx="1" dy="1.6" stdDeviation=".65" floodColor="#29180d" floodOpacity=".7"/></filter>
          </defs>
          <g className="wax-botanical" fill="url(#wax-leaf)" stroke="color-mix(in srgb,var(--accent) 65%,#fff4cb)" strokeWidth=".65" filter="url(#wax-relief)">
            <path d="M57 87Q59 65 65 33" fill="none" strokeWidth="2.4" />
            <path d="M63 44Q50 43 51 32Q63 32 63 44ZM62 53Q73 51 76 40Q63 41 62 53ZM60 62Q46 60 45 48Q60 48 60 62ZM59 70Q72 69 78 56Q62 57 59 70ZM58 79Q44 77 42 64Q56 64 58 79ZM58 85Q70 85 76 74Q63 74 58 85ZM65 37Q59 27 67 23Q73 31 65 37Z" />
          </g>
        </svg>
      </button>
    </div>
    <div className="wax-blossom" aria-hidden="true"><img className="wax-rose" src="/images/intro-ivory-rose.webp" alt="" />{PETALS.map((style, i) => <i key={i} className="wax-petal" style={style} />)}</div>
    {!opening && <p className="wax-hint">Touchez le sceau pour ouvrir</p>}
    <style>{`
      .wax-envelope { position:absolute; inset:0; z-index:3; perspective:1200px; pointer-events:none; transition:opacity .55s; }
      .wax-envelope.finished { opacity:0; visibility:hidden; }
      .wax-back { position:absolute; inset:0; background:var(--paper); transition:opacity 2.8s ease 2.15s; }
      .wax-fold { position:absolute; inset:0; background:linear-gradient(120deg,#ffffff20,#00000020),var(--paper); backface-visibility:hidden; transform-origin:center top; }
      .wax-top { clip-path:polygon(0 0,100% 0,50% 51%); }
      .wax-bottom { transform-origin:center bottom; clip-path:polygon(0 100%,100% 100%,50% 49%); background:linear-gradient(30deg,#00000024,#ffffff16),var(--paper); }
      .wax-side { position:absolute; top:0; bottom:0; width:52%; transform-style:preserve-3d; backface-visibility:hidden; will-change:transform; filter:drop-shadow(5px 8px 8px #0004); }
      .wax-left { left:0; transform-origin:left center; z-index:2; }
      .wax-right { right:0; transform-origin:right center;  }
      .wax-side-paper { position:absolute; inset:0; width:100%; height:100%; overflow:visible; fill:var(--paper); filter:drop-shadow(2px 0 2px #0005); } .wax-side-paper path { stroke:color-mix(in srgb,var(--paper) 80%,white); stroke-width:.12; }
      .wax-right .wax-side-paper { transform:scaleX(-1); filter:brightness(.94) drop-shadow(-2px 0 2px #0005); }
      .wax-seal { position:absolute; left:calc(96.15% - 52px); top:calc(50% - 52px); width:104px; height:104px; padding:0; border:0; background:none; color:var(--seal-ink); cursor:pointer; pointer-events:auto; transform:translateZ(8px); filter:drop-shadow(3px 7px 5px #0005); }
      .wax-seal:focus-visible { outline:2px solid var(--ink); outline-offset:5px; border-radius:50%; }
      .wax-seal svg { width:100%; height:100%; overflow:visible; }
      .wax-monogram { font:400 28px var(--font-script,Georgia),serif; fill:color-mix(in srgb,var(--seal-ink) 58%,var(--accent)); filter:drop-shadow(0 .8px 0 #ffffff70) drop-shadow(0 -.7px 0 #0003); }
      .wax-amp { font:italic 12px Georgia,serif; }
      .wax-engraving { opacity:.65; filter:drop-shadow(0 1px 0 #ffffff80); }
      .wax-hint { color:var(--envelope-ink); position:absolute; bottom:10%; width:100%; text-align:center; font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.13em; }
      .wax-blossom { position:absolute; left:50%; top:50%; width:0; height:0; z-index:4; opacity:0; }

      .wax-rose { max-width:none; position:absolute; width:clamp(170px,48cqw,260px); height:clamp(170px,48cqw,260px); left:0; top:0; margin-left:clamp(-130px,-24cqw,-85px); margin-top:clamp(-130px,-24cqw,-85px); object-fit:contain; opacity:0; filter:drop-shadow(0 10px 16px #0003); }
      .wax-petal { position:absolute; width:var(--size); height:var(--size); left:calc(var(--size) * -.5); top:calc(var(--size) * -.5); background:url('/images/intro-ivory-petal.webp') center/contain no-repeat; filter:drop-shadow(1px 4px 3px #0002); opacity:0; will-change:transform,opacity; }
      .wax-envelope.opening .wax-left { animation:wax-left-unfold 4.2s cubic-bezier(.45,0,.25,1) .08s both; }
      .wax-envelope.opening .wax-right { animation:wax-right-unfold 4.2s cubic-bezier(.45,0,.25,1) .3s both; }
      .wax-envelope.opening .wax-top { animation:wax-top-unfold 4.4s cubic-bezier(.45,0,.25,1) .45s both; }
      .wax-envelope.opening .wax-bottom { animation:wax-bottom-unfold 4.4s cubic-bezier(.45,0,.25,1) .6s both; }
      /* One continuous curve avoids a slowdown at every intermediate keyframe. */
      @keyframes wax-left-unfold {
        from { transform:rotateY(0deg); }
        to { transform:rotateY(-104deg); }
      }
      @keyframes wax-right-unfold {
        from { transform:rotateY(0deg); }
        to { transform:rotateY(104deg); }
      }
      @keyframes wax-top-unfold {
        from { transform:rotateX(0deg); opacity:1; }
        to { transform:rotateX(74deg) translateY(-32%); opacity:0; }
      }
      @keyframes wax-bottom-unfold {
        from { transform:rotateX(0deg); opacity:1; }
        to { transform:rotateX(-74deg) translateY(32%); opacity:0; }
      }
      .wax-envelope.opening .wax-back { opacity:0; }
      .wax-envelope.opening .wax-blossom { opacity:1; }
      .wax-envelope.opening .wax-rose { animation:wax-rose-bloom 4.3s linear 1.25s both; }
      .wax-envelope.opening .wax-petal { animation:wax-petal-flight 3s cubic-bezier(.2,.45,.35,1) var(--delay) both; }
      @keyframes wax-rose-bloom {
        0% { opacity:0; transform:scale(.22) rotate(-10deg) rotateX(24deg); animation-timing-function:cubic-bezier(.22,.65,.3,1); }
        36% { opacity:1; transform:scale(.88) rotate(-2deg) rotateX(6deg); animation-timing-function:ease-out; }
        68% { opacity:1; transform:scale(1) rotate(0deg) rotateX(0deg); animation-timing-function:ease-in; }
        82% { opacity:.65; transform:scale(1.04) rotate(2deg); }
        100% { opacity:0; transform:scale(1.12) rotate(4deg); }
      }
      @keyframes wax-petal-flight {
        0% { opacity:0; transform:translate(var(--origin-x),var(--origin-y)) rotate(var(--angle)) rotateY(0deg) scale(.65); }
        12% { opacity:.95; }
        62% { opacity:.9; }
        100% { opacity:0; transform:translate(var(--drift-x),var(--drift-y)) rotate(var(--turn)) rotateY(65deg) scale(1.12); }
      }
      @media (prefers-reduced-motion:reduce) { .wax-envelope.opening { display:none; } .wax-envelope * { animation:none!important; transition:none!important; } }
    `}</style>
  </div>
}
