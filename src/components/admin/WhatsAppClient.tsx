'use client'

import { useState } from 'react'
import {
  MessageCircle, Send, Users, CheckCircle,
  Clock, XCircle, AlertTriangle, RefreshCw,
} from 'lucide-react'

interface Guest {
  id: string
  full_name: string
  phone: string
  side: string
  rsvp_responses: { status: string } | null
}

interface Message {
  id: string
  type: string
  status: string
  sent_at: string
  guests: { full_name: string } | null
}

interface Event {
  id: string
  groom_name: string
  bride_name: string
  event_date: string
}

interface Props {
  event: Event
  guests: Guest[]
  recentMessages: Message[]
}

const MESSAGE_TYPES = [
  {
    id:    'INVITATION',
    label: 'Invitation initiale',
    desc:  'Envoie l\'invitation personnalisée avec le lien unique',
    icon:  '💌',
    color: 'rgba(201,169,110,0.2)',
  },
  {
    id:    'RELANCE',
    label: 'Relance',
    desc:  'Pour les invités qui n\'ont pas encore cliqué',
    icon:  '🔔',
    color: 'rgba(100,149,237,0.15)',
  },
  {
    id:    'RAPPEL_WA',
    label: 'Rappel J-1',
    desc:  'Rappel la veille du mariage',
    icon:  '⏰',
    color: 'rgba(90,138,106,0.15)',
  },
  {
    id:    'MERCI',
    label: 'Message Jour J',
    desc:  'Message le jour du mariage avec QR Code',
    icon:  '🎊',
    color: 'rgba(196,128,138,0.15)',
  },
]

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  sent:      { color: '#9DB4F5', label: 'Envoyé',    icon: <Send size={12} /> },
  delivered: { color: '#7EC89A', label: 'Livré',     icon: <CheckCircle size={12} /> },
  read:      { color: '#7EC89A', label: 'Lu',        icon: <CheckCircle size={12} /> },
  failed:    { color: '#E89AA6', label: 'Échec',     icon: <XCircle size={12} /> },
  pending:   { color: 'rgba(255,255,255,0.4)', label: 'En attente', icon: <Clock size={12} /> },
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

export default function WhatsAppClient({ event, guests, recentMessages }: Props) {
  const [selectedType, setSelectedType] = useState('INVITATION')
  const [onlyPending, setOnlyPending]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<{
    sent: number; failed: number; total: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const provider = process.env.NEXT_PUBLIC_WA_PROVIDER ?? 'mock'

  const confirmed = guests.filter(g => g.rsvp_responses?.status === 'confirmed').length
  const pending   = guests.filter(g => !g.rsvp_responses || g.rsvp_responses.status === 'pending').length
  const withPhone = guests.filter(g => g.phone && g.phone.length > 5).length

  const handleSendAll = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/whatsapp/send-bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          eventId:     event.id,
          messageType: selectedType,
          onlyPending,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur envoi')
        return
      }

      setResult({ sent: data.sent, failed: data.failed, total: data.total })
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '8px' }}>
          WhatsApp
        </h1>

        {/* Badge provider */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '100px',
          background: provider === 'mock'
            ? 'rgba(234,154,0,0.1)'
            : 'rgba(90,138,106,0.1)',
          border: provider === 'mock'
            ? '1px solid rgba(234,154,0,0.3)'
            : '1px solid rgba(90,138,106,0.3)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: provider === 'mock' ? '#F5A623' : '#7EC89A',
          }} />
          <span style={{
            fontSize: '0.72rem',
            color: provider === 'mock' ? '#F5A623' : '#7EC89A',
          }}>
            {provider === 'mock'
              ? 'Mode simulation (WHATSAPP_PROVIDER=mock)'
              : `Provider: ${provider}`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Total invités', value: guests.length,  color: 'rgba(255,255,255,0.7)', icon: <Users size={16} /> },
          { label: 'Avec téléphone', value: withPhone,     color: '#9DB4F5',              icon: <MessageCircle size={16} /> },
          { label: 'Confirmés',     value: confirmed,      color: '#7EC89A',              icon: <CheckCircle size={16} /> },
          { label: 'En attente',    value: pending,        color: 'rgba(201,169,110,0.8)', icon: <Clock size={16} /> },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
            <div style={{ color: s.color, marginBottom: '8px' }}>{s.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>

        {/* Panel envoi */}
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            Envoyer un message
          </p>

          {/* Sélection type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {MESSAGE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: selectedType === type.id ? type.color : 'rgba(255,255,255,0.02)',
                  border: selectedType === type.id
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{type.icon}</span>
                <div>
                  <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: selectedType === type.id ? 500 : 400 }}>
                    {type.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {type.desc}
                  </p>
                </div>
                {selectedType === type.id && (
                  <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Option filtre */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
            onClick={() => setOnlyPending(!onlyPending)}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              border: onlyPending ? 'none' : '1px solid rgba(255,255,255,0.2)',
              background: onlyPending ? 'var(--gold)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {onlyPending && <span style={{ color: '#0D0B09', fontSize: '12px', fontWeight: 700 }}>✓</span>}
            </div>
            <div>
              <p style={{ color: 'white', fontSize: '0.85rem' }}>Seulement les non-confirmés</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                Ignore les invités qui ont déjà confirmé leur présence
              </p>
            </div>
          </div>

          {/* Résultat */}
          {result && (
            <div style={{
              padding: '16px',
              background: 'rgba(90,138,106,0.08)',
              border: '1px solid rgba(90,138,106,0.25)',
              borderRadius: '12px',
              marginBottom: '16px',
            }}>
              <p style={{ color: '#7EC89A', fontSize: '0.88rem', marginBottom: '4px' }}>
                ✓ Envoi terminé
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                {result.sent} envoyés · {result.failed} échoués · {result.total} total
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(184,80,96,0.08)',
              border: '1px solid rgba(184,80,96,0.2)',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertTriangle size={14} color="#E89AA6" />
              <p style={{ color: '#E89AA6', fontSize: '0.82rem' }}>{error}</p>
            </div>
          )}

          {/* Bouton envoi */}
          <button
            onClick={handleSendAll}
            disabled={loading || withPhone === 0}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '100px',
              border: '1px solid rgba(201,169,110,0.5)',
              background: loading ? 'rgba(201,169,110,0.05)' : 'rgba(201,169,110,0.15)',
              color: 'var(--gold-light)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              cursor: loading || withPhone === 0 ? 'not-allowed' : 'pointer',
              opacity: withPhone === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Envoi en cours...</>
            ) : (
              <><Send size={15} /> Envoyer à {onlyPending ? pending : withPhone} invité{(onlyPending ? pending : withPhone) > 1 ? 's' : ''}</>
            )}
          </button>
        </div>

        {/* Historique messages */}
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            Historique récent
          </p>

          {recentMessages.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
              Aucun message envoyé
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentMessages.map(msg => {
                const statusConf = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.pending
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                        {msg.guests?.full_name ?? '—'}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>
                        {msg.type} · {msg.sent_at ? formatTime(msg.sent_at) : '—'}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: statusConf.color,
                      fontSize: '0.75rem',
                    }}>
                      {statusConf.icon}
                      {statusConf.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}