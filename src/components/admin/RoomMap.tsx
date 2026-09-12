'use client'

import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export interface RoomMapTable {
  id: string
  name: string
  category: string
  side: string
  position_x: number | null
  position_y: number | null
}

interface Props {
  tables: RoomMapTable[]
  highlightedTableId?: string | null
  backgroundUrl?: string | null
}

export default function RoomMap({ tables, highlightedTableId, backgroundUrl }: Props) {
  const [zoom, setZoom] = useState(1)
  const positioned = useMemo(() => tables.map((table, index) => {
    const fallbackCols = Math.max(1, Math.ceil(Math.sqrt(tables.length)))
    const fallbackX = 12 + (index % fallbackCols) * (76 / Math.max(1, fallbackCols - 1))
    const fallbackY = 16 + Math.floor(index / fallbackCols) * 22
    return {
      ...table,
      x: table.position_x != null && table.position_x > 0 ? table.position_x : fallbackX,
      y: table.position_y != null && table.position_y > 0 ? table.position_y : Math.min(84, fallbackY),
    }
  }), [tables])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.75rem' }}>
          Pincez ou utilisez les boutons pour agrandir le plan
        </p>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button aria-label="Réduire" onClick={() => setZoom(z => Math.max(.7, z - .15))} style={controlStyle}><Minus size={15} /></button>
          <button aria-label="Centrer" onClick={() => setZoom(1)} style={controlStyle}><LocateFixed size={15} /></button>
          <button aria-label="Agrandir" onClick={() => setZoom(z => Math.min(2.2, z + .15))} style={controlStyle}><Plus size={15} /></button>
        </div>
      </div>
      <div style={{ overflow: 'auto', borderRadius: '18px', border: '1px solid rgba(201,169,110,.2)', background: '#171411' }}>
        <div style={{
          position: 'relative', width: `${100 * zoom}%`, minWidth: 620, aspectRatio: '16/10',
          backgroundImage: backgroundUrl ? `linear-gradient(rgba(13,11,9,.18),rgba(13,11,9,.18)),url(${backgroundUrl})` : 'radial-gradient(circle at center, rgba(201,169,110,.08), transparent 65%)',
          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transition: 'width .2s ease',
        }}>
          {!backgroundUrl && <div style={{ position: 'absolute', inset: '6%', border: '1px dashed rgba(255,255,255,.12)', borderRadius: '28px' }} />}
          {positioned.map(table => {
            const active = table.id === highlightedTableId
            return <div key={table.id} style={{
              position: 'absolute', left: `${table.x}%`, top: `${table.y}%`, transform: 'translate(-50%,-50%)',
              width: active ? 92 : 72, minHeight: active ? 92 : 72, borderRadius: '50%', padding: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              background: active ? '#7EC89A' : table.category === 'VIP' ? '#C9A96E' : '#2A2621',
              color: active ? '#07120B' : 'white', border: active ? '4px solid white' : '1px solid rgba(255,255,255,.22)',
              boxShadow: active ? '0 0 0 9px rgba(126,200,154,.22), 0 0 34px rgba(126,200,154,.8)' : '0 8px 18px rgba(0,0,0,.28)',
              zIndex: active ? 4 : 1, animation: active ? 'room-map-pulse 1.25s ease-in-out infinite' : undefined,
            }}>
              <strong style={{ fontSize: active ? '.88rem' : '.72rem', lineHeight: 1.1, overflowWrap: 'anywhere' }}>{table.name}</strong>
              <span style={{ fontSize: '.55rem', opacity: .72, marginTop: 3 }}>{table.side === 'HOMME' ? 'MARIÉ' : 'MARIÉE'}</span>
            </div>
          })}
          {highlightedTableId && <style>{`@keyframes room-map-pulse{50%{transform:translate(-50%,-50%) scale(1.08)}}`}</style>}
        </div>
      </div>
    </div>
  )
}

const controlStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', cursor: 'pointer',
}
