'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Heart, CheckCircle, MessageCircle,
  TrendingUp, Calendar, Award,
} from 'lucide-react'

interface Event {
  id:         string
  groom_name: string
  bride_name: string
  event_date: string
  status:     string
}

interface Guest {
  id:             string
  event_id:       string
  checked_in:     boolean
  rsvp_responses: { status: string } | null
}

interface Message {
  id:       string
  event_id: string
  status:   string
  type:     string
  sent_at:  string
}

interface Drink {
  drink_name: string
  event_id:   string
}

interface Props {
  events:   Event[]
  guests:   Guest[]
  messages: Message[]
  drinks:   Drink[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export default function StatsClient({ events, guests, messages, drinks }: Props) {

  // Stats globales
  const globalStats = useMemo(() => {
    const total      = guests.length
    const confirmed  = guests.filter(g => g.rsvp_responses?.status === 'confirmed').length
    const declined   = guests.filter(g => g.rsvp_responses?.status === 'declined').length
    const arrived    = guests.filter(g => g.checked_in).length
    const waSent     = messages.filter(m => m.status === 'sent' || m.status === 'delivered' || m.status === 'read').length
    const activeEvents = events.filter(e => e.status === 'active').length

    return { total, confirmed, declined, arrived, waSent, activeEvents }
  }, [guests, messages, events])

  // Stats par mariage
  const eventStats = useMemo(() => {
    return events.map(event => {
      const eventGuests    = guests.filter(g => g.event_id === event.id)
      const confirmed      = eventGuests.filter(g => g.rsvp_responses?.status === 'confirmed').length
      const arrived        = eventGuests.filter(g => g.checked_in).length
      const waSent         = messages.filter(m => m.event_id === event.id && (m.status === 'sent' || m.status === 'delivered')).length
      const confirmRate    = eventGuests.length > 0 ? Math.round((confirmed / eventGuests.length) * 100) : 0
      const presenceRate   = confirmed > 0 ? Math.round((arrived / confirmed) * 100) : 0
      const days           = daysUntil(event.event_date)

      return {
        ...event,
        total:        eventGuests.length,
        confirmed,
        arrived,
        waSent,
        confirmRate,
        presenceRate,
        days,
      }
    })
  }, [events, guests, messages])

  // Top boissons
  const topDrinks = useMemo(() => {
    const counts: Record<string, number> = {}
    drinks.forEach(d => {
      counts[d.drink_name] = (counts[d.drink_name] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [drinks])

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          AlmightyService
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'white' }}>
          Statistiques globales
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          Vue d&apos;ensemble de tous les mariages
        </p>
      </div>

      {/* KPIs globaux */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap:                 '12px',
        marginBottom:        '40px',
      }}>
        {[
          { icon: Calendar,    label: 'Mariages actifs',   value: globalStats.activeEvents, color: '#F5A623',              suffix: '' },
          { icon: Users,       label: 'Total invités',     value: globalStats.total,        color: 'rgba(255,255,255,0.7)', suffix: '' },
          { icon: Heart,       label: 'Confirmés',         value: globalStats.confirmed,    color: '#9DB4F5',              suffix: '' },
          { icon: CheckCircle, label: 'Arrivés',           value: globalStats.arrived,      color: '#7EC89A',              suffix: '' },
          { icon: MessageCircle, label: 'Messages WA',    value: globalStats.waSent,        color: 'rgba(201,169,110,0.8)', suffix: '' },
          { icon: TrendingUp,  label: 'Taux confirmation', value: globalStats.total > 0 ? Math.round((globalStats.confirmed / globalStats.total) * 100) : 0, color: '#7EC89A', suffix: '%' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding:      '20px',
              background:   'rgba(255,255,255,0.02)',
              border:       '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
            }}
          >
            <stat.icon size={18} color={stat.color} style={{ marginBottom: '10px' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: stat.color, lineHeight: 1 }}>
              {stat.value}{stat.suffix}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.1em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap:                 '24px',
        marginBottom:        '40px',
      }}>

        {/* Stats par mariage */}
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            Par mariage
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {eventStats.map(event => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/guests`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding:      '20px',
                    background:   'rgba(255,255,255,0.02)',
                    border:       '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    transition:   'all 0.2s ease',
                    cursor:       'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.02)'
                  }}
                >
                  {/* En-tête mariage */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.2rem', color: 'white' }}>
                        {event.groom_name} & {event.bride_name}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '2px' }}>
                        {formatDate(event.event_date)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {event.days > 0 ? (
                        <span style={{
                          padding:      '4px 10px',
                          borderRadius: '100px',
                          background:   event.days <= 30 ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)',
                          color:        event.days <= 30 ? '#F5A623' : 'rgba(255,255,255,0.4)',
                          fontSize:     '0.72rem',
                          border:       '1px solid ' + (event.days <= 30 ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'),
                        }}>
                          J-{event.days}
                        </span>
                      ) : (
                        <span style={{
                          padding:      '4px 10px',
                          borderRadius: '100px',
                          background:   'rgba(90,138,106,0.1)',
                          color:        '#7EC89A',
                          fontSize:     '0.72rem',
                          border:       '1px solid rgba(90,138,106,0.2)',
                        }}>
                          Terminé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats ligne */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Invités',   value: event.total,     color: 'rgba(255,255,255,0.7)' },
                      { label: 'Confirmés', value: event.confirmed, color: '#9DB4F5' },
                      { label: 'Arrivés',   value: event.arrived,   color: '#7EC89A' },
                      { label: 'WA envoyés', value: event.waSent,   color: 'rgba(201,169,110,0.8)' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: s.color, lineHeight: 1 }}>
                          {s.value}
                        </p>
                        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Barres de progression */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>Confirmations</p>
                        <p style={{ fontSize: '0.65rem', color: '#9DB4F5' }}>{event.confirmRate}%</p>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: event.confirmRate + '%', background: '#9DB4F5', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>Présence</p>
                        <p style={{ fontSize: '0.65rem', color: '#7EC89A' }}>{event.presenceRate}%</p>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: event.presenceRate + '%', background: '#7EC89A', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {events.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
                Aucun mariage créé
              </p>
            )}
          </div>
        </div>

        {/* Top boissons + Activité récente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Top boissons */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={12} /> Top boissons
            </p>

            {topDrinks.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Aucune sélection</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topDrinks.map(([name, count], i) => {
                  const max = topDrinks[0][1]
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                          {i === 0 && '🥇 '}{i === 1 && '🥈 '}{i === 2 && '🥉 '}
                          {name}
                        </p>
                        <p style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>{count}</p>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height:     '100%',
                          width:      pct + '%',
                          background: i === 0 ? 'var(--gold)' : i === 1 ? 'rgba(201,169,110,0.6)' : 'rgba(201,169,110,0.3)',
                          borderRadius:'2px',
                          transition: 'width 0.8s ease ' + (i * 0.1) + 's',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Activité récente WhatsApp */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={12} /> Activité WhatsApp récente
            </p>

            {messages.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Aucun message envoyé</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {messages.slice(0, 8).map(msg => {
                  const event = events.find(e => e.id === msg.event_id)
                  const statusColor = msg.status === 'sent' || msg.status === 'delivered' || msg.status === 'read'
                    ? '#7EC89A'
                    : msg.status === 'failed'
                    ? '#E89AA6'
                    : 'rgba(255,255,255,0.3)'

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          '10px',
                        padding:      '10px 12px',
                        background:   'rgba(255,255,255,0.02)',
                        border:       '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event ? event.groom_name + ' & ' + event.bride_name : '—'}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem' }}>
                          {msg.type}
                        </p>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', flexShrink: 0 }}>
                        {new Date(msg.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}