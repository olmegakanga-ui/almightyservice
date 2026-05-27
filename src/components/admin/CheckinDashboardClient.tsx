'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, UserCheck, Clock, QrCode, Search } from 'lucide-react'

interface Guest {
  id: string
  full_name: string
  side: string
  checked_in: boolean
  checked_in_at: string | null
  guest_tables: { name: string } | null
  rsvp_responses: { status: string } | null
}

interface Log {
  performed_at: string
  guests: { full_name: string } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  guests: Guest[]
  recentLogs: Log[]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

export default function CheckinDashboardClient({
  event,
  guests: initialGuests,
  recentLogs: initialLogs,
}: Props) {
  const router = useRouter()
  const [search, setSearch]         = useState('')
  const [guests, setGuests]         = useState<Guest[]>(initialGuests)
  const [recentLogs, setRecentLogs] = useState<Log[]>(initialLogs)

  const refresh = useCallback(async () => {
    const supabase = createClient()

    const { data: updatedGuests } = await supabase
      .from('guests')
      .select('id, full_name, side, checked_in, checked_in_at, guest_tables(name), rsvp_responses(status)')
      .eq('event_id', event.id)
      .order('checked_in_at', { ascending: false, nullsFirst: false })

    if (updatedGuests) setGuests(updatedGuests as unknown as Guest[])

    const { data: updatedLogs } = await supabase
      .from('checkin_logs')
      .select('performed_at, guests(full_name)')
      .eq('event_id', event.id)
      .eq('action', 'checkin')
      .order('performed_at', { ascending: false })
      .limit(10)

    if (updatedLogs) setRecentLogs(updatedLogs as unknown as Log[])
  }, [event.id])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('checkin-realtime-' + event.id)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'guests',
          filter: 'event_id=eq.' + event.id,
        },
        () => { refresh() }
      )
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'checkin_logs',
          filter: 'event_id=eq.' + event.id,
        },
        () => { refresh() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event.id, refresh])

  const total     = guests.length
  const confirmed = guests.filter(g => g.rsvp_responses?.status === 'confirmed').length
  const arrived   = guests.filter(g => g.checked_in).length
  const remaining = Math.max(0, confirmed - arrived)
  const rate      = confirmed > 0 ? Math.round((arrived / confirmed) * 100) : 0

  const filtered = useMemo(() => {
    if (!search) return guests
    const q = search.toLowerCase()
    return guests.filter(g =>
      g.full_name.toLowerCase().includes(q) ||
      (g.guest_tables?.name ?? '').toLowerCase().includes(q)
    )
  }, [guests, search])

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
            {event.groom_name} & {event.bride_name}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
            Dashboard Check-in
          </h1>
          <p style={{ color: 'rgba(90,138,106,0.7)', fontSize: '0.72rem', marginTop: '4px' }}>
            ● Temps réel activé
          </p>
        </div>

        <Link
          href={'/admin/events/' + event.id + '/scan'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '100px',
            border: '1px solid rgba(201,169,110,0.5)',
            background: 'rgba(201,169,110,0.1)',
            color: 'var(--gold-light)',
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
          }}
        >
          <QrCode size={16} /> Scanner un invité
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {[
          { icon: Users,     label: 'Total invités', value: total,     color: 'rgba(255,255,255,0.7)' },
          { icon: UserCheck, label: 'Confirmés',      value: confirmed, color: '#9DB4F5' },
          { icon: UserCheck, label: 'Arrivés',        value: arrived,   color: '#7EC89A' },
          { icon: Clock,     label: 'Restants',       value: remaining, color: 'rgba(201,169,110,0.8)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <s.icon size={18} color={s.color} style={{ marginBottom: '10px' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.1em' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Taux de présence */}
      <div style={{ marginBottom: '32px', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Taux de présence</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: rate >= 80 ? '#7EC89A' : rate >= 50 ? 'var(--gold)' : '#E89AA6' }}>
            {rate}%
          </p>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: rate + '%',
            background: rate >= 80 ? '#7EC89A' : rate >= 50 ? 'var(--gold)' : '#E89AA6',
            borderRadius: '4px',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '8px' }}>
          {arrived} arrivés sur {confirmed} confirmés
        </p>
      </div>

      {/* Derniers arrivés */}
      {recentLogs.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>
            Derniers arrivés
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentLogs.slice(0, 5).map((log, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(90,138,106,0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(90,138,106,0.15)',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
                  {log.guests?.full_name ?? 'Invité'}
                </p>
                <p style={{ color: '#7EC89A', fontSize: '0.78rem' }}>
                  {formatTime(log.performed_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste complète */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Tous les invités
          </p>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ padding: '8px 10px 8px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', width: '200px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(g => (
            <div key={g.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: g.checked_in ? 'rgba(90,138,106,0.06)' : 'rgba(255,255,255,0.02)',
              border: g.checked_in ? '1px solid rgba(90,138,106,0.2)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: g.checked_in ? '#7EC89A' : 'rgba(255,255,255,0.15)',
                  flexShrink: 0,
                  transition: 'background 0.3s ease',
                }} />
                <div>
                  <p style={{ color: g.checked_in ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>
                    {g.full_name}
                  </p>
                  {g.guest_tables?.name && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                      {g.guest_tables.name}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {g.checked_in && g.checked_in_at ? (
                  <p style={{ color: '#7EC89A', fontSize: '0.78rem' }}>
                    ✓ {formatTime(g.checked_in_at)}
                  </p>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' }}>
                    Pas encore arrivé
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}