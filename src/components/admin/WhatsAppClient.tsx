'use client'

import { useState } from 'react'
import {
  MessageCircle, Send, Users, CheckCircle,
  Clock, XCircle, AlertTriangle, RefreshCw,
  Calendar, Bell,
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
  event:          Event
  guests:         Guest[]
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
    desc:  'Pour les invités qui n\'ont pas encore confirmé',
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
    desc:  'Message le matin du mariage',
    icon:  '🎊',
    color: 'rgba(196,128,138,0.15)',
  },
]

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  sent:      { color: '#9DB4F5', label: 'Envoyé' },
  delivered: { color: '#7EC89A', label: 'Livré' },
  read:      { color: '#7EC89A', label: 'Lu' },
  failed:    { color: '#E89AA6', label: 'Échec' },
  pending:   { color: 'rgba(255,255,255,0.4)', label: 'En attente' },
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0')
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export default function WhatsAppClient({ event, guests, recentMessages }: Props) {
  const [selectedType, setSelectedType] = useState('INVITATION')
  const [onlyPending, setOnlyPending]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [tab, setTab]                   = useState<'send' | 'planning' | 'history'>('send')

  const confirmed  = guests.filter(g => g.rsvp_responses?.status === 'confirmed').length
  const pending    = guests.filter(g => (!g.rsvp_responses || g.rsvp_responses.status === 'pending') && g.phone && g.phone.length > 5).length
  const withPhone  = guests.filter(g => g.phone && g.phone.length > 5).length
  const daysLeft   = daysUntil(event.event_date)

  // Change le type et ajuste automatiquement le filtre
  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId)
    setResult(null)
    setError(null)
    // La relance ne concerne que les invités non-confirmés
    if (typeId === 'RELANCE') {
      setOnlyPending(true)
    } else {
      setOnlyPending(false)
    }
  }

  // Planning automatique basé sur la date du mariage
  const planningItems = [
    {
      label:    'Envoi initial des invitations',
      type:     'INVITATION',
      timing:   'Maintenant ou J-30',
      icon:     '💌',
      desc:     'Premier envoi à tous les invités avec le lien personnalisé',
      color:    '#9DB4F5',
    },
    {
      label:    'Relance non-confirmés',
      type:     'RELANCE',
      timing:   'J-14',
      icon:     '🔔',
      desc:     'Aux invités qui n\'ont pas encore confirmé leur présence',
      color:    'var(--gold)',
    },
    {
      label:    'Rappel J-1',
      type:     'RAPPEL_WA',
      timing:   'Veille du mariage',
      icon:     '⏰',
      desc:     'Rappel à tous les invités confirmés avec QR Code',
      color:    '#7EC89A',
    },
    {
      label:    'Message Jour J',
      type:     'MERCI',
      timing:   'Matin du mariage',
      icon:     '🎊',
      desc:     'Message de bienvenue le matin avec heure et lieu',
      color:    '#FFB6C1',
    },
  ]

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

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding:      '8px 18px',
    borderRadius: '8px',
    border:       active ? '1px solid rgba(201,169,110,0.4)' : '1px solid transparent',
    background:   active ? 'rgba(201,169,110,0.1)' : 'transparent',
    color:        active ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
    fontSize:     '0.82rem',
    cursor:       'pointer',
    transition:   'all 0.2s ease',
  })

  // Nombre d'invités ciblés selon le filtre
  const targetCount = onlyPending ? pending : withPhone

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(90,138,106,0.1)', border: '1px solid rgba(90,138,106,0.3)' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7EC89A' }} />
          <span style={{ fontSize: '0.72rem', color: '#7EC89A' }}>
            Meta WhatsApp actif — template invitation_mariage_premium approuvé ✓
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Total invités',  value: guests.length, color: 'rgba(255,255,255,0.7)', icon: <Users size={16} /> },
          { label: 'Avec téléphone', value: withPhone,     color: '#9DB4F5',               icon: <MessageCircle size={16} /> },
          { label: 'Confirmés',      value: confirmed,     color: '#7EC89A',               icon: <CheckCircle size={16} /> },
          { label: 'En attente',     value: pending,       color: 'rgba(201,169,110,0.8)', icon: <Clock size={16} /> },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
            <div style={{ color: s.color, marginBottom: '8px' }}>{s.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
        <button onClick={() => setTab('send')}     style={tabStyle(tab === 'send')}>
          <Send size={13} style={{ display: 'inline', marginRight: '6px' }} />
          Envoyer
        </button>
        <button onClick={() => setTab('planning')} style={tabStyle(tab === 'planning')}>
          <Calendar size={13} style={{ display: 'inline', marginRight: '6px' }} />
          Planning
        </button>
        <button onClick={() => setTab('history')}  style={tabStyle(tab === 'history')}>
          <Clock size={13} style={{ display: 'inline', marginRight: '6px' }} />
          Historique ({recentMessages.length})
        </button>
      </div>

      {/* ── TAB : ENVOYER ── */}
      {tab === 'send' && (
        <div style={{ maxWidth: '560px' }}>

          {/* Sélection type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {MESSAGE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '14px',
                  padding:     '14px 16px',
                  borderRadius:'14px',
                  background:  selectedType === type.id ? type.color : 'rgba(255,255,255,0.02)',
                  border:      selectedType === type.id ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                  cursor:      'pointer',
                  textAlign:   'left',
                  transition:  'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{type.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: selectedType === type.id ? 500 : 400 }}>
                    {type.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {type.desc}
                  </p>
                </div>
                {selectedType === type.id && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Option filtre */}
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
              padding:      '12px 16px',
              background:   'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              marginBottom: '20px',
              cursor:       selectedType === 'RELANCE' ? 'not-allowed' : 'pointer',
              border:       '1px solid rgba(255,255,255,0.06)',
              opacity:      selectedType === 'RELANCE' ? 0.6 : 1,
            }}
            onClick={() => { if (selectedType !== 'RELANCE') setOnlyPending(!onlyPending) }}
          >
            <div style={{
              width:          '20px',
              height:         '20px',
              borderRadius:   '6px',
              border:         onlyPending ? 'none' : '1px solid rgba(255,255,255,0.2)',
              background:     onlyPending ? 'var(--gold)' : 'transparent',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}>
              {onlyPending && <span style={{ color: '#0D0B09', fontSize: '12px', fontWeight: 700 }}>✓</span>}
            </div>
            <div>
              <p style={{ color: 'white', fontSize: '0.85rem' }}>Seulement les non-confirmés</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                {selectedType === 'RELANCE'
                  ? 'Activé automatiquement pour la relance'
                  : 'Ignore les invités ayant déjà confirmé'}
              </p>
            </div>
          </div>

          {/* Résultat */}
          {result && (
            <div style={{ padding: '16px', background: 'rgba(90,138,106,0.08)', border: '1px solid rgba(90,138,106,0.25)', borderRadius: '12px', marginBottom: '16px' }}>
              <p style={{ color: '#7EC89A', fontSize: '0.88rem', marginBottom: '4px' }}>✓ Envoi terminé</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                {result.sent} envoyés · {result.failed} échoués · {result.total} total
              </p>
            </div>
          )}

          {error && (
            <div style={{ padding: '14px 16px', background: 'rgba(184,80,96,0.08)', border: '1px solid rgba(184,80,96,0.2)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} color="#E89AA6" />
              <p style={{ color: '#E89AA6', fontSize: '0.82rem' }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSendAll}
            disabled={loading || targetCount === 0}
            style={{
              width:         '100%',
              padding:       '16px',
              borderRadius:  '100px',
              border:        '1px solid rgba(201,169,110,0.5)',
              background:    loading ? 'rgba(201,169,110,0.05)' : 'rgba(201,169,110,0.15)',
              color:         'var(--gold-light)',
              fontFamily:    'var(--font-body)',
              fontSize:      '0.85rem',
              letterSpacing: '0.1em',
              cursor:        loading || targetCount === 0 ? 'not-allowed' : 'pointer',
              opacity:       targetCount === 0 ? 0.4 : 1,
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              gap:           '8px',
              transition:    'all 0.2s ease',
            }}
          >
            {loading ? (
              <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Envoi en cours...</>
            ) : (
              <><Send size={15} /> Envoyer à {targetCount} invité{targetCount > 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      )}

      {/* ── TAB : PLANNING ── */}
      {tab === 'planning' && (
        <div style={{ maxWidth: '680px' }}>
          {/* Info mariage */}
          <div style={{ padding: '16px 20px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '14px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Bell size={20} color="var(--gold)" />
            <div>
              <p style={{ color: 'white', fontSize: '0.88rem' }}>
                Mariage dans <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{daysLeft}</span> jours
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '2px' }}>
                {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Planning items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {planningItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '16px',
                  padding:      '18px 20px',
                  background:   'rgba(255,255,255,0.02)',
                  border:       '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                }}
              >
                <div style={{
                  width:          '36px',
                  height:         '36px',
                  borderRadius:   '50%',
                  background:     'rgba(255,255,255,0.05)',
                  border:         '1px solid rgba(255,255,255,0.1)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  fontSize:       '1.1rem',
                }}>
                  {item.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: 500, marginBottom: '2px' }}>
                    {item.label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: item.color, fontSize: '0.78rem', fontWeight: 500 }}>
                    {item.timing}
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleTypeChange(item.type)
                    setTab('send')
                  }}
                  style={{
                    padding:      '8px 14px',
                    borderRadius: '100px',
                    border:       '1px solid rgba(201,169,110,0.3)',
                    background:   'rgba(201,169,110,0.08)',
                    color:        'var(--gold-light)',
                    fontSize:     '0.72rem',
                    cursor:       'pointer',
                    flexShrink:   0,
                    whiteSpace:   'nowrap',
                  }}
                >
                  Envoyer →
                </button>
              </div>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginTop: '20px', textAlign: 'center' }}>
            💡 L&apos;envoi automatique planifié sera disponible une fois Meta WhatsApp configuré
          </p>
        </div>
      )}

      {/* ── TAB : HISTORIQUE ── */}
      {tab === 'history' && (
        <div>
          {recentMessages.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '48px 0' }}>
              Aucun message envoyé pour l&apos;instant
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentMessages.map(msg => {
                const sc = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.pending
                return (
                  <div key={msg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                        {msg.guests?.full_name ?? '—'}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>
                        {msg.type} · {msg.sent_at ? formatTime(msg.sent_at) : '—'}
                      </p>
                    </div>
                    <span style={{ color: sc.color, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {msg.status === 'sent' && <Send size={11} />}
                      {msg.status === 'delivered' && <CheckCircle size={11} />}
                      {msg.status === 'read' && <CheckCircle size={11} />}
                      {msg.status === 'failed' && <XCircle size={11} />}
                      {msg.status === 'pending' && <Clock size={11} />}
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}