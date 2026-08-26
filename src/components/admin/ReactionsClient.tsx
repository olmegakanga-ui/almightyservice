'use client'

interface Rsvp {
  status: string
  guests: { full_name: string; side: string; is_couple: boolean } | null
}

interface Props {
  event: { id: string; groom_name: string; bride_name: string }
  rsvps: Rsvp[]
}

/** Un couple compte pour deux personnes. */
const countPersons = (list: Rsvp[]) =>
  list.reduce((acc, r) => acc + (r.guests?.is_couple ? 2 : 1), 0)

export default function ReactionsClient({ event, rsvps }: Props) {
  const confirmed = rsvps.filter(r => r.status === 'confirmed')
  const declined  = rsvps.filter(r => r.status === 'declined')
  const pending   = rsvps.filter(r => r.status === 'pending')

  const totalPersons = countPersons(rsvps)
  const totalEntries = rsvps.length

  const pct = (n: number) => totalPersons > 0 ? Math.round((n / totalPersons) * 100) : 0

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
  }) => {
    const persons = countPersons(list)
    return (
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ color, fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {label}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '4px' }}>
              {list.length} invitation{list.length > 1 ? 's' : ''}
            </p>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color, lineHeight: 1, flexShrink: 0 }}>
            {persons}
          </span>
        </div>

        {/* Barre */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct(persons) + '%', background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
          {list.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: bg }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', minWidth: 0, overflowWrap: 'anywhere' }}>
                {r.guests?.full_name ?? 'Invité'}
                {r.guests?.is_couple && (
                  <span style={{ color: 'rgba(201,169,110,0.7)', fontSize: '0.7rem', marginLeft: '8px' }}>× 2</span>
                )}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
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
  }

  const confirmedP = countPersons(confirmed)
  const pendingP   = countPersons(pending)
  const declinedP  = countPersons(declined)

  return (
    <div className="admin-page">
      <style>{`
        .admin-page { padding: 40px; max-width: 100%; box-sizing: border-box; }
        @media (max-width: 767px) { .admin-page { padding: 68px 16px 32px; } }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 599px) { .kpi-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} &amp; {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white', lineHeight: 1.15 }}>
          Portrait des réactions
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          <span style={{ color: 'var(--gold-light)' }}>{totalPersons} personne{totalPersons > 1 ? 's' : ''}</span>
          {' · '}{totalEntries} invitation{totalEntries > 1 ? 's' : ''} (couples comptés × 2)
        </p>
      </div>

      {/* Cartes de synthèse */}
      <div className="kpi-grid">
        {[
          { label: 'Confirmées',  count: confirmedP, color: '#7EC89A' },
          { label: 'En attente',  count: pendingP,   color: 'rgba(201,169,110,0.8)' },
          { label: 'Déclinées',   count: declinedP,  color: '#E89AA6' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', textAlign: 'center', minWidth: 0 }}>
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
        <div style={{ width: pct(confirmedP) + '%', background: '#7EC89A', transition: 'width 0.6s' }} />
        <div style={{ width: pct(pendingP) + '%', background: 'rgba(201,169,110,0.6)', transition: 'width 0.6s' }} />
        <div style={{ width: pct(declinedP) + '%', background: '#E89AA6', transition: 'width 0.6s' }} />
      </div>

      {/* Listes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        <Section label="Confirmées"  list={confirmed} color="#7EC89A"               bg="rgba(90,138,106,0.06)" />
        <Section label="En attente"  list={pending}   color="rgba(201,169,110,0.8)" bg="rgba(201,169,110,0.04)" />
        <Section label="Déclinées"   list={declined}  color="#E89AA6"               bg="rgba(184,80,96,0.06)" />
      </div>
    </div>
  )
}
