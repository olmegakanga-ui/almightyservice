'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Event {
  id: string
  groom_name: string
  bride_name: string
  event_date: string
  venue_name: string
  background_image_url: string
  status: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc']
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
      if (data) setEvents(data)
      setLoading(false)
    }
    load()
  }, [])

  const sections = ['guests', 'tables', 'drinks', 'guestbook', 'reactions']

  if (loading) {
    return (
      <div style={{ padding: '48px 40px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
          Chargement...
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{
          fontSize: '0.65rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '8px',
        }}>
          AlmightyService
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 300,
          color: 'white',
        }}>
          Mes Mariages
        </h1>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {events.map(event => (
          <div
            key={event.id}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,169,110,0.15)',
              borderRadius: '20px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = '1px solid rgba(201,169,110,0.4)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid rgba(201,169,110,0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Image */}
            <Link
              href={'/admin/events/' + event.id + '/guests'}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                height: '140px',
                backgroundImage: 'url(' + event.background_image_url + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,9,0.5)' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: '2rem',
                    color: 'white',
                  }}>
                    {event.groom_name} & {event.bride_name}
                  </p>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: event.status === 'active'
                    ? 'rgba(90,138,106,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  border: event.status === 'active'
                    ? '1px solid rgba(90,138,106,0.5)'
                    : '1px solid rgba(255,255,255,0.15)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: event.status === 'active' ? '#7EC89A' : 'rgba(255,255,255,0.5)',
                }}>
                  {event.status}
                </div>
              </div>

              {/* Infos */}
              <div style={{ padding: '20px 24px 16px' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  color: 'white',
                  marginBottom: '4px',
                }}>
                  {event.groom_name} & {event.bride_name}
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.82rem',
                }}>
                  {formatDate(event.event_date)} · {event.venue_name}
                </p>
              </div>
            </Link>

            {/* Liens rapides */}
            <div style={{
              padding: '0 24px 20px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {sections.map(section => (
                <Link
                  key={section}
                  href={'/admin/events/' + event.id + '/' + section}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'
                    e.currentTarget.style.color = 'var(--gold-light)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                  }}
                >
                  {section}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}