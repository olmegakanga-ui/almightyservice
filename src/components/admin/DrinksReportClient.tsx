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
    <div className="admin-page">
      <style>{`
        .admin-page {
          padding: 40px;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .admin-page { padding: 68px 16px 32px; }
        }
        .drink-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          cursor: pointer;
          min-width: 0;
        }
        @media (max-width: 767px) {
          .drink-row { padding: 14px 16px; gap: 10px; }
        }
        .drink-name {
          font-family: var(--font-display);
          font-size: 1rem;
          color: white;
          overflow-wrap: anywhere;
          line-height: 1.3;
        }
        .drink-category {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 3px;
          overflow-wrap: anywhere;
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} &amp; {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white', lineHeight: 1.15 }}>
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
          drinkStats.map(drink => {
            const isOpen = expanded === drink.name

            return (
              <div
                key={drink.name}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}
              >
                {/* Ligne principale */}
                <div
                  className="drink-row"
                  onClick={() => setExpanded(isOpen ? null : drink.name)}
                >
                  {/* Nom + catégorie — occupe l'espace restant et peut rétrécir */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="drink-name">{drink.name}</p>
                    <p className="drink-category">{drink.category}</p>
                  </div>

                  {/* Compteur */}
                  <span style={{
                    color:      'var(--gold)',
                    fontFamily: 'var(--font-display)',
                    fontSize:   '1.25rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}>
                    {drink.guests.length}
                  </span>

                  <button
                    aria-label={isOpen ? 'Masquer les invités' : 'Voir les invités'}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', flexShrink: 0, display: 'flex' }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Barre de proportion — pleine largeur, sous la ligne */}
                <div style={{ padding: '0 20px 14px' }}>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height:       '100%',
                      width:        (drink.guests.length / maxCount * 100) + '%',
                      background:   'var(--gold)',
                      borderRadius: '3px',
                      transition:   'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* Liste des invités */}
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {drink.guests.map((name, i) => (
                      <span
                        key={i}
                        style={{
                          padding:       '4px 12px',
                          borderRadius:  '100px',
                          background:    'rgba(201,169,110,0.08)',
                          border:        '1px solid rgba(201,169,110,0.2)',
                          color:         'var(--gold-light)',
                          fontSize:      '0.8rem',
                          maxWidth:      '100%',
                          overflowWrap:  'anywhere',
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
