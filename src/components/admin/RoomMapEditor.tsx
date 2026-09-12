'use client'

import { useMemo, useRef, useState } from 'react'
import { Loader, Save } from 'lucide-react'
import ImageUpload from './ImageUpload'
import type { RoomMapTable } from './RoomMap'
import { getTableCategoryStyle, TABLE_CATEGORY_STYLES } from '@/lib/table-category-colors'

interface Props {
  eventId: string
  initialBackgroundUrl: string | null
  tables: RoomMapTable[]
  onSaved: () => void
}

function initialPositions(tables: RoomMapTable[]) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(tables.length)))
  return Object.fromEntries(tables.map((table, index) => [table.id, {
    x: table.position_x != null && table.position_x > 0 ? table.position_x : 12 + (index % cols) * (76 / Math.max(1, cols - 1)),
    y: table.position_y != null && table.position_y > 0 ? table.position_y : Math.min(84, 16 + Math.floor(index / cols) * 22),
  }]))
}

export default function RoomMapEditor({ eventId, initialBackgroundUrl, tables, onSaved }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [backgroundUrl, setBackgroundUrl] = useState(initialBackgroundUrl ?? '')
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => initialPositions(tables))
  const [dragging, setDragging] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const orderedTables = useMemo(() => [...tables].sort((a, b) => a.name.localeCompare(b.name)), [tables])

  const move = (clientX: number, clientY: number) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(6, Math.min(94, ((clientY - rect.top) / rect.height) * 100))
    setPositions(current => ({ ...current, [dragging]: { x, y } }))
  }

  const save = async () => {
    setSaving(true); setError(null)
    const res = await fetch('/api/seating/layout', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, backgroundUrl, positions }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Impossible de sauvegarder le plan'); return }
    onSaved()
  }

  return (
    <div style={{ marginBottom: 30, padding: 18, background: 'rgba(201,169,110,.04)', border: '1px solid rgba(201,169,110,.2)', borderRadius: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,320px) minmax(0,1fr)', gap: 18 }} className="map-editor-grid">
        <div>
          <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: 6 }}>Configuration du plan</h2>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.78rem', lineHeight: 1.5, marginBottom: 18 }}>Importez le plan de la salle, puis déplacez chaque table jusqu’à son emplacement réel.</p>
          <ImageUpload label="Image du plan de salle" currentUrl={backgroundUrl} onUpload={setBackgroundUrl} aspectRatio="16/10" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginTop: 14 }}>
            {TABLE_CATEGORY_STYLES.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.58)', fontSize: '.68rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving} style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 100, border: 0, background: '#7A6645', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />} {saving ? 'Sauvegarde…' : 'Enregistrer la cartographie'}
          </button>
          {error && <p style={{ color: '#E89AA6', fontSize: '.78rem', marginTop: 10 }}>{error}</p>}
        </div>

        <div ref={canvasRef} onPointerMove={e => move(e.clientX, e.clientY)} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)} style={{ position: 'relative', minWidth: 0, aspectRatio: '16/10', borderRadius: 16, overflow: 'hidden', touchAction: 'none', background: '#171411', backgroundImage: backgroundUrl ? `linear-gradient(rgba(13,11,9,.08),rgba(13,11,9,.08)),url(${backgroundUrl})` : 'radial-gradient(circle at center,rgba(201,169,110,.09),transparent 65%)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: '1px dashed rgba(255,255,255,.18)' }}>
          {orderedTables.map(table => {
            const point = positions[table.id]
            const categoryStyle = getTableCategoryStyle(table.category)
            return <button key={table.id} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(table.id) }} style={{ position: 'absolute', left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%,-50%)', width: 72, height: 72, borderRadius: '50%', border: dragging === table.id ? '3px solid white' : '1px solid rgba(255,255,255,.4)', background: categoryStyle.color, color: categoryStyle.textColor, padding: 6, cursor: 'grab', touchAction: 'none', boxShadow: dragging === table.id ? `0 0 0 7px ${categoryStyle.color}55, 0 8px 22px rgba(0,0,0,.45)` : '0 8px 18px rgba(0,0,0,.35)', fontSize: '.68rem', fontWeight: 600, overflowWrap: 'anywhere' }}>{table.name}</button>
          })}
          {!backgroundUrl && <p style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', color: 'rgba(255,255,255,.25)', fontSize: '.7rem', whiteSpace: 'nowrap' }}>Vous pouvez aussi positionner les tables sans image</p>}
        </div>
      </div>
      <style>{`@media(max-width:850px){.map-editor-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
