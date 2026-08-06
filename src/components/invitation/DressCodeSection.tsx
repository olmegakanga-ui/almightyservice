'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  dressCode:   string | null
  dressColors: string[]
}

export default function DressCodeSection({ dressCode, dressColors }: Props) {
  const sectionRef            = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const hasColors = dressColors.length > 0

  // Si aucune information n'est renseignée → ne rien afficher
  if (!dressCode && !hasColors) return null

  return (
    <section ref={sectionRef} style={{ padding: '100px 24px', position: 'relative' }}>
      <div style={{
        maxWidth:   '640px',
        margin:     '0 auto',
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="font-display" style={{ fontSize: '6rem', fontWeight: 300, color: 'var(--gold)', opacity: 0.06, lineHeight: 1, marginBottom: '-32px', userSelect: 'none' }}>
            08
          </p>
          <p className="label-overline" style={{ marginBottom: '12px' }}>Tenue de soirée</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: 'white', letterSpacing: '-0.01em' }}>
            Dress code
          </h2>
        </div>

        {hasColors && (
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            '20px',
            marginBottom:   dressCode ? '40px' : '0',
          }}>
            {dressColors.map((color, i) => (
              <div
                key={i}
                style={{
                  width:           '48px',
                  height:          '48px',
                  borderRadius:    '50%',
                  background:      color,
                  border:          '2px solid var(--gold)',
                  boxShadow:       '0 4px 20px rgba(0,0,0,0.3)',
                  opacity:         visible ? 1 : 0,
                  transform:       visible ? 'scale(1)' : 'scale(0.6)',
                  transition:      'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                  transitionDelay: i * 0.08 + 's',
                }}
              />
            ))}
          </div>
        )}

        {dressCode && (
          <p style={{
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize:  '1.3rem',
            fontWeight: 300,
            color:     'var(--gold-light)',
          }}>
            {dressCode}
          </p>
        )}
      </div>
    </section>
  )
}
