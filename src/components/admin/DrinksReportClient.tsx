'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Selection {
  drink_name: string
  drink_category: string
  guests: { full_name: string; side: string } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  selections: Selection[]
}

export default function DrinksReportClient({ event, selections }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const drinkStats = useMemo(() => {
    const map = new Map<string, { category: string; guests: string[] }>()
    selections.forEach(s => {
      if (!s.guests) return
      if (!map.has(s.drink_name)) {
        map.set(s.drink_name, { category: s.drink_category, guests: [] })
      }
      map.get(s.drink_name)!.guests.push(s.guests.full_name)
    })
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.guests.length - a.guests.length)
  }, [selections])

  const maxCount = drinkStats[0]?.guests.length ?? 1

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Rapport des boissons
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          {selections.length} sélection{selections.length > 1 ? 's' : ''} au total
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {drinkStats.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '48px' }}>
            Aucune boisson sélectionnée pour l&apos;instant
          </p>
        ) : (
          drinkStats.map(drink => (
            <div
              key={drink.name}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}
            >
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === drink.name ? null : drink.name)}
              >
                {/* Barre */}
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: (drink.guests.length / maxCount * 100) + '%', background: 'var(--gold)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>

                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'white', minWidth: '180px' }}>
                  {drink.name}
                </span>

                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', minWidth: '80px' }}>
                  {drink.category}
                </span>

                <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', minWidth: '40px', textAlign: 'right' }}>
                  {drink.guests.length}
                </span>

                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                  {expanded === drink.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {expanded === drink.name && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {drink.guests.map((name, i) => (
                    <span
                      key={i}
                      style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: 'var(--gold-light)', fontSize: '0.8rem' }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}