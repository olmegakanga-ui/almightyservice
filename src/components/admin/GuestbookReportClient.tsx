'use client'

import { useState } from 'react'
import { BookOpen, X } from 'lucide-react'

interface Entry {
  message: string
  created_at: string
  guests: { full_name: string; side: string } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  entries: Entry[]
}

export default function GuestbookReportClient({ event, entries }: Props) {
  const [selected, setSelected] = useState<Entry | null>(null)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Livre d&apos;or digital
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          {entries.length} message{entries.length > 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {entries.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.2)', gridColumn: '1/-1', textAlign: 'center', padding: '48px' }}>
            Aucun message pour l&apos;instant
          </p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              onClick={() => setSelected(entry)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={14} color="var(--gold)" />
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: 500 }}>
                    {entry.guests?.full_name ?? 'Invité'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.6, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                &quot;{entry.message}&quot;
              </p>
              <button style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, letterSpacing: '0.1em' }}>
                Voir la note →
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal message complet */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
        >
          <div style={{ width: '100%', maxWidth: '480px', background: '#141210', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'white' }}>
                {selected.guests?.full_name}
              </p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.8 }}>
              &quot;{selected.message}&quot;
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '20px' }}>
              {formatDate(selected.created_at)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
}