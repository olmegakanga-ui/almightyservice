'use client'

import type { CSSProperties, ReactNode } from 'react'

const WAX_OUTLINE = 'M60 5C70 2 76 9 85 9C95 10 96 19 104 25C112 32 109 40 115 49C120 59 114 66 113 75C111 86 102 89 97 98C91 108 81 106 71 113C61 119 51 112 42 112C31 112 28 103 19 98C9 92 13 81 7 72C1 62 7 54 7 44C8 34 17 30 22 21C27 12 38 15 45 9C50 5 55 7 60 5Z'

// Each petal opens and then departs: no replacement flower/flight layer.
const BLOOM_PETALS = [
  { count: 7, length: 20, width: 17, depth: 0, tilt: -10 },
  { count: 5, length: 14, width: 13, depth: 12, tilt: -28 },
].flatMap((ring, layer) => Array.from({ length: ring.count }, (_, i) => {
  const angle = i * 360 / ring.count + layer * 31
  const radians = (angle - 90) * Math.PI / 180
  return {
    '--bloom-angle': `${angle}deg`, '--bloom-length': `${ring.length}cqw`,
    '--bloom-width': `${ring.width}cqw`, '--bloom-depth': `${ring.depth}px`,
    '--bloom-tilt': `${ring.tilt}deg`, '--bloom-delay': `${.55 + layer * .1 + i * .035}s`,
    '--flight-x': `${Math.cos(radians) * (75 + i * 5)}cqw`,
    '--flight-y': `${Math.sin(radians) * (95 + i * 4)}cqw`,
    '--flight-turn': `${angle + (i % 2 ? 48 : -38)}deg`,
  } as CSSProperties
}))

const PAPER_STRIPS = 9

// Nested hinges give the paper a changing curvature, including the seal at its tip.
function PaperStrip({ side, index, children }: { side: 'left' | 'right'; index: number; children?: ReactNode }) {
  const front = `paper-light-${side}-${index}`
  const path = 'M0 0 Q52 8 100 50 Q52 92 0 100Z'
  const viewBox = `${index * 100 / PAPER_STRIPS} 0 ${100 / PAPER_STRIPS} 100`
  return <div className={`paper-strip ${index === 0 ? 'strip-root' : ''}`} style={{ '--curl-delay': `${index * .018}s` } as CSSProperties}>
    <svg className="wax-paper-layer paper-front" viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={front} x1="0" y1="0" x2="1" y2=".75"><stop stopColor="color-mix(in srgb,var(--paper) 86%,white)"/><stop offset=".48" stopColor="var(--paper)"/><stop offset="1" stopColor="color-mix(in srgb,var(--paper) 72%,black)"/></linearGradient></defs>
      <path d={path} fill={`url(#${front})`}/>
    </svg>
    <svg className="wax-paper-layer paper-reverse" viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true"><path d={path}/></svg>
    <svg className="wax-paper-layer paper-light" viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true"><path d={path}/></svg>
    {index < PAPER_STRIPS - 1 ? <PaperStrip side={side} index={index + 1}>{children}</PaperStrip> : children}
  </div>
}

function PaperFaces({ side, children }: { side: 'left' | 'right'; children?: ReactNode }) {
  return <div className={`paper-sheet sheet-${side}`}><PaperStrip side={side} index={0}>{children}</PaperStrip></div>
}

export default function WaxEnvelope({ opening, hidden, groomName, brideName, onOpen, onReveal }: {
  opening: boolean; hidden: boolean; groomName: string; brideName: string; onOpen: () => void; onReveal: () => void
}) {
  return <div className={`wax-envelope ${opening ? 'opening' : ''} ${hidden ? 'finished' : ''}`} aria-hidden={opening}>
    <div className="wax-back" /><div className="wax-cast-shadow" aria-hidden="true" />
    <div className="wax-fold wax-top"><i className="fold-front"/><i className="fold-reverse"/></div><div className="wax-fold wax-bottom"><i className="fold-front"/><i className="fold-reverse"/></div>
    <div className="wax-side wax-right"><PaperFaces side="right"/></div>
    <div className="wax-side wax-left"><PaperFaces side="left">
      <button className="wax-seal" onClick={onOpen} disabled={opening} aria-label="Ouvrir l’invitation">
        {[0, 2, 4, 6].map(depth => <svg key={depth} className="wax-seal-depth" style={{ transform: `translateZ(${depth}px)` }} viewBox="0 0 120 120" aria-hidden="true"><path d={WAX_OUTLINE}/></svg>)}
        <svg className="wax-seal-face" viewBox="0 0 120 120" aria-hidden="true">
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
              <feSpecularLighting in="height" surfaceScale="6" specularConstant=".65" specularExponent="16" lightingColor="#fff7e8" result="shine"><fePointLight x="-50" y="-90" z="160" /></feSpecularLighting>
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
          <circle cx="60" cy="60" r="39" fill="url(#wax-imprint)" stroke="color-mix(in srgb,var(--accent) 58%,black)" strokeWidth="4" />
          <circle cx="59.3" cy="59.1" r="41.5" fill="none" stroke="#fff8e6" strokeOpacity=".65" strokeWidth="2" />
          <path d="M20 51C18 30 37 15 59 17M75 101C91 96 104 81 104 65" fill="none" stroke="#fff7df" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round"/>
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
    </PaperFaces></div>
    <div className="wax-blossom" aria-hidden="true">
      <div className="wax-flower-shadow" />
      <div className="wax-flower-head">{BLOOM_PETALS.map((style, i) => <span className="bloom-hinge" style={style} key={i} onAnimationEnd={i === BLOOM_PETALS.length - 1 ? e => { if (e.animationName === 'petal-depart') onReveal() } : undefined}>
        <i className="bloom-petal"/>

      </span>)}<img className="wax-rose-core" src="/images/intro-ivory-rose.webp" alt=""/></div>
    </div>
    {!opening && <p className="wax-hint">Touchez le sceau pour ouvrir</p>}
    <style>{`
      .wax-envelope { position:absolute; inset:0; z-index:3; perspective:1100px; perspective-origin:50% 48%; transform-style:preserve-3d; pointer-events:none; transition:opacity .55s; }
      .wax-envelope.finished { opacity:0; visibility:hidden; }
      .wax-back { position:absolute; inset:0; background:var(--paper); transition:opacity 1.8s ease 1.2s; }
      .wax-fold { position:absolute; inset:0; transform-style:preserve-3d; transform-origin:center top; will-change:transform; }
      .wax-top .fold-front,.wax-bottom .fold-reverse { clip-path:polygon(0 0,100% 0,50% 51%); }
      .wax-bottom { transform-origin:center bottom; }
      .wax-bottom .fold-front,.wax-top .fold-reverse { clip-path:polygon(0 100%,100% 100%,50% 49%); }
      .fold-front,.fold-reverse { position:absolute; inset:0; backface-visibility:hidden; background:linear-gradient(120deg,#ffffff25,#00000035),var(--paper); transform:translateZ(2px); }
      .fold-reverse { transform:rotateX(180deg) translateZ(2px); background:linear-gradient(20deg,#00000030,#ffffff25),var(--paper); }
      .wax-bottom .fold-front { background:linear-gradient(30deg,#00000035,#ffffff20),var(--paper); }
      .wax-side { position:absolute; top:0; bottom:0; width:50%; transform-style:preserve-3d; will-change:transform; }
      .wax-left { left:0; transform-origin:left center; z-index:2; }
      .wax-right { right:0; transform-origin:right center; }
      .paper-sheet { position:absolute; inset:0; transform-style:preserve-3d; }
      .sheet-right { transform:scaleX(-1); }
      .paper-strip { position:absolute; top:0; height:100%; left:calc(100% - .2px); width:100%; transform-origin:left center; transform-style:preserve-3d; }
      .paper-strip.strip-root { left:0; width:calc(100% / ${PAPER_STRIPS}); }
      .wax-paper-layer { position:absolute; inset:0; width:calc(100% + .4px); height:100%; transform:translateZ(.45px); backface-visibility:hidden; }
      .paper-reverse { transform:rotateY(180deg) translateZ(.45px) scaleX(-1); fill:color-mix(in srgb,var(--paper) 94%,#fff7e8); }
      .paper-light { fill:white; opacity:0; transform:translateZ(.5px); }
      .wax-envelope.opening .paper-strip { animation:paper-curl 3.4s cubic-bezier(.25,.1,.25,1) var(--curl-delay) both; }
      .wax-envelope.opening .sheet-right .paper-strip { animation-delay:calc(.3s + var(--curl-delay)); }
      @keyframes paper-curl { 0%,100% { transform:rotateY(0deg); } 38% { transform:rotateY(-5deg); } 72% { transform:rotateY(-2deg); } }
      .wax-cast-shadow { position:absolute; inset:0; background:radial-gradient(ellipse at 45% 48%,#0009,transparent 68%); opacity:.15; pointer-events:none; }
      .wax-seal { position:absolute; left:calc(100% - 52px); top:calc(50% - 52px); width:104px; height:104px; padding:0; border:0; background:none; color:var(--seal-ink); cursor:pointer; pointer-events:auto; transform:translateZ(7px); transform-style:preserve-3d; }
      .wax-seal:focus-visible { outline:2px solid var(--ink); outline-offset:5px; border-radius:50%; }
      .wax-seal svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; backface-visibility:hidden; } .wax-seal-depth { fill:color-mix(in srgb,var(--accent) 52%,#382619); stroke:color-mix(in srgb,var(--accent) 80%,white); stroke-width:.35; } .wax-seal-face { transform:translateZ(8px); filter:drop-shadow(2px 4px 3px #0005); }
      .wax-monogram { font:400 28px var(--font-script,Georgia),serif; fill:color-mix(in srgb,var(--seal-ink) 58%,var(--accent)); filter:drop-shadow(0 .8px 0 #ffffff70) drop-shadow(0 -.7px 0 #0003); }
      .wax-amp { font:italic 12px Georgia,serif; }
      .wax-engraving { opacity:.65; filter:drop-shadow(0 1px 0 #ffffff80); }
      .wax-hint { color:var(--envelope-ink); position:absolute; bottom:10%; width:100%; text-align:center; font:400 11px var(--font-body,Arial),sans-serif; letter-spacing:.13em; }
      .wax-blossom { position:absolute; left:50%; top:50%; width:0; height:0; transform-style:preserve-3d; transform:translateZ(80px); z-index:4; }
      .wax-flower-head { position:absolute; width:0; height:0; transform-style:preserve-3d; transform:rotateX(12deg) rotateZ(-8deg); }
      .bloom-hinge { position:absolute; width:0; height:0; transform-style:preserve-3d; opacity:0; }
      .bloom-petal { position:absolute; width:var(--bloom-width); height:var(--bloom-length); left:calc(var(--bloom-width) * -.5); bottom:-1cqw; transform-origin:50% 100%; transform:rotateX(-78deg); background:url('/images/intro-ivory-petal.webp') center/100% 100% no-repeat; filter:drop-shadow(1px 3px 2px #49362130); backface-visibility:visible; }
      .wax-rose-core { position:absolute; width:19cqw; height:19cqw; max-width:none; left:-9.5cqw; top:-9.5cqw; object-fit:contain; transform:translateZ(28px); opacity:0; }
      .wax-envelope.opening .wax-rose-core { animation:rose-heart 3.1s linear .55s both; }
      @keyframes rose-heart { 0% { opacity:0; transform:translateZ(28px) scale(.5); } 22%,57% { opacity:1; transform:translateZ(28px) scale(1); } 80%,100% { opacity:0; transform:translateZ(40px) scale(1.05); } }
      .wax-flower-shadow { position:absolute; width:43cqw; height:24cqw; left:-21.5cqw; top:-8cqw; border-radius:50%; background:radial-gradient(ellipse,#281a174a,transparent 68%); transform:translateZ(-75px); opacity:0; }
      .wax-envelope.opening .wax-left { animation:wax-left-unfold 3.4s cubic-bezier(.28,.12,.22,1) .04s both; }
      .wax-envelope.opening .wax-right { animation:wax-right-unfold 3.5s cubic-bezier(.32,.05,.25,1) .32s both; }
      .wax-envelope.opening .wax-top { animation:wax-top-unfold 3s cubic-bezier(.32,.05,.25,1) .5s both; }
      .wax-envelope.opening .wax-bottom { animation:wax-bottom-unfold 3.4s cubic-bezier(.32,.05,.25,1) .65s both; }
      /* One continuous curve avoids a slowdown at every intermediate keyframe. */
      @keyframes wax-left-unfold {
        from { transform:rotateY(0deg); }
        to { transform:translateX(-14%) rotateY(-155deg); }
      }
      @keyframes wax-right-unfold {
        from { transform:rotateY(0deg); }
        to { transform:translateX(14%) rotateY(151deg); }
      }
      @keyframes wax-top-unfold {
        from { transform:rotateX(0deg); opacity:1; }
        to { transform:rotateX(145deg); opacity:1; }
      }
      @keyframes wax-bottom-unfold {
        from { transform:rotateX(0deg); opacity:1; }
        to { transform:rotateX(-145deg); opacity:1; }
      }
      .wax-envelope.opening .wax-back { opacity:0; }
      .wax-envelope.opening .paper-light { animation:paper-reflection 4.2s ease .08s both; }
      .wax-envelope.opening .wax-cast-shadow { animation:paper-shadow 5.2s ease both; }
      .wax-envelope.opening .bloom-hinge { animation:petal-depart 3.7s linear var(--bloom-delay) both; }
      .wax-envelope.opening .bloom-petal { animation:petal-unfold 3.7s linear var(--bloom-delay) both; }
      .wax-envelope.opening .wax-flower-shadow { animation:flower-shadow 4.5s ease both; }
      @keyframes paper-reflection { 0%,100% { opacity:0; } 42% { opacity:.18; } 65% { opacity:.06; } }
      @keyframes paper-shadow { 0% { opacity:.15; transform:scaleX(1); } 32% { opacity:.35; transform:translateX(-8%) scaleX(1.2); } 72%,100% { opacity:0; transform:scaleX(.6); } }
      @keyframes flower-shadow { 0%,100% { opacity:0; } 25%,48% { opacity:.55; } }
      @keyframes petal-unfold {
        0% { transform:rotateX(-78deg) scale(.55); }
        35% { transform:rotateX(-38deg) scale(.85); }
        58% { transform:rotateX(var(--bloom-tilt)) scale(1); }
        100% { transform:rotateX(38deg) rotateY(55deg) scale(1.2); }
      }
      @keyframes petal-depart {
        0% { opacity:0; transform:translateZ(var(--bloom-depth)) rotateZ(var(--bloom-angle)); }
        12% { opacity:1; }
        52% { opacity:1; transform:translateZ(var(--bloom-depth)) rotateZ(var(--bloom-angle)); }
        78% { opacity:.85; }
        100% { opacity:0; transform:translate3d(var(--flight-x),var(--flight-y),180px) rotateZ(var(--flight-turn)); }
      }
      @media (prefers-reduced-motion:reduce) { .wax-envelope.opening { display:none; } .wax-envelope * { animation:none!important; transition:none!important; } }
    `}</style>
  </div>
}

