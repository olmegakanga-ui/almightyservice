'use client'

import { useState, useCallback } from 'react'
import { Search, CheckCircle, Clock } from 'lucide-react'

interface GuestResult {
  id: string
  fullName: string
  phone: string
  side: 'HOMME' | 'FEMME'
  isCouple: boolean
  label: string
  checkedIn: boolean
  checkedInAt: string | null
  checkedInBy: string | null
  table: { name: string; category: string; capacity: number } | null
  rsvpStatus: string
  drinks: string[]
}

interface Props {
  eventId: string
  onSelectGuest: (guest: GuestResult) => void
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

export default function ManualGuestSearch({ eventId, onSelectGuest }: Props) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<GuestResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }

    setLoading(true)
    try {
      const ts = Date.now()
      const res = await fetch(
        '/api/checkin/search?q=' + encodeURIComponent(q) +
        '&eventId=' + eventId +
        '&_t=' + ts,
        { cache: 'no-store' }
      )
      const data = await res.json()

      const guests: GuestResult[] = (data.guests ?? []).map((g: {
        id: string
        fullName: string
        phone: string
        side: 'HOMME' | 'FEMME'
        isCouple: boolean
        checkedIn: boolean
        checkedInAt: string | null
        table: { name: string; category: string } | null
        rsvpStatus: string
        drinks: string[]
      }) => ({
        id:          g.id,
        fullName:    g.fullName,
        phone:       g.phone,
        side:        g.side,
        isCouple:    g.isCouple,
        label:       '',
        checkedIn:   g.checkedIn,
        checkedInAt: g.checkedInAt,
        checkedInBy: null,
        table:       g.table
          ? { name: g.table.name, category: g.table.category, capacity: 0 }
          : null,
        rsvpStatus: g.rsvpStatus,
        drinks:     g.drinks,
      }))

      setResults(guests)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  return (
    <div>
      <p style={{
        fontSize: '0.65rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '12px',
      }}>
        Recherche manuelle
      </p>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={15} style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.3)',
        }} />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Nom, téléphone..."
          style={{
            width: '100%',
            padding: '14px 14px 14px 42px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            color: 'white',
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
      </div>

      {loading && (
        <p style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: '16px',
        }}>
          Recherche...
        </p>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <p style={{
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: '16px',
        }}>
          Aucun invité trouvé pour &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {results.map(guest => (
            <div
              key={guest.id}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: guest.checkedIn
                  ? '1px solid rgba(90,138,106,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <p style={{
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {guest.fullName}
                  </p>
                  {guest.checkedIn && (
                    <CheckCircle size={14} color="#7EC89A" style={{ flexShrink: 0 }} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {guest.table && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--gold-light)',
                      background: 'rgba(201,169,110,0.08)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}>
                      {guest.table.name}
                    </span>
                  )}
                  {guest.checkedIn && guest.checkedInAt && (
                    <span style={{
                      fontSize: '0.72rem',
                      color: '#7EC89A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <Clock size={10} />
                      {formatTime(guest.checkedInAt)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
                    {guest.phone}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectGuest(guest)}
                style={{
                  flexShrink: 0,
                  padding: '10px 18px',
                  borderRadius: '100px',
                  border: guest.checkedIn
                    ? '1px solid rgba(90,138,106,0.4)'
                    : '1px solid rgba(201,169,110,0.4)',
                  background: guest.checkedIn
                    ? 'rgba(90,138,106,0.1)'
                    : 'rgba(201,169,110,0.1)',
                  color: guest.checkedIn ? '#7EC89A' : 'var(--gold-light)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                Voir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}