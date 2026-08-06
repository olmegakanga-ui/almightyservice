'use client'

import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { DrinkCategory } from '@/types/database.types'

interface Props {
  categories: DrinkCategory[]
  guestId: string
  eventId: string
  initialSelected: string[]
}

const MAX = 2

export default function DrinksSection({
  categories,
  guestId,
  eventId,
  initialSelected,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [saving, setSaving]     = useState(false)
  const sectionRef              = useRef<HTMLElement>(null)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const toggle = async (drink: string, category: string) => {
    let next: string[]
    if (selected.includes(drink)) {
      next = selected.filter(d => d !== drink)
    } else {
      if (selected.length >= MAX) return
      next = [...selected, drink]
    }
    setSelected(next)

    setSaving(true)
    try {
      await fetch('/api/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          eventId,
          drinks: next.map(name => ({ name, category })),
        }),
      })
    } catch (err) {
      console.error('Erreur sauvegarde boissons:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: 'clamp(70px, 14vw, 100px) clamp(14px, 4vw, 24px)', position: 'relative' }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div
          style={{
            textAlign:    'center',
            marginBottom: 'clamp(48px, 10vw, 72px)',
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(30px)',
            transition:   'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize:     'clamp(4rem, 14vw, 6rem)',
              fontWeight:   300,
              color:        'var(--gold)',
              opacity:      0.06,
              lineHeight:   1,
              marginBottom: '-32px',
              userSelect:   'none',
            }}
          >
            05
          </p>
          <p className="label-overline" style={{ marginBottom: '12px' }}>
            Vos préférences
          </p>
          <h2
            className="font-display"
            style={{
              fontSize:      'clamp(1.7rem, 6vw, 3rem)',
              fontWeight:    300,
              color:         'white',
              letterSpacing: '-0.01em',
            }}
          >
            Choix des boissons
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(0.78rem, 2.4vw, 0.85rem)', marginTop: '12px' }}>
            Sélectionnez jusqu&apos;à {MAX} boissons
            {saving && (
              <span style={{ color: 'var(--gold)', marginLeft: '8px', fontSize: '0.75rem' }}>
                · Sauvegarde...
              </span>
            )}
          </p>
        </div>

        {categories.map((cat, ci) => (
          <div
            key={ci}
            style={{
              marginBottom: 'clamp(32px, 7vw, 48px)',
              opacity:      visible ? 1 : 0,
              transform:    visible ? 'translateY(0)' : 'translateY(24px)',
              transition:   'all 0.8s cubic-bezier(0.16,1,0.3,1) ' + (0.1 + ci * 0.15) + 's',
            }}
          >
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          'clamp(10px, 3vw, 16px)',
                marginBottom: 'clamp(16px, 4vw, 24px)',
              }}
            >
              <div style={{ width: 'clamp(20px, 6vw, 32px)', height: '1px', background: 'var(--gold)', opacity: 0.4, flexShrink: 0 }} />
              <p className="label-overline" style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
                {cat.categoryName}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'var(--gold)', opacity: 0.1 }} />
            </div>

            <div className="drinks-grid">
              {cat.drinks.map((drink, di) => {
                const isSel      = selected.includes(drink)
                const isDisabled = !isSel && selected.length >= MAX
                return (
                  <button
                    key={di}
                    onClick={() => toggle(drink, cat.categoryName)}
                    disabled={isDisabled}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          'clamp(9px, 2.5vw, 14px)',
                      padding:      'clamp(11px, 3vw, 16px) clamp(11px, 3.5vw, 18px)',
                      borderRadius: '14px',
                      background:   isSel ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.03)',
                      border:       isSel
                        ? '1px solid rgba(201,169,110,0.45)'
                        : '1px solid rgba(255,255,255,0.07)',
                      cursor:     isDisabled ? 'not-allowed' : 'pointer',
                      opacity:    isDisabled ? 0.3 : 1,
                      transition: 'all 0.25s ease',
                      textAlign:  'left',
                      minWidth:   0,
                    }}
                  >
                    <div
                      style={{
                        width:          'clamp(17px, 4.5vw, 20px)',
                        height:         'clamp(17px, 4.5vw, 20px)',
                        borderRadius:   '50%',
                        border:         isSel ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        background:     isSel ? 'var(--gold)' : 'transparent',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                        transition:     'all 0.2s ease',
                      }}
                    >
                      {isSel && <Check size={11} color="#0D0B09" strokeWidth={3} />}
                    </div>
                    <span
                      style={{
                        color:      isSel ? 'var(--gold-light)' : 'rgba(255,255,255,0.65)',
                        fontSize:   'clamp(0.76rem, 2.5vw, 0.88rem)',
                        lineHeight: 1.35,
                        minWidth:   0,
                        wordBreak:  'break-word',
                      }}
                    >
                      {drink}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Compteur */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            '12px',
            flexWrap:       'wrap',
            paddingTop:     '24px',
            borderTop:      '1px solid rgba(201,169,110,0.12)',
            opacity:        visible ? 1 : 0,
            transition:     'opacity 0.8s ease 0.5s',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(0.72rem, 2.3vw, 0.8rem)', minWidth: 0, flex: '1 1 140px' }}>
            {selected.length === 0
              ? 'Aucune sélection'
              : selected.join(' · ')}
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {Array.from({ length: MAX }).map((_, i) => (
              <div
                key={i}
                style={{
                  width:        i < selected.length ? '24px' : '8px',
                  height:       '4px',
                  borderRadius: '2px',
                  background:   i < selected.length
                    ? 'var(--gold)'
                    : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
            <span style={{ color: 'var(--gold)', fontSize: '0.8rem', marginLeft: '8px' }}>
              {selected.length}/{MAX}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        /* Mobile — 2 colonnes dès 340px de large */
        .drinks-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        /* Petits mobiles — 1 colonne pour rester lisible */
        @media (max-width: 339px) {
          .drinks-grid {
            grid-template-columns: 1fr;
          }
        }
        /* Tablette — 3 colonnes */
        @media (min-width: 620px) {
          .drinks-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
        }
        /* Desktop — 4 colonnes */
        @media (min-width: 900px) {
          .drinks-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  )
}