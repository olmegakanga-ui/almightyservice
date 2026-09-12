'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clock3, MapPin, Navigation, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RoomMap, { RoomMapTable } from './RoomMap'

type OrientationStatus = 'new' | 'claimed' | 'seated'

interface Arrival {
  id: string
  performed_at: string
  orientation_status: OrientationStatus
  guests: {
    id: string
    full_name: string
    side: string
    is_couple: boolean
    guest_tables: RoomMapTable | null
  } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string; room_map_url: string | null }
  tables: RoomMapTable[]
  arrivals: Arrival[]
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function OrientationClient({ event, tables, arrivals: initialArrivals }: Props) {
  const [arrivals, setArrivals] = useState(initialArrivals)
  const [selectedId, setSelectedId] = useState(initialArrivals.find(a => a.orientation_status !== 'seated')?.id ?? null)
  const [saving, setSaving] = useState(false)
  const previousNewest = useRef(initialArrivals[0]?.id)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('checkin_logs')
      .select('id, performed_at, orientation_status, guests(id, full_name, side, is_couple, guest_tables(id, name, category, side, position_x, position_y))')
      .eq('event_id', event.id)
      .eq('action', 'checkin')
      .order('performed_at', { ascending: false })
      .limit(60)

    if (data) {
      const next = data as Arrival[]
      if (next[0]?.id && next[0].id !== previousNewest.current) {
        previousNewest.current = next[0].id
        setSelectedId(next[0].id)
        if ('vibrate' in navigator) navigator.vibrate([180, 80, 180])
      }
      setArrivals(next)
    }
  }, [event.id])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('orientation-' + event.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkin_logs', filter: 'event_id=eq.' + event.id }, refresh)
      .subscribe()
    const fallback = window.setInterval(refresh, 15000)
    return () => { window.clearInterval(fallback); supabase.removeChannel(channel) }
  }, [event.id, refresh])

  const activeArrivals = useMemo(() => arrivals.filter(a => a.orientation_status !== 'seated'), [arrivals])
  const selected = arrivals.find(a => a.id === selectedId) ?? activeArrivals[0] ?? null
  const table = selected?.guests?.guest_tables ?? null

  const updateStatus = async (status: OrientationStatus) => {
    if (!selected) return
    setSaving(true)
    const res = await fetch('/api/orientation/status', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId: selected.id, eventId: event.id, status }),
    })
    if (res.ok) {
      setArrivals(current => current.map(a => a.id === selected.id ? { ...a, orientation_status: status } : a))
      if (status === 'seated') setSelectedId(activeArrivals.find(a => a.id !== selected.id)?.id ?? null)
    }
    setSaving(false)
  }

  return (
    <div className="orientation-page">
      <style>{`
        .orientation-page{padding:40px;max-width:1500px;margin:0 auto;box-sizing:border-box}
        .orientation-layout{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:18px}
        @media(max-width:900px){.orientation-page{padding:68px 14px 30px}.orientation-layout{grid-template-columns:1fr}.orientation-map{order:-1}}
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '.65rem', letterSpacing: '.3em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>{event.groom_name} &amp; {event.bride_name}</p>
        <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300 }}>Poste d’orientation</h1>
        <p style={{ color: '#7EC89A', fontSize: '.75rem', marginTop: 5 }}>● Synchronisation en temps réel · {activeArrivals.length} invité{activeArrivals.length > 1 ? 's' : ''} à orienter</p>
      </div>

      <div className="orientation-layout">
        <aside style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: 14, maxHeight: '72vh', overflowY: 'auto' }}>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', margin: '4px 4px 12px' }}>File d’arrivée</p>
          {activeArrivals.map(arrival => {
            const active = arrival.id === selected?.id
            return <button key={arrival.id} onClick={() => setSelectedId(arrival.id)} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 8, borderRadius: 13, border: active ? '1px solid rgba(201,169,110,.55)' : '1px solid rgba(255,255,255,.06)', background: active ? 'rgba(201,169,110,.11)' : 'rgba(255,255,255,.025)', color: 'white', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: '.88rem' }}>{arrival.guests?.full_name ?? 'Invité'}</strong>
                <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '.7rem' }}>{timeLabel(arrival.performed_at)}</span>
              </div>
              <p style={{ color: 'var(--gold-light)', fontSize: '.76rem', marginTop: 5 }}>{arrival.guests?.guest_tables?.name ?? 'Table non attribuée'}</p>
              <span style={{ display: 'inline-block', marginTop: 7, color: arrival.orientation_status === 'claimed' ? '#9DB4F5' : '#7EC89A', fontSize: '.65rem' }}>{arrival.orientation_status === 'claimed' ? '● Pris en charge' : '● Nouveau'}</span>
            </button>
          })}
          {activeArrivals.length === 0 && <div style={{ textAlign: 'center', padding: '42px 15px', color: 'rgba(255,255,255,.28)' }}><Check size={32} style={{ margin: '0 auto 10px' }} /><p>Aucun invité en attente</p></div>}
        </aside>

        <section className="orientation-map" style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: 16 }}>
          {selected?.guests ? <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-script)', color: 'white', fontSize: '1.8rem' }}>{selected.guests.full_name}</p>
                <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', color: 'rgba(255,255,255,.5)', fontSize: '.76rem', marginTop: 5 }}>
                  <span><Users size={12} style={{ verticalAlign: -2 }} /> {selected.guests.is_couple ? '2 personnes' : '1 personne'}</span>
                  <span><Clock3 size={12} style={{ verticalAlign: -2 }} /> {timeLabel(selected.performed_at)}</span>
                  <span><MapPin size={12} style={{ verticalAlign: -2 }} /> {table?.name ?? 'Non attribuée'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.orientation_status === 'new' && <button disabled={saving} onClick={() => updateStatus('claimed')} style={actionStyle('#9DB4F5')}>Prendre en charge</button>}
                <button disabled={saving} onClick={() => updateStatus('seated')} style={actionStyle('#7EC89A')}><Check size={15} /> Invité installé</button>
              </div>
            </div>
            {table ? <RoomMap tables={tables} highlightedTableId={table.id} backgroundUrl={event.room_map_url} /> : <div style={{ minHeight: 330, display: 'grid', placeItems: 'center', border: '1px dashed rgba(232,154,166,.35)', borderRadius: 16, color: '#E89AA6', textAlign: 'center', padding: 30 }}><div><Navigation size={38} style={{ margin: '0 auto 12px' }} /><p>Aucune table attribuée à cet invité</p></div></div>}
          </> : <div style={{ minHeight: 430, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.25)', textAlign: 'center' }}><div><Navigation size={42} style={{ margin: '0 auto 12px' }} /><p>Le prochain invité apparaîtra automatiquement ici.</p></div></div>}
        </section>
      </div>
    </div>
  )
}

const actionStyle = (color: string): React.CSSProperties => ({
  padding: '11px 15px', borderRadius: 10, border: `1px solid ${color}66`, background: `${color}18`, color, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.76rem', fontWeight: 600,
})
