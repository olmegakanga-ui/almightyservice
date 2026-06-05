'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Trash2, Users, Shield, Crown, Link, Copy, Check } from 'lucide-react'

interface EventUser {
  id:            string
  event_id:      string
  email:         string
  role:          'superadmin' | 'couple' | 'protocole'
  full_name:     string
  invited_at:    string
  last_login_at: string | null
  access_token:  string
}

interface Event {
  id:         string
  groom_name: string
  bride_name: string
}

interface Props {
  event:        Event
  initialUsers: EventUser[]
}

const ROLE_CONFIG = {
  superadmin: {
    label:  'Super Admin',
    color:  '#F5A623',
    bg:     'rgba(245,166,35,0.1)',
    border: 'rgba(245,166,35,0.3)',
    icon:   Crown,
    desc:   'Accès total — tous les menus',
  },
  couple: {
    label:  'Mariés',
    color:  '#9DB4F5',
    bg:     'rgba(157,180,245,0.1)',
    border: 'rgba(157,180,245,0.3)',
    icon:   Users,
    desc:   "Invités, Tables, Boissons, Livre d'or, Réactions, Check-in, Plan de salle",
  },
  protocole: {
    label:  'Protocole',
    color:  '#7EC89A',
    bg:     'rgba(126,200,154,0.1)',
    border: 'rgba(126,200,154,0.3)',
    icon:   Shield,
    desc:   'Scanner QR, Check-in, Plan de salle uniquement',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

export default function AccessClient({ event, initialUsers }: Props) {
  const [users, setUsers]         = useState<EventUser[]>(initialUsers)
  const [email, setEmail]         = useState('')
  const [fullName, setFullName]   = useState('')
  const [role, setRole]           = useState<'couple' | 'protocole'>('couple')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)

  const reload = async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('event_users')
      .select('*')
      .eq('event_id', event.id)
      .order('role', { ascending: true })
    if (data) setUsers(data)
  }

  const handleInvite = async () => {
    if (!email.trim()) { setError('Email requis'); return }
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const db       = supabase as any

      // Ajouter l'utilisateur dans event_users
      const { data: newUser, error: insertError } = await db
        .from('event_users')
        .upsert({
          event_id:  event.id,
          email:     email.trim().toLowerCase(),
          role,
          full_name: fullName.trim(),
        }, { onConflict: 'event_id,email' })
        .select('*')
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Copier le lien direct dans le presse-papier
      if (newUser?.access_token) {
        const link = `${window.location.origin}/admin/access/${newUser.access_token}`
        await navigator.clipboard.writeText(link)
        setSuccess(`Utilisateur ajouté ! Lien direct copié :\n${link}`)
      } else {
        setSuccess('Utilisateur ajouté avec succès !')
      }

      setEmail('')
      setFullName('')
      await reload()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (u: EventUser) => {
    const link = `${window.location.origin}/admin/access/${u.access_token}`
    await navigator.clipboard.writeText(link)
    setCopied(u.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (userId: string) => {
    const supabase = createClient()
    await (supabase as any)
      .from('event_users')
      .delete()
      .eq('id', userId)
    await reload()
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '11px 14px',
    background:   'rgba(255,255,255,0.04)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color:        'white',
    fontFamily:   'var(--font-body)',
    fontSize:     '0.88rem',
    outline:      'none',
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Gestion des accès
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '6px' }}>
          Créez des liens directs permanents pour les mariés et l&apos;équipe protocole
        </p>
      </div>

      {/* Info lien direct */}
      <div style={{ padding: '16px 20px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '14px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '2px' }}>
            Lien direct permanent
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Chaque utilisateur reçoit un lien unique. Un clic suffit pour se connecter — pas besoin d&apos;email ni de mot de passe.
          </p>
        </div>
      </div>

      {/* Rôles expliqués */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {(Object.entries(ROLE_CONFIG) as [keyof typeof ROLE_CONFIG, typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([key, conf]) => (
          <div key={key} style={{ padding: '16px', background: conf.bg, border: '1px solid ' + conf.border, borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <conf.icon size={16} color={conf.color} />
              <p style={{ color: conf.color, fontSize: '0.85rem', fontWeight: 500 }}>{conf.label}</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', lineHeight: 1.5 }}>{conf.desc}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
          Ajouter un utilisateur
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
                Nom complet
              </p>
              <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Ex: Jonathan Banza"
                onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
                Email
              </p>
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {/* Sélection rôle */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              Rôle
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['couple', 'protocole'] as const).map(r => {
                const conf = ROLE_CONFIG[r]
                return (
                  <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: role === r ? '1px solid ' + conf.border : '1px solid rgba(255,255,255,0.08)', background: role === r ? conf.bg : 'transparent', color: role === r ? conf.color : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <conf.icon size={14} />
                    {conf.label}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {success && (
            <div style={{ color: '#7EC89A', fontSize: '0.82rem', padding: '12px 14px', background: 'rgba(90,138,106,0.1)', borderRadius: '8px', border: '1px solid rgba(90,138,106,0.2)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              ✓ {success}
            </div>
          )}

          <button onClick={handleInvite} disabled={loading} style={{ padding: '14px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.4)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.6 : 1 }}>
            <Link size={14} />
            {loading ? 'Création...' : 'Créer et copier le lien direct'}
          </button>
        </div>
      </div>

      {/* Liste utilisateurs */}
      <div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
          Utilisateurs ({users.length})
        </p>

        {users.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
            Aucun utilisateur — ajoutez les mariés et l&apos;équipe protocole
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map(u => {
              const conf      = ROLE_CONFIG[u.role]
              const isCopied  = copied === u.id
              const directLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://almightyservice.vercel.app'}/admin/access/${u.access_token}`
              return (
                <div key={u.id} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: conf.bg, border: '1px solid ' + conf.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <conf.icon size={16} color={conf.color} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: 500 }}>
                        {u.full_name || u.email}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                        {u.email}
                      </p>
                    </div>

                    {/* Rôle */}
                    <span style={{ padding: '4px 12px', borderRadius: '100px', background: conf.bg, border: '1px solid ' + conf.border, color: conf.color, fontSize: '0.72rem', letterSpacing: '0.1em', flexShrink: 0 }}>
                      {conf.label}
                    </span>

                    {/* Dernière connexion */}
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', flexShrink: 0, minWidth: '90px', textAlign: 'right' }}>
                      {u.last_login_at ? 'Connecté ' + formatDate(u.last_login_at) : 'Jamais connecté'}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleCopyLink(u)}
                          title="Copier le lien direct"
                          style={{ padding: '7px 12px', borderRadius: '8px', border: isCopied ? '1px solid rgba(90,138,106,0.4)' : '1px solid rgba(201,169,110,0.3)', background: isCopied ? 'rgba(90,138,106,0.1)' : 'rgba(201,169,110,0.08)', color: isCopied ? '#7EC89A' : 'var(--gold-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', transition: 'all 0.2s ease' }}
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied ? 'Copié !' : 'Lien'}
                        </button>
                      )}
                      {u.role !== 'superadmin' && (
                        <button onClick={() => handleDelete(u.id)} title="Supprimer l'accès"
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid rgba(184,80,96,0.2)', background: 'transparent', color: '#E89AA6', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lien direct affiché */}
                  {u.role !== 'superadmin' && u.access_token && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Link size={11} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                        {directLink}
                      </p>
                      <button
                        onClick={() => handleCopyLink(u)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.68rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isCopied ? <Check size={10} /> : <Copy size={10} />}
                        {isCopied ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}