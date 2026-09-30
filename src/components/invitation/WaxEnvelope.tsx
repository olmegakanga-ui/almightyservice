'use client'

import type { CSSProperties, ReactNode } from 'react'


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

// A continuous surface avoids raster seams between independently rotated bands.
function PaperFaces({ side, children }: { side: 'left' | 'right'; children?: ReactNode }) {
  const front = `paper-light-${side}`
  const path = 'M0 0 Q52 8 100 50 Q52 92 0 100Z'
  return <div className={`paper-sheet sheet-${side}`}>
    <svg className="wax-paper-layer paper-front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={front} x1="0" y1="0" x2="1" y2=".75"><stop stopColor="color-mix(in srgb,var(--paper) 86%,white)"/><stop offset=".48" stopColor="var(--paper)"/><stop offset="1" stopColor="color-mix(in srgb,var(--paper) 72%,black)"/></linearGradient></defs>
      <path d={path} fill={`url(#${front})`}/>
    </svg>
    <svg className="wax-paper-layer paper-reverse" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={path}/></svg>
    <svg className="wax-paper-layer paper-light" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={path}/></svg>
    {children}
  </div>
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
        {[0, 1.5, 3].map(depth => <img key={depth} className="wax-seal-depth" style={{ transform: `translateZ(${depth}px)` }} src="/images/gold-ring-wax-seal.webp" alt="" aria-hidden="true" />)}
        <img className="wax-seal-face" src="/images/gold-ring-wax-seal.webp" alt="" draggable={false} fetchPriority="high" />
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
      .wax-paper-layer { position:absolute; inset:0; width:100%; height:100%; transform:translateZ(.45px); backface-visibility:hidden; }
      .paper-reverse { transform:rotateY(180deg) translateZ(.45px) scaleX(-1); fill:color-mix(in srgb,var(--paper) 94%,#fff7e8); }
      .paper-light { fill:white; opacity:0; transform:translateZ(.5px); }
      .wax-cast-shadow { position:absolute; inset:0; background:radial-gradient(ellipse at 45% 48%,#0009,transparent 68%); opacity:.15; pointer-events:none; }
      .wax-seal { position:absolute; left:calc(100% - 52px); top:calc(50% - 52px); width:104px; height:104px; padding:0; border:0; background:none; color:var(--seal-ink); cursor:pointer; pointer-events:auto; transform:translateZ(7px); transform-style:preserve-3d; }
      .wax-seal:focus-visible { outline:2px solid var(--ink); outline-offset:5px; border-radius:50%; }
      .wax-seal img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; backface-visibility:hidden; } .wax-seal-depth { filter:brightness(.56) saturate(.8); } .wax-seal-face { transform:translateZ(4.5px); filter:drop-shadow(1px 5px 3px #32190665); }
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
      .wax-envelope.opening .wax-left { animation:wax-left-unfold 3.8s cubic-bezier(.42,0,.28,1) .04s both; }
      .wax-envelope.opening .wax-right { animation:wax-right-unfold 3.8s cubic-bezier(.42,0,.28,1) .32s both; }
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

