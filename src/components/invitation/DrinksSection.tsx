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
  const [saving, setSaving] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

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

    // Sauvegarde immédiate
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
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '72px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: '6rem',
              fontWeight: 300,
              color: 'var(--gold)',
              opacity: 0.06,
              lineHeight: 1,
              marginBottom: '-32px',
              userSelect: 'none',
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
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'white',
              letterSpacing: '-0.01em',
            }}
          >
            Choix des boissons
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '12px' }}>
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
              marginBottom: '48px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) ' + (0.1 + ci * 0.15) + 's',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ width: '32px', height: '1px', background: 'var(--gold)', opacity: 0.4 }} />
              <p className="label-overline" style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
                {cat.categoryName}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'var(--gold)', opacity: 0.1 }} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
                gap: '12px',
              }}
            >
              {cat.drinks.map((drink, di) => {
                const isSel = selected.includes(drink)
                const isDisabled = !isSel && selected.length >= MAX
                return (
                  <button
                    key={di}
                    onClick={() => toggle(drink, cat.categoryName)}
                    disabled={isDisabled}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: isSel ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSel
                        ? '1px solid rgba(201,169,110,0.45)'
                        : '1px solid rgba(255,255,255,0.07)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.3 : 1,
                      transition: 'all 0.25s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSel ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        background: isSel ? 'var(--gold)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSel && <Check size={11} color="#0D0B09" strokeWidth={3} />}
                    </div>
                    <span
                      style={{
                        color: isSel ? 'var(--gold-light)' : 'rgba(255,255,255,0.65)',
                        fontSize: '0.88rem',
                        lineHeight: 1.4,
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid rgba(201,169,110,0.12)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
            {selected.length === 0
              ? 'Aucune sélection'
              : selected.join(' · ')}
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {Array.from({ length: MAX }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i < selected.length ? '24px' : '8px',
                  height: '4px',
                  borderRadius: '2px',
                  background: i < selected.length
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
    </section>
  )
}