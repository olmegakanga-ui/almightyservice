'use client'

interface Rsvp {
  status: string
  guests: { full_name: string; side: string } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  rsvps: Rsvp[]
}

export default function ReactionsClient({ event, rsvps }: Props) {
  const confirmed = rsvps.filter(r => r.status === 'confirmed')
  const declined  = rsvps.filter(r => r.status === 'declined')
  const pending   = rsvps.filter(r => r.status === 'pending')
  const total     = rsvps.length

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  const Section = ({
    label,
    list,
    color,
    bg,
  }: {
    label: string
    list: Rsvp[]
    color: string
    bg: string
  }) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color, fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color, lineHeight: 1 }}>
          {list.length}
        </span>
      </div>

      {/* Barre */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct(list.length) + '%', background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
        {list.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: bg }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
              {r.guests?.full_name ?? 'Invité'}
            </p>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
              {r.guests?.side === 'HOMME' ? '♂' : '♀'}
            </span>
          </div>
        ))}
        {list.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0' }}>
            Aucun invité
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Portrait des réactions
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          {total} invité{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Donut visuel simplifié */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { label: 'Confirmés',  count: confirmed.length, color: '#7EC89A' },
          { label: 'En attente', count: pending.length,   color: 'rgba(201,169,110,0.8)' },
          { label: 'Déclinés',   count: declined.length,  color: '#E89AA6' },
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, minWidth: '140px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: stat.color, lineHeight: 1, marginBottom: '4px' }}>
              {pct(stat.count)}%
            </p>
            <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: stat.color, marginBottom: '4px' }}>
              {stat.count}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Barre globale */}
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px', display: 'flex' }}>
        <div style={{ width: pct(confirmed.length) + '%', background: '#7EC89A', transition: 'width 0.6s' }} />
        <div style={{ width: pct(pending.length) + '%', background: 'rgba(201,169,110,0.6)', transition: 'width 0.6s' }} />
        <div style={{ width: pct(declined.length) + '%', background: '#E89AA6', transition: 'width 0.6s' }} />
      </div>

      {/* Listes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section label="Confirmés"  list={confirmed} color="#7EC89A"              bg="rgba(90,138,106,0.06)" />
        <Section label="En attente" list={pending}   color="rgba(201,169,110,0.8)" bg="rgba(201,169,110,0.04)" />
        <Section label="Déclinés"   list={declined}  color="#E89AA6"              bg="rgba(184,80,96,0.06)" />
      </div>
    </div>
  )
}