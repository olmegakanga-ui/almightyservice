'use client'

import { ChevronLeft, ChevronRight, LocateFixed, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getTableCategoryStyle, TABLE_CATEGORY_STYLES } from '@/lib/table-category-colors'

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
  const scrollRef = useRef<HTMLDivElement>(null)
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

  const centerHighlightedTable = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const viewport = scrollRef.current
    if (!viewport || !highlightedTableId) return

    const table = viewport.querySelector<HTMLElement>(`[data-table-id="${highlightedTableId}"]`)
    if (!table) return

    viewport.scrollTo({
      left: Math.max(0, table.offsetLeft - viewport.clientWidth / 2),
      top: Math.max(0, table.offsetTop - viewport.clientHeight / 2),
      behavior,
    })
  }, [highlightedTableId])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => centerHighlightedTable('smooth'))
    return () => window.cancelAnimationFrame(frame)
  }, [centerHighlightedTable, zoom])

  const movePlan = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: direction * Math.max(180, scrollRef.current.clientWidth * .72),
      behavior: 'smooth',
    })
  }

  const resetView = () => {
    setZoom(1)
    window.requestAnimationFrame(() => centerHighlightedTable('smooth'))
  }

  return (
    <div>
      <div className="room-map-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <p className="room-map-help" style={{ color: 'rgba(255,255,255,.45)', fontSize: '.75rem' }}>
          Faites glisser le plan horizontalement pour voir toutes les tables
        </p>
        <div className="room-map-controls" style={{ display: 'flex', gap: '6px' }}>
          <button aria-label="Déplacer le plan à gauche" onClick={() => movePlan(-1)} style={controlStyle}><ChevronLeft size={15} /></button>
          <button aria-label="Réduire" onClick={() => setZoom(z => Math.max(.7, z - .15))} style={controlStyle}><Minus size={15} /></button>
          <button aria-label="Centrer la table sélectionnée" onClick={resetView} style={controlStyle}><LocateFixed size={15} /></button>
          <button aria-label="Agrandir" onClick={() => setZoom(z => Math.min(2.2, z + .15))} style={controlStyle}><Plus size={15} /></button>
          <button aria-label="Déplacer le plan à droite" onClick={() => movePlan(1)} style={controlStyle}><ChevronRight size={15} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginBottom: 12 }}>
        {TABLE_CATEGORY_STYLES.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.58)', fontSize: '.68rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 0 2px ${item.color}33` }} />
            {item.label}
          </div>
        ))}
      </div>
      <div
        ref={scrollRef}
        className="room-map-scroll"
        style={{ overflowX: 'auto', overflowY: 'auto', width: '100%', maxWidth: '100%', touchAction: 'pan-x pan-y', overscrollBehaviorX: 'contain', borderRadius: '18px', border: '1px solid rgba(201,169,110,.2)', background: '#171411' }}
      >
        <div className="room-map-canvas" style={{
          position: 'relative', width: `${100 * zoom}%`, minWidth: 620, aspectRatio: '16/10',
          backgroundImage: backgroundUrl ? `linear-gradient(rgba(13,11,9,.18),rgba(13,11,9,.18)),url(${backgroundUrl})` : 'radial-gradient(circle at center, rgba(201,169,110,.08), transparent 65%)',
          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transition: 'width .2s ease',
        }}>
          {!backgroundUrl && <div style={{ position: 'absolute', inset: '6%', border: '1px dashed rgba(255,255,255,.12)', borderRadius: '28px' }} />}
          {positioned.map(table => {
            const active = table.id === highlightedTableId
            const categoryStyle = getTableCategoryStyle(table.category)
            return <div key={table.id} data-table-id={table.id} style={{
              position: 'absolute', left: `${table.x}%`, top: `${table.y}%`, transform: 'translate(-50%,-50%)',
              width: active ? 92 : 72, minHeight: active ? 92 : 72, borderRadius: '50%', padding: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              background: categoryStyle.color,
              color: categoryStyle.textColor, border: active ? '4px solid white' : '1px solid rgba(255,255,255,.35)',
              boxShadow: active ? `0 0 0 9px ${categoryStyle.color}55, 0 0 34px ${categoryStyle.color}` : '0 8px 18px rgba(0,0,0,.28)',
              zIndex: active ? 4 : 1, animation: active ? 'room-map-pulse 1.25s ease-in-out infinite' : undefined,
            }}>
              <strong style={{ fontSize: active ? '.88rem' : '.72rem', lineHeight: 1.1, overflowWrap: 'anywhere' }}>{table.name}</strong>
              <span style={{ fontSize: '.55rem', opacity: .72, marginTop: 3 }}>{table.side === 'HOMME' ? 'MARIÉ' : 'MARIÉE'}</span>
            </div>
          })}
          {highlightedTableId && <style>{`@keyframes room-map-pulse{50%{transform:translate(-50%,-50%) scale(1.08)}}`}</style>}
        </div>
      </div>
      <style>{`
        .room-map-scroll{-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(201,169,110,.55) rgba(255,255,255,.05)}
        .room-map-scroll::-webkit-scrollbar{height:8px}
        .room-map-scroll::-webkit-scrollbar-track{background:rgba(255,255,255,.05)}
        .room-map-scroll::-webkit-scrollbar-thumb{background:rgba(201,169,110,.55);border-radius:999px}
        .room-map-canvas{max-width:none!important}
        @media(max-width:600px){
          .room-map-toolbar{align-items:stretch!important;flex-direction:column!important}
          .room-map-help{line-height:1.45;margin:0}
          .room-map-controls{display:grid!important;grid-template-columns:repeat(5,34px);justify-content:space-between;width:100%}
          .room-map-canvas{min-width:760px!important}
          .room-map-scroll{cursor:grab;touch-action:pan-x pan-y!important}
        }
      `}</style>
    </div>
  )
}

const controlStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', cursor: 'pointer',
}
