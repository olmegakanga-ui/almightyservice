'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Search, Download, Copy, Printer,
  Pencil, Trash2, Link2, MessageCircle, X, Check,
  Users, UserCheck, UserX, Clock,
} from 'lucide-react'

interface Guest {
  id: string
  full_name: string
  phone: string
  is_couple: boolean
  side: 'HOMME' | 'FEMME'
  label: string
  invitation_token: string
  table_id: string | null
  guest_tables: { name: string; category: string } | null
  rsvp_responses: { status: string } | null
}

interface Table {
  id: string
  name: string
  side: 'HOMME' | 'FEMME'
  category: string
  capacity: number
}

interface Event {
  id: string
  groom_name: string
  bride_name: string
  event_date: string
}

interface Props {
  event: Event
  initialGuests: Guest[]
  tables: Table[]
}

type ModalMode = 'add' | 'edit' | null

const RSVP_COLOR: Record<string, string> = {
  confirmed: '#7EC89A',
  declined:  '#E89AA6',
  pending:   'rgba(255,255,255,0.4)',
}

const RSVP_LABEL: Record<string, string> = {
  confirmed: 'Confirmé',
  declined:  'Décliné',
  pending:   'En attente',
}

// ── MODAL COMPONENT ──────────────────────────────────────────
function GuestModal({
  mode,
  guest,
  tables,
  eventId,
  onClose,
  onSuccess,
}: {
  mode: ModalMode
  guest?: Guest
  tables: Table[]
  eventId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    full_name: guest?.full_name ?? '',
    phone:     guest?.phone ?? '',
    table_id:  guest?.table_id ?? '',
    is_couple: guest?.is_couple ?? false,
    side:      guest?.side ?? 'HOMME' as 'HOMME' | 'FEMME',
    label:     guest?.label ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (sendWa = false) => {
    if (!form.full_name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    let result

    if (mode === 'add') {
      result = await supabase.from('guests').insert({
        event_id:  eventId,
        full_name: form.full_name.trim(),
        phone:     form.phone.trim(),
        table_id:  form.table_id || null,
        is_couple: form.is_couple,
        side:      form.side,
        label:     form.label.trim(),
      })
    } else {
      result = await supabase.from('guests').update({
        full_name: form.full_name.trim(),
        phone:     form.phone.trim(),
        table_id:  form.table_id || null,
        is_couple: form.is_couple,
        side:      form.side,
        label:     form.label.trim(),
      }).eq('id', guest!.id)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    if (sendWa) {
      alert('WhatsApp — bientôt disponible !')
    }

    setLoading(false)
    onSuccess()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '6px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#141210',
          border: '1px solid rgba(201,169,110,0.2)',
          borderRadius: '24px',
          padding: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
            {mode === 'add' ? 'Nouvel invité' : 'Modifier l\'invité'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Nom */}
          <div>
            <label style={labelStyle}>Nom complet *</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Ex: Benjamin Awuya"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label style={labelStyle}>Téléphone WhatsApp</label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="243810000001"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Table */}
          <div>
            <label style={labelStyle}>Table</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.table_id}
              onChange={e => setForm(p => ({ ...p, table_id: e.target.value }))}
            >
              <option value="">— Aucune table —</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.side}) — {t.category}
                </option>
              ))}
            </select>
          </div>

          {/* Côté + Couple */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Invité côté de</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.side}
                onChange={e => setForm(p => ({ ...p, side: e.target.value as 'HOMME' | 'FEMME' }))}
              >
                <option value="HOMME">Marié (Homme)</option>
                <option value="FEMME">Mariée (Femme)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Est en couple ?</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.is_couple ? 'oui' : 'non'}
                onChange={e => setForm(p => ({ ...p, is_couple: e.target.value === 'oui' }))}
              >
                <option value="non">Non (1 personne)</option>
                <option value="oui">Oui (2 personnes)</option>
              </select>
            </div>
          </div>

          {/* Étiquette */}
          <div>
            <label style={labelStyle}>Étiquette</label>
            <input
              style={inputStyle}
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex: Famille, Collègue, Ami..."
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {error && (
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '100px',
                border: '1px solid rgba(201,169,110,0.5)',
                background: 'rgba(201,169,110,0.1)',
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              {loading ? 'Sauvegarde...' : mode === 'add' ? 'Ajouter' : 'Modifier'}
            </button>

            <button
              disabled
              title="Bientôt disponible"
              style={{
                padding: '14px 20px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────
export default function GuestsClient({ event, initialGuests, tables }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'HOMME' | 'FEMME'>('ALL')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Stats
  const total     = guests.length
  const confirmed = guests.filter(g => g.rsvp_responses?.status === 'confirmed').length
  const declined  = guests.filter(g => g.rsvp_responses?.status === 'declined').length
  const pending   = total - confirmed - declined

  // Filtrage + recherche
  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchFilter = filter === 'ALL' || g.side === filter
      const q = search.toLowerCase()
      const matchSearch = !q
        || g.full_name.toLowerCase().includes(q)
        || g.phone.includes(q)
        || (g.guest_tables?.name ?? '').toLowerCase().includes(q)
        || (g.label ?? '').toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [guests, search, filter])

  const reload = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .select('*, guest_tables(name,category), rsvp_responses(status)')
      .eq('event_id', event.id)
      .order('full_name', { ascending: true })
    if (data) setGuests(data)
  }

  const handleDelete = async (guestId: string) => {
    const supabase = createClient()
    await supabase.from('guests').delete().eq('id', guestId)
    setDeleteConfirm(null)
    await reload()
  }

  const copyLink = (token: string) => {
    const url = window.location.origin + '/invitation/' + token
    navigator.clipboard.writeText(url)
  }

  const exportCSV = () => {
    const headers = ['Nom','Téléphone','Table','Côté','Couple','Statut RSVP','Étiquette']
    const rows = filtered.map(g => [
      g.full_name,
      g.phone,
      g.guest_tables?.name ?? '',
      g.side,
      g.is_couple ? 'Oui' : 'Non',
      RSVP_LABEL[g.rsvp_responses?.status ?? 'pending'],
      g.label ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invites-' + event.groom_name + '-' + event.bride_name + '.csv'
    a.click()
  }

  const cellStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
  }

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Gestion des invités
        </h1>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { icon: Users,     label: 'Total',      value: total,     color: 'rgba(255,255,255,0.7)' },
          { icon: UserCheck, label: 'Confirmés',  value: confirmed, color: '#7EC89A' },
          { icon: UserX,     label: 'Déclinés',   value: declined,  color: '#E89AA6' },
          { icon: Clock,     label: 'En attente', value: pending,   color: 'rgba(201,169,110,0.8)' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
            }}
          >
            <stat.icon size={18} color={stat.color} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.1em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Recherche */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher nom, téléphone, table..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'HOMME', 'FEMME'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: filter === f ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: filter === f ? 'rgba(201,169,110,0.1)' : 'transparent',
                color: filter === f ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {f === 'ALL' ? 'Tous' : f === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
            </button>
          ))}
        </div>

        {/* Export + Ajouter */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button
            onClick={() => navigator.clipboard.writeText(filtered.map(g => g.full_name).join('\n'))}
            title="Copier les noms"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
          >
            <Copy size={13} /> Copier
          </button>
          <button
            onClick={exportCSV}
            title="Exporter CSV"
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
          >
            <Printer size={13} /> Print
          </button>

          <button
            onClick={() => { setEditingGuest(undefined); setModalMode('add') }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(201,169,110,0.5)',
              background: 'rgba(201,169,110,0.1)',
              color: 'var(--gold-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
            }}
          >
            <Plus size={15} /> Ajouter un invité
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Table</th>
                <th style={thStyle}>Téléphone</th>
                <th style={thStyle}>Côté</th>
                <th style={thStyle}>Format</th>
                <th style={thStyle}>Statut RSVP</th>
                <th style={thStyle}>Étiquette</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...cellStyle, textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)' }}>
                    Aucun invité trouvé
                  </td>
                </tr>
              ) : (
                filtered.map(guest => {
                  const rsvpStatus = guest.rsvp_responses?.status ?? 'pending'
                  return (
                    <tr key={guest.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={cellStyle}>
                        <span style={{ color: 'white', fontWeight: 500 }}>{guest.full_name}</span>
                      </td>
                      <td style={cellStyle}>
                        {guest.guest_tables?.name
                          ? <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontSize: '0.78rem' }}>
                              {guest.guest_tables.name}
                            </span>
                          : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>—</span>
                        }
                      </td>
                      <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>
                        {guest.phone || '—'}
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          letterSpacing: '0.1em',
                          background: guest.side === 'HOMME' ? 'rgba(100,149,237,0.1)' : 'rgba(255,182,193,0.1)',
                          color: guest.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1',
                        }}>
                          {guest.side === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                          {guest.is_couple ? '👫 Couple' : '👤 Solo'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          color: RSVP_COLOR[rsvpStatus],
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: RSVP_COLOR[rsvpStatus],
                            flexShrink: 0,
                          }} />
                          {RSVP_LABEL[rsvpStatus]}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                        {guest.label || '—'}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {/* Copier lien */}
                          <button
                            onClick={() => copyLink(guest.invitation_token)}
                            title="Copier le lien d'invitation"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                          >
                            <Link2 size={13} />
                          </button>
                          {/* WhatsApp (bientôt) */}
                          <button
                            disabled
                            title="WhatsApp — bientôt"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'rgba(255,255,255,0.15)', cursor: 'not-allowed' }}
                          >
                            <MessageCircle size={13} />
                          </button>
                          {/* Modifier */}
                          <button
                            onClick={() => { setEditingGuest(guest); setModalMode('edit') }}
                            title="Modifier"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                          >
                            <Pencil size={13} />
                          </button>
                          {/* Supprimer */}
                          {deleteConfirm === guest.id ? (
                            <button
                              onClick={() => handleDelete(guest.id)}
                              title="Confirmer suppression"
                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(184,80,96,0.4)', background: 'rgba(184,80,96,0.15)', color: '#E89AA6', cursor: 'pointer', fontSize: '0.72rem' }}
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(guest.id)}
                              title="Supprimer"
                              style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tableau */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            {filtered.length} invité{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {filtered.length !== total && ' sur ' + total}
          </p>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <GuestModal
          mode={modalMode}
          guest={editingGuest}
          tables={tables}
          eventId={event.id}
          onClose={() => { setModalMode(null); setEditingGuest(undefined) }}
          onSuccess={async () => {
            setModalMode(null)
            setEditingGuest(undefined)
            await reload()
          }}
        />
      )}

      {/* Click outside delete confirm */}
      {deleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5 }}
          onClick={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}