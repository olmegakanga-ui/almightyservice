'use client'

import { useState, useRef } from 'react'

const TREE_IMAGE = 'https://res.cloudinary.com/dvgunmntx/image/upload/v1783957065/ChatGPT_Image_13_juil._2026_16_35_20_mgegzw.png'

interface Leaf {
  id: number
  x: number      // % horizontal
  y: number      // % vertical
  w: number      // largeur en % de la largeur totale
  rot: number    // rotation en degrés
}

const DEFAULT_W   = 7
const DEFAULT_ROT = 0

export default function TreeCalibrationPage() {
  const [leaves, setLeaves]       = useState<Leaf[]>([])
  const [selected, setSelected]   = useState<number | null>(null)
  const [showPreview, setPreview] = useState(true)
  const [copied, setCopied]       = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  const addLeaf = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return
    // Ignore les clics sur une feuille existante
    if ((e.target as HTMLElement).dataset.leaf) return

    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width)  * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100

    const id = leaves.length > 0 ? Math.max(...leaves.map(l => l.id)) + 1 : 1
    setLeaves(prev => [...prev, { id, x: +x.toFixed(2), y: +y.toFixed(2), w: DEFAULT_W, rot: DEFAULT_ROT }])
    setSelected(id)
  }

  const updateLeaf = (id: number, patch: Partial<Leaf>) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }

  const removeLeaf = (id: number) => {
    setLeaves(prev => prev.filter(l => l.id !== id))
    if (selected === id) setSelected(null)
  }

  const exportJSON = () => {
    const json = JSON.stringify(leaves, null, 2)
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(leaves, null, 2)], { type: 'application/json' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = 'tree-leaves.json'
    a.click()
  }

  const sel = leaves.find(l => l.id === selected)

  return (
    <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

      {/* ── ZONE IMAGE ── */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 300, color: 'white', marginBottom: '4px' }}>
            Calibration de l&apos;arbre
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
            Cliquez sur le centre de chaque feuille. Ajustez ensuite taille et rotation à droite.
          </p>
        </div>

        <div
          ref={imgRef}
          onClick={addLeaf}
          style={{
            position:      'relative',
            width:         '100%',
            aspectRatio:   '1041 / 1500',
            backgroundImage: `url(${TREE_IMAGE})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            cursor:        'crosshair',
            borderRadius:  '8px',
            border:        '1px solid rgba(255,255,255,0.1)',
            userSelect:    'none',
          }}
        >
          {showPreview && leaves.map(leaf => {
            const isSel = leaf.id === selected
            return (
              <div
                key={leaf.id}
                data-leaf="1"
                onClick={e => { e.stopPropagation(); setSelected(leaf.id) }}
                style={{
                  position:       'absolute',
                  left:           `${leaf.x}%`,
                  top:            `${leaf.y}%`,
                  width:          `${leaf.w}%`,
                  transform:      `translate(-50%, -50%) rotate(${leaf.rot}deg)`,
                  transformOrigin:'center',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '2px',
                  border:         isSel ? '2px solid #E24B4A' : '1px dashed rgba(140,90,40,0.55)',
                  borderRadius:   '50% 12% 50% 12%',
                  background:     isSel ? 'rgba(226,75,74,0.15)' : 'rgba(140,90,40,0.06)',
                  cursor:         'pointer',
                  boxSizing:      'border-box',
                  overflow:       'hidden',
                }}
              >
                <span style={{
                  fontFamily: 'Georgia, serif',
                  fontSize:   'clamp(4px, 0.55vw, 9px)',
                  color:      '#4A3520',
                  textAlign:  'center',
                  lineHeight: 1.15,
                  pointerEvents: 'none',
                }}>
                  Que votre amour grandisse chaque jour.
                </span>
                <span style={{
                  fontFamily: 'Georgia, serif',
                  fontSize:   'clamp(3px, 0.45vw, 7px)',
                  color:      '#8A6A45',
                  fontStyle:  'italic',
                  marginTop:  '1px',
                  pointerEvents: 'none',
                }}>
                  Marie D.
                </span>
                <span style={{
                  position:   'absolute',
                  top:        '1px',
                  left:       '2px',
                  fontSize:   '7px',
                  color:      isSel ? '#E24B4A' : 'rgba(90,60,30,0.5)',
                  fontWeight: 700,
                  pointerEvents: 'none',
                }}>
                  {leaf.id}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── PANNEAU DE CONTRÔLE ── */}
      <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold-light)', lineHeight: 1 }}>
            {leaves.length}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
            feuille{leaves.length > 1 ? 's' : ''} placée{leaves.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Réglages de la feuille sélectionnée */}
        {sel ? (
          <div style={{ padding: '16px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '14px' }}>
              Feuille #{sel.id}
            </p>

            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              Largeur — {sel.w}%
            </label>
            <input
              type="range" min="3" max="16" step="0.5"
              value={sel.w}
              onChange={e => updateLeaf(sel.id, { w: Number(e.target.value) })}
              style={{ width: '100%', marginBottom: '12px', accentColor: 'var(--gold)' }}
            />

            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              Rotation — {sel.rot}°
            </label>
            <input
              type="range" min="-60" max="60" step="1"
              value={sel.rot}
              onChange={e => updateLeaf(sel.id, { rot: Number(e.target.value) })}
              style={{ width: '100%', marginBottom: '14px', accentColor: 'var(--gold)' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => removeLeaf(sel.id)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(184,80,96,0.4)', background: 'rgba(184,80,96,0.12)', color: '#E89AA6', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Désélectionner
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Cliquez sur une feuille de l&apos;arbre pour la placer, ou sur un repère existant pour l&apos;ajuster.
            </p>
          </div>
        )}

        {/* Appliquer à toutes */}
        {leaves.length > 0 && (
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              Actions globales
            </p>
            <button
              onClick={() => setPreview(p => !p)}
              style={{ width: '100%', padding: '9px', marginBottom: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              {showPreview ? 'Masquer les repères' : 'Afficher les repères'}
            </button>
            <button
              onClick={() => { if (confirm('Tout effacer ?')) { setLeaves([]); setSelected(null) } }}
              style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid rgba(184,80,96,0.3)', background: 'transparent', color: 'rgba(232,154,166,0.7)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Export */}
        {leaves.length > 0 && (
          <div style={{ padding: '16px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
              Export
            </p>
            <button
              onClick={exportJSON}
              style={{ width: '100%', padding: '11px', marginBottom: '8px', borderRadius: '8px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.12)', color: 'var(--gold-light)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {copied ? 'Copié !' : 'Copier le JSON'}
            </button>
            <button
              onClick={downloadJSON}
              style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Télécharger tree-leaves.json
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
