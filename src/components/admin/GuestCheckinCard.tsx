'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, User,
  Phone, Wine, AlertTriangle, Shield,
} from 'lucide-react'

interface GuestInfo {
  id:             string
  fullName:       string
  phone:          string
  side:           'HOMME' | 'FEMME'
  isCouple:       boolean
  label:          string
  checkedIn:      boolean
  checkedInAt:    string | null
  checkedInBy:    string | null
  table:          { name: string; category: string; capacity: number } | null
  rsvpStatus:     string
  drinks:         string[]
  isJwtVerified?: boolean
}

interface Props {
  guest:   GuestInfo
  eventId: string
  onReset: () => void
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

export default function GuestCheckinCard({ guest, eventId, onReset }: Props) {
  const router = useRouter()
  const [loading, setLoading]         = useState(false)
  const [checkedIn, setCheckedIn]     = useState(guest.checkedIn)
  const [checkedInAt, setCheckedInAt] = useState(guest.checkedInAt)
  const [alreadyIn, setAlreadyIn]     = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleCheckin = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkin/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ guestId: guest.id, eventId }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setAlreadyIn(true)
        setCheckedInAt(data.checkedInAt)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Erreur inconnue')
        setLoading(false)
        return
      }

      setCheckedIn(true)
      setCheckedInAt(data.checkedInAt)
      router.refresh()

    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const rsvpColor = {
    confirmed: '#7EC89A',
    declined:  '#E89AA6',
    pending:   'rgba(255,255,255,0.4)',
  }[guest.rsvpStatus] ?? 'rgba(255,255,255,0.4)'

  // ── Déjà scanné ──────────────────────────────────────────
  if (alreadyIn) {
    return (
      <div style={{
        background:   'rgba(234,154,0,0.08)',
        border:       '2px solid rgba(234,154,0,0.4)',
        borderRadius: '24px',
        padding:      '32px',
        textAlign:    'center',
      }}>
        <AlertTriangle size={48} color="#F5A623" style={{ margin: '0 auto 16px', display: 'block' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#F5A623', marginBottom: '8px' }}>
          Déjà enregistré !
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '6px' }}>
          <strong style={{ color: 'white' }}>{guest.fullName}</strong> a déjà été enregistré à l&apos;entrée
        </p>
        {checkedInAt && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '8px' }}>
            Heure d&apos;arrivée :{' '}
            <span style={{ color: '#F5A623' }}>{formatTime(checkedInAt)}</span>
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '24px' }}>
          Table : {guest.table?.name ?? '—'}
        </p>
        <button
          onClick={onReset}
          style={{
            padding:       '14px 32px',
            borderRadius:  '100px',
            border:        '1px solid rgba(234,154,0,0.4)',
            background:    'rgba(234,154,0,0.1)',
            color:         '#F5A623',
            fontFamily:    'var(--font-body)',
            fontSize:      '0.85rem',
            cursor:        'pointer',
            letterSpacing: '0.1em',
          }}
        >
          Scanner un autre invité
        </button>
      </div>
    )
  }

  // ── Check-in réussi ───────────────────────────────────────
  if (checkedIn && checkedInAt) {
    return (
      <div style={{
        background:   'rgba(90,138,106,0.1)',
        border:       '2px solid rgba(90,138,106,0.4)',
        borderRadius: '24px',
        padding:      '32px',
        textAlign:    'center',
      }}>
        <CheckCircle size={56} color="#7EC89A" style={{ margin: '0 auto 16px', display: 'block' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#7EC89A', marginBottom: '8px' }}>
          Accès autorisé ✓
        </p>
        <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem', color: 'white', marginBottom: '4px' }}>
          {guest.fullName}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '24px' }}>
          Enregistré à {formatTime(checkedInAt)}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Table</p>
            <p style={{ color: 'var(--gold-light)', fontSize: '0.95rem' }}>{guest.table?.name ?? '—'}</p>
          </div>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Côté</p>
            <p style={{ color: guest.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1', fontSize: '0.95rem' }}>
              {guest.side === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
            </p>
          </div>
        </div>

        {guest.drinks.length > 0 && (
          <div style={{
            padding:      '12px 16px',
            background:   'rgba(201,169,110,0.06)',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign:    'left',
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
          }}>
            <Wine size={14} color="var(--gold)" />
            <p style={{ color: 'var(--gold-light)', fontSize: '0.88rem' }}>
              {guest.drinks.join(' · ')}
            </p>
          </div>
        )}

        <button
          onClick={onReset}
          style={{
            width:         '100%',
            padding:       '16px',
            borderRadius:  '100px',
            border:        '1px solid rgba(90,138,106,0.4)',
            background:    'rgba(90,138,106,0.15)',
            color:         '#7EC89A',
            fontFamily:    'var(--font-body)',
            fontSize:      '0.85rem',
            cursor:        'pointer',
            letterSpacing: '0.1em',
          }}
        >
          Scanner le prochain invité
        </button>
      </div>
    )
  }

  // ── Affichage normal ──────────────────────────────────────
  return (
    <div style={{
      background:   'rgba(255,255,255,0.03)',
      border:       '1px solid rgba(201,169,110,0.2)',
      borderRadius: '24px',
      padding:      '28px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width:          '56px',
          height:         '56px',
          borderRadius:   '50%',
          background:     'rgba(201,169,110,0.1)',
          border:         '1px solid rgba(201,169,110,0.3)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 12px',
        }}>
          <User size={24} color="var(--gold)" />
        </div>
        <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem', color: 'white', lineHeight: 1.2 }}>
          {guest.fullName}
        </p>
        {guest.isCouple && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '4px' }}>
            👫 Couple (2 personnes)
          </p>
        )}

        {/* Badge JWT vérifié */}
        {guest.isJwtVerified && (
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '4px',
            padding:        '3px 10px',
            borderRadius:   '100px',
            background:     'rgba(90,138,106,0.1)',
            border:         '1px solid rgba(90,138,106,0.2)',
            marginTop:      '8px',
          }}>
            <Shield size={10} color="#7EC89A" />
            <span style={{ color: '#7EC89A', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              QR vérifié ✓
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Table</p>
          <p style={{ color: 'var(--gold-light)', fontSize: '0.95rem', fontWeight: 500 }}>
            {guest.table?.name ?? '—'}
          </p>
          {guest.table && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>{guest.table.category}</p>
          )}
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Côté</p>
          <p style={{ color: guest.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1', fontSize: '0.95rem', fontWeight: 500 }}>
            {guest.side === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
          </p>
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>RSVP</p>
          <p style={{ color: rsvpColor, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width:        '6px',
              height:       '6px',
              borderRadius: '50%',
              background:   rsvpColor,
              flexShrink:   0,
              display:      'inline-block',
            }} />
            {guest.rsvpStatus === 'confirmed'
              ? 'Confirmé'
              : guest.rsvpStatus === 'declined'
              ? 'Décliné'
              : 'En attente'}
          </p>
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Téléphone</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={11} />
            {guest.phone || '—'}
          </p>
        </div>
      </div>

      {guest.drinks.length > 0 && (
        <div style={{
          padding:      '12px 16px',
          background:   'rgba(201,169,110,0.05)',
          border:       '1px solid rgba(201,169,110,0.15)',
          borderRadius: '12px',
          marginBottom: '20px',
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
        }}>
          <Wine size={14} color="var(--gold)" />
          <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem' }}>
            {guest.drinks.join(' · ')}
          </p>
        </div>
      )}

      {error && (
        <p style={{
          color:        '#E89AA6',
          fontSize:     '0.82rem',
          padding:      '10px 14px',
          background:   'rgba(184,80,96,0.1)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleCheckin}
          disabled={loading}
          style={{
            width:          '100%',
            padding:        '18px',
            borderRadius:   '100px',
            border:         'none',
            background:     loading ? 'rgba(90,138,106,0.3)' : 'rgba(90,138,106,0.8)',
            color:          'white',
            fontFamily:     'var(--font-body)',
            fontSize:       '1rem',
            fontWeight:     500,
            cursor:         loading ? 'not-allowed' : 'pointer',
            transition:     'all 0.2s ease',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '8px',
          }}
        >
          {loading
            ? 'Enregistrement...'
            : <><CheckCircle size={18} /> Faire entrer</>
          }
        </button>

        <button
          onClick={onReset}
          style={{
            width:        '100%',
            padding:      '14px',
            borderRadius: '100px',
            border:       '1px solid rgba(255,255,255,0.1)',
            background:   'transparent',
            color:        'rgba(255,255,255,0.4)',
            fontFamily:   'var(--font-body)',
            fontSize:     '0.82rem',
            cursor:       'pointer',
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  )
}