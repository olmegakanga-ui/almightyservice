'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface Table {
  id: string
  name: string
  capacity: number
  category: string
  side: 'HOMME' | 'FEMME'
}

interface Guest {
  id: string
  full_name: string
  table_id: string | null
  side: string
  checked_in: boolean
  checked_in_at: string | null
  rsvp_responses: { status: string } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  tables: Table[]
  guests: Guest[]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

const CATEGORY_COLORS: Record<string, string> = {
  VIP:     'rgba(201,169,110,0.15)',
  FAMILLE: 'rgba(100,149,237,0.1)',
  AMIS:    'rgba(90,138,106,0.1)',
  AUTRES:  'rgba(255,255,255,0.04)',
}

function SeatingTableCard({
  table,
  guests,
  onClick,
}: {
  table: Table
  guests: Guest[]
  onClick: () => void
}) {
  const tableGuests = guests.filter(g => g.table_id === table.id)
  const arrived     = tableGuests.filter(g => g.checked_in).length
  const declined    = tableGuests.filter(g => g.rsvp_responses?.status === 'declined').length
  const pct         = Math.round((arrived / table.capacity) * 100)
  const isFull      = arrived >= table.capacity

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px',
        background: isFull ? 'rgba(90,138,106,0.08)' : CATEGORY_COLORS[table.category] ?? 'rgba(255,255,255,0.03)',
        border: isFull ? '1px solid rgba(90,138,106,0.3)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = isFull ? 'rgba(90,138,106,0.3)' : 'rgba(255,255,255,0.07)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <p style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem' }}>{table.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{table.category}</p>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', color: isFull ? '#7EC89A' : 'var(--gold)', fontSize: '1.1rem' }}>
          {arrived}/{table.capacity}
        </p>
      </div>

      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{
          height: '100%',
          width: pct + '%',
          background: isFull ? '#7EC89A' : 'var(--gold)',
          borderRadius: '2px',
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {Array.from({ length: table.capacity }).map((_, i) => {
          const g = tableGuests[i]
          let color = 'rgba(255,255,255,0.1)'
          if (g) {
            if (g.checked_in) color = '#7EC89A'
            else if (g.rsvp_responses?.status === 'declined') color = '#E89AA6'
            else if (g.rsvp_responses?.status === 'confirmed') color = 'rgba(201,169,110,0.6)'
            else color = 'rgba(255,255,255,0.25)'
          }
          return (
            <div
              key={i}
              title={g?.full_name ?? 'Siège libre'}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: color,
                transition: 'background 0.4s ease',
                border: g?.checked_in ? '1px solid rgba(126,200,154,0.5)' : 'none',
              }}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', color: '#7EC89A' }}>✓ {arrived} arrivés</span>
        {declined > 0 && <span style={{ fontSize: '0.68rem', color: '#E89AA6' }}>✗ {declined} déclinés</span>}
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>
          {table.capacity - tableGuests.length} siège{table.capacity - tableGuests.length > 1 ? 's' : ''} libre{table.capacity - tableGuests.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default function SeatingClient({ event, tables, guests: initialGuests }: Props) {
  const [guests, setGuests]               = useState<Guest[]>(initialGuests)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [sideFilter, setSideFilter]       = useState<'ALL' | 'HOMME' | 'FEMME'>('ALL')

  const refreshGuests = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .select('id, full_name, table_id, side, checked_in, checked_in_at, rsvp_responses(status)')
      .eq('event_id', event.id)
    if (data) setGuests(data as unknown as Guest[])
  }, [event.id])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('seating-realtime-' + event.id)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'guests',
          filter: 'event_id=eq.' + event.id,
        },
        () => { refreshGuests() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event.id, refreshGuests])

  const filtered     = tables.filter(t => sideFilter === 'ALL' || t.side === sideFilter)
  const totalArrived = guests.filter(g => g.checked_in).length
  const totalSeats   = tables.reduce((acc, t) => acc + t.capacity, 0)

  return (
    <div style={{ padding: '40px' }}>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '4px' }}>
          Plan de la salle
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
          {totalArrived} arrivés sur {totalSeats} places — {tables.length} tables
        </p>
        <p style={{ color: 'rgba(90,138,106,0.7)', fontSize: '0.72rem', marginTop: '2px' }}>
          ● Temps réel activé
        </p>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { color: '#7EC89A',               label: 'Arrivé' },
          { color: 'rgba(201,169,110,0.6)', label: 'Confirmé' },
          { color: 'rgba(255,255,255,0.25)', label: 'En attente' },
          { color: '#E89AA6',               label: 'Décliné' },
          { color: 'rgba(255,255,255,0.1)', label: 'Siège libre' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {(['ALL', 'HOMME', 'FEMME'] as const).map(f => (
          <button key={f} onClick={() => setSideFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: sideFilter === f ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
              background: sideFilter === f ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: sideFilter === f ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {f === 'ALL' ? 'Toutes' : f === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
          </button>
        ))}
      </div>

      {/* Grille tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {filtered.map(table => (
          <SeatingTableCard
            key={table.id}
            table={table}
            guests={guests}
            onClick={() => setSelectedTable(table)}
          />
        ))}
      </div>

      {/* Drawer */}
      {selectedTable && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedTable(null) }}
        >
          <div style={{ width: '360px', height: '100vh', background: '#141210', borderLeft: '1px solid rgba(201,169,110,0.15)', padding: '28px', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'white' }}>
                  {selectedTable.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                  {selectedTable.category} · {selectedTable.side === 'HOMME' ? 'Côté Marié' : 'Côté Mariée'}
                </p>
              </div>
              <button onClick={() => setSelectedTable(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: Math.min(100, (guests.filter(g => g.table_id === selectedTable.id && g.checked_in).length / selectedTable.capacity) * 100) + '%',
                background: 'var(--gold)',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {guests.filter(g => g.table_id === selectedTable.id).map(g => {
                const status = g.rsvp_responses?.status ?? 'pending'
                const color = g.checked_in ? '#7EC89A' : status === 'declined' ? '#E89AA6' : status === 'confirmed' ? 'rgba(201,169,110,0.8)' : 'rgba(255,255,255,0.5)'
                return (
                  <div key={g.id} style={{
                    padding: '12px 14px',
                    background: g.checked_in ? 'rgba(90,138,106,0.08)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (g.checked_in ? 'rgba(90,138,106,0.2)' : 'rgba(255,255,255,0.05)'),
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                    <p style={{ color, fontSize: '0.88rem' }}>{g.full_name}</p>
                    <p style={{ color, fontSize: '0.72rem' }}>
                      {g.checked_in && g.checked_in_at
                        ? '✓ ' + formatTime(g.checked_in_at)
                        : status === 'declined' ? '✗' : '—'}
                    </p>
                  </div>
                )
              })}

              {guests.filter(g => g.table_id === selectedTable.id).length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                  Aucun invité assigné
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}