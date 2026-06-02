'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Search, Download, Copy, Printer,
  Pencil, Trash2, Link2, MessageCircle, X, Check,
  Users, UserCheck, UserX, Clock, Upload,
  ChevronUp, ChevronDown, Loader,
} from 'lucide-react'
import ImportGuestsModal from '@/components/admin/ImportGuestsModal'

interface Guest {
  id:               string
  full_name:        string
  phone:            string
  is_couple:        boolean
  side:             'HOMME' | 'FEMME'
  label:            string
  invitation_token: string
  table_id:         string | null
  guest_tables:     { name: string; category: string } | null
  rsvp_responses:   { status: string } | null
}

interface Table {
  id:       string
  name:     string
  side:     'HOMME' | 'FEMME'
  category: string
  capacity: number
}

interface Event {
  id:         string
  groom_name: string
  bride_name: string
  event_date: string
}

interface Props {
  event:         Event
  initialGuests: Guest[]
  tables:        Table[]
}

type ModalMode = 'add' | 'edit' | null
type SortField = 'full_name' | 'table' | 'phone' | 'side' | 'is_couple' | 'rsvp'
type SortDir   = 'asc' | 'desc'

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

const countPersons = (list: Guest[]) =>
  list.reduce((acc, g) => acc + (g.is_couple ? 2 : 1), 0)

// ── MODAL ─────────────────────────────────────────────────
function GuestModal({
  mode, guest, tables, eventId, onClose, onSuccess,
}: {
  mode:      ModalMode
  guest?:    Guest
  tables:    Table[]
  eventId:   string
  onClose:   () => void
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
  const [loading, setLoading]   = useState(false)
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [waSent, setWaSent]     = useState(false)

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const db       = supabase as any
    let result

    if (mode === 'add') {
      result = await db.from('guests').insert({
        event_id:  eventId,
        full_name: form.full_name.trim(),
        phone:     form.phone.trim(),
        table_id:  form.table_id || null,
        is_couple: form.is_couple,
        side:      form.side,
        label:     form.label.trim(),
      })
    } else {
      result = await db.from('guests').update({
        full_name: form.full_name.trim(),
        phone:     form.phone.trim(),
        table_id:  form.table_id || null,
        is_couple: form.is_couple,
        side:      form.side,
        label:     form.label.trim(),
      }).eq('id', guest!.id)
    }

    if (result.error) { setError(result.error.message); setLoading(false); return }
    setLoading(false)
    onSuccess()
  }

  const handleSendWhatsApp = async () => {
    if (!guest?.phone || !guest?.invitation_token) {
      setError('Numéro de téléphone requis')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res  = await fetch('/api/whatsapp/send-bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          eventId,
          messageType: 'INVITATION',
          guestIds:    [guest.id],
        }),
      })
      const data = await res.json()
      if (data.sent > 0) {
        setWaSent(true)
      } else {
        setError('Échec envoi: ' + (data.errors?.[0] ?? 'Erreur inconnue'))
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'white', fontFamily: 'var(--font-body)',
    fontSize: '0.88rem', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#141210', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '24px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
            {mode === 'add' ? 'Nouvel invité' : "Modifier l'invité"}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nom complet *</label>
            <input style={inputStyle} value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Ex: Benjamin Awuya"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label style={labelStyle}>Téléphone WhatsApp</label>
            <input style={inputStyle} value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="243810000001"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label style={labelStyle}>Table</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.table_id}
              onChange={e => setForm(p => ({ ...p, table_id: e.target.value }))}>
              <option value="">— Aucune table —</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.side}) — {t.category}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Invité côté de</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.side}
                onChange={e => setForm(p => ({ ...p, side: e.target.value as 'HOMME' | 'FEMME' }))}>
                <option value="HOMME">Marié (Homme)</option>
                <option value="FEMME">Mariée (Femme)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Est en couple ?</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.is_couple ? 'oui' : 'non'}
                onChange={e => setForm(p => ({ ...p, is_couple: e.target.value === 'oui' }))}>
                <option value="non">Non (1 personne)</option>
                <option value="oui">Oui (2 personnes)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Étiquette</label>
            <input style={inputStyle} value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex: Famille, Collègue, Ami..."
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }} />
          </div>

          {error && (
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {waSent && (
            <p style={{ color: '#7EC89A', fontSize: '0.82rem', padding: '10px', background: 'rgba(90,138,106,0.1)', borderRadius: '8px' }}>
              ✓ Invitation WhatsApp envoyée !
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Check size={14} />
              {loading ? 'Sauvegarde...' : mode === 'add' ? 'Ajouter' : 'Modifier'}
            </button>

            {mode === 'edit' && guest?.phone && (
              <button
                onClick={handleSendWhatsApp}
                disabled={sending || waSent}
                title="Envoyer l'invitation WhatsApp"
                style={{
                  padding:        '14px 18px',
                  borderRadius:   '100px',
                  border:         waSent ? '1px solid rgba(90,138,106,0.4)' : '1px solid rgba(37,211,102,0.4)',
                  background:     waSent ? 'rgba(90,138,106,0.1)' : 'rgba(37,211,102,0.1)',
                  color:          waSent ? '#7EC89A' : '#25D366',
                  fontFamily:     'var(--font-body)',
                  fontSize:       '0.78rem',
                  cursor:         sending || waSent ? 'not-allowed' : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '6px',
                  opacity:        sending ? 0.6 : 1,
                }}
              >
                {sending
                  ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <MessageCircle size={14} />
                }
                {waSent ? '✓' : 'WA'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ───────────────────────────────────────
export default function GuestsClient({ event, initialGuests, tables }: Props) {
  const [guests, setGuests]               = useState<Guest[]>(initialGuests)
  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState<'ALL' | 'HOMME' | 'FEMME'>('ALL')
  const [modalMode, setModalMode]         = useState<ModalMode>(null)
  const [editingGuest, setEditingGuest]   = useState<Guest | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showImport, setShowImport]       = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [sortField, setSortField]         = useState<SortField>('full_name')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [sendingWa, setSendingWa]         = useState<string | null>(null)

  const total      = countPersons(guests)
  const confirmed  = countPersons(guests.filter(g => g.rsvp_responses?.status === 'confirmed'))
  const declined   = countPersons(guests.filter(g => g.rsvp_responses?.status === 'declined'))
  const pending    = total - confirmed - declined
  const totalHomme = countPersons(guests.filter(g => g.side === 'HOMME'))
  const totalFemme = countPersons(guests.filter(g => g.side === 'FEMME'))
  const confHomme  = countPersons(guests.filter(g => g.side === 'HOMME' && g.rsvp_responses?.status === 'confirmed'))
  const confFemme  = countPersons(guests.filter(g => g.side === 'FEMME' && g.rsvp_responses?.status === 'confirmed'))
  const declHomme  = countPersons(guests.filter(g => g.side === 'HOMME' && g.rsvp_responses?.status === 'declined'))
  const declFemme  = countPersons(guests.filter(g => g.side === 'FEMME' && g.rsvp_responses?.status === 'declined'))

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={11} style={{ opacity: 0.2 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={11} style={{ color: 'var(--gold)' }} />
      : <ChevronDown size={11} style={{ color: 'var(--gold)' }} />
  }

  const filtered = useMemo(() => {
    let list = guests.filter(g => {
      const matchFilter = filter === 'ALL' || g.side === filter
      const q           = search.toLowerCase()
      const matchSearch = !q
        || g.full_name.toLowerCase().includes(q)
        || g.phone.includes(q)
        || (g.guest_tables?.name ?? '').toLowerCase().includes(q)
        || (g.label ?? '').toLowerCase().includes(q)
      return matchFilter && matchSearch
    })

    list = [...list].sort((a, b) => {
      let va = '', vb = ''
      switch (sortField) {
        case 'full_name': va = a.full_name;                            vb = b.full_name; break
        case 'table':     va = a.guest_tables?.name ?? '';             vb = b.guest_tables?.name ?? ''; break
        case 'phone':     va = a.phone;                                vb = b.phone; break
        case 'side':      va = a.side;                                 vb = b.side; break
        case 'is_couple': va = a.is_couple ? '1' : '0';               vb = b.is_couple ? '1' : '0'; break
        case 'rsvp':      va = a.rsvp_responses?.status ?? 'pending'; vb = b.rsvp_responses?.status ?? 'pending'; break
      }
      const cmp = va.localeCompare(vb)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [guests, search, filter, sortField, sortDir])

  const filteredPersons = countPersons(filtered)

  const reload = async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('guests')
      .select('*, guest_tables(name,category), rsvp_responses(status)')
      .eq('event_id', event.id)
      .order('full_name', { ascending: true })
    if (data) setGuests(data)
  }

  const handleDelete = async (guestId: string) => {
    setDeleting(true)
    try {
      const supabase  = createClient()
      const { error } = await (supabase as any).from('guests').delete().eq('id', guestId)
      if (error) { alert('Erreur: ' + error.message) } else { await reload() }
    } catch (err) { console.error(err) }
    finally { setDeleting(false); setDeleteConfirm(null) }
  }

  // Envoyer WhatsApp à un invité depuis le tableau
  const handleSendWa = async (guest: Guest) => {
    if (!guest.phone || guest.phone.length < 8) {
      alert('Numéro de téléphone manquant pour ' + guest.full_name)
      return
    }
    setSendingWa(guest.id)
    try {
      const res  = await fetch('/api/whatsapp/send-bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          eventId:     event.id,
          messageType: 'INVITATION',
          guestIds:    [guest.id],
        }),
      })
      const data = await res.json()
      if (data.sent > 0) {
        alert('✓ Invitation envoyée à ' + guest.full_name)
      } else {
        alert('Échec: ' + (data.errors?.[0] ?? 'Erreur inconnue'))
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setSendingWa(null)
    }
  }

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(window.location.origin + '/invitation/' + token)
  }

  const exportCSV = () => {
    const headers = ['Nom','Téléphone','Table','Côté','Couple','Personnes','Statut RSVP','Étiquette']
    const rows    = filtered.map(g => [
      g.full_name, g.phone, g.guest_tables?.name ?? '', g.side,
      g.is_couple ? 'Oui' : 'Non', g.is_couple ? '2' : '1',
      RSVP_LABEL[g.rsvp_responses?.status ?? 'pending'], g.label ?? '',
    ])
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = 'invites-' + event.groom_name + '-' + event.bride_name + '.csv'
    a.click()
  }

  const cellStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap',
  }

  const thBtn = (field: SortField, label: string) => (
    <button onClick={() => handleSort(field)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: sortField === field ? 'var(--gold-light)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: 0, whiteSpace: 'nowrap' }}>
      {label} <SortIcon field={field} />
    </button>
  )

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
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: '4px' }}>
          {guests.length} entrée{guests.length > 1 ? 's' : ''} · <span style={{ color: 'var(--gold-light)' }}>{total} personne{total > 1 ? 's' : ''}</span> au total (couples comptés × 2)
        </p>
      </div>

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { icon: Users,     label: 'Personnes',  value: total,     color: 'rgba(255,255,255,0.7)' },
          { icon: UserCheck, label: 'Confirmées', value: confirmed, color: '#7EC89A' },
          { icon: UserX,     label: 'Déclinées',  value: declined,  color: '#E89AA6' },
          { icon: Clock,     label: 'En attente', value: pending,   color: 'rgba(201,169,110,0.8)' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <stat.icon size={18} color={stat.color} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.1em' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stats par côté */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'rgba(100,149,237,0.05)', border: '1px solid rgba(100,149,237,0.15)', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9DB4F5', marginBottom: '12px' }}>
            ♂ Côté Marié — {event.groom_name}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Personnes',  value: totalHomme },
              { label: 'Confirmées', value: confHomme },
              { label: 'En attente', value: totalHomme - confHomme - declHomme },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#9DB4F5', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: totalHomme > 0 ? (confHomme / totalHomme * 100) + '%' : '0%', background: '#9DB4F5', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: '0.65rem', color: 'rgba(157,180,245,0.5)', marginTop: '4px' }}>
            {totalHomme > 0 ? Math.round(confHomme / totalHomme * 100) : 0}% confirmés
          </p>
        </div>

        <div style={{ padding: '20px', background: 'rgba(255,182,193,0.05)', border: '1px solid rgba(255,182,193,0.15)', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#FFB6C1', marginBottom: '12px' }}>
            ♀ Côté Mariée — {event.bride_name}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Personnes',  value: totalFemme },
              { label: 'Confirmées', value: confFemme },
              { label: 'En attente', value: totalFemme - confFemme - declFemme },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#FFB6C1', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: totalFemme > 0 ? (confFemme / totalFemme * 100) + '%' : '0%', background: '#FFB6C1', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,182,193,0.5)', marginTop: '4px' }}>
            {totalFemme > 0 ? Math.round(confFemme / totalFemme * 100) : 0}% confirmés
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher nom, téléphone, table..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'HOMME', 'FEMME'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', border: filter === f ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)', background: filter === f ? 'rgba(201,169,110,0.1)' : 'transparent', color: filter === f ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {f === 'ALL' ? 'Tous' : f === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button onClick={() => navigator.clipboard.writeText(filtered.map(g => g.full_name).join('\n'))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <Copy size={13} /> Copier
          </button>
          <button onClick={exportCSV}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <Download size={13} /> CSV
          </button>
          <button onClick={() => window.print()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
            <Printer size={13} /> Print
          </button>
          <button onClick={() => setShowImport(true)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <Upload size={14} /> Importer CSV
          </button>
          <button onClick={() => { setEditingGuest(undefined); setModalMode('add') }}
            style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <Plus size={15} /> Ajouter un invité
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('full_name', 'Nom')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('table', 'Table')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('phone', 'Téléphone')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('side', 'Côté')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('is_couple', 'Format')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>{thBtn('rsvp', 'Statut RSVP')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Étiquette</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...cellStyle, textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)' }}>
                    {search || filter !== 'ALL' ? 'Aucun invité trouvé' : 'Aucun invité — importez une liste ou ajoutez manuellement'}
                  </td>
                </tr>
              ) : (
                filtered.map(guest => {
                  const rsvpStatus = guest.rsvp_responses?.status ?? 'pending'
                  const isConfirm  = deleteConfirm === guest.id
                  const hasPhone   = guest.phone && guest.phone.length >= 8
                  const isWaSending = sendingWa === guest.id
                  return (
                    <tr key={guest.id}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={cellStyle}>
                        <div>
                          <span style={{ color: 'white', fontWeight: 500 }}>{guest.full_name}</span>
                          {guest.is_couple && (
                            <span style={{ display: 'block', fontSize: '0.68rem', color: 'rgba(201,169,110,0.6)', marginTop: '1px' }}>× 2 personnes</span>
                          )}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        {guest.guest_tables?.name
                          ? <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontSize: '0.78rem' }}>{guest.guest_tables.name}</span>
                          : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>—</span>}
                      </td>
                      <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>{guest.phone || '—'}</td>
                      <td style={cellStyle}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', letterSpacing: '0.1em', background: guest.side === 'HOMME' ? 'rgba(100,149,237,0.1)' : 'rgba(255,182,193,0.1)', color: guest.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1' }}>
                          {guest.side === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: guest.is_couple ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                          {guest.is_couple ? '👫 Couple (2)' : '👤 Solo (1)'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: RSVP_COLOR[rsvpStatus], fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: RSVP_COLOR[rsvpStatus], flexShrink: 0 }} />
                          {RSVP_LABEL[rsvpStatus]}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{guest.label || '—'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                          {/* Copier lien */}
                          <button onClick={() => copyLink(guest.invitation_token)} title="Copier le lien"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                            <Link2 size={13} />
                          </button>

                          {/* WhatsApp — actif si numéro disponible */}
                          <button
                            onClick={() => hasPhone && handleSendWa(guest)}
                            disabled={!hasPhone || isWaSending}
                            title={hasPhone ? 'Envoyer invitation WhatsApp' : 'Numéro manquant'}
                            style={{
                              padding:      '6px',
                              borderRadius: '6px',
                              border:       hasPhone ? '1px solid rgba(37,211,102,0.3)' : '1px solid rgba(255,255,255,0.05)',
                              background:   'transparent',
                              color:        hasPhone ? '#25D366' : 'rgba(255,255,255,0.15)',
                              cursor:       hasPhone && !isWaSending ? 'pointer' : 'not-allowed',
                              opacity:      isWaSending ? 0.6 : 1,
                            }}
                          >
                            {isWaSending
                              ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                              : <MessageCircle size={13} />
                            }
                          </button>

                          {/* Modifier */}
                          <button onClick={() => { setEditingGuest(guest); setModalMode('edit') }} title="Modifier"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                            <Pencil size={13} />
                          </button>

                          {/* Supprimer */}
                          {isConfirm ? (
                            <button onClick={e => { e.stopPropagation(); handleDelete(guest.id) }} disabled={deleting}
                              style={{ position: 'relative', zIndex: 20, padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(184,80,96,0.5)', background: 'rgba(184,80,96,0.2)', color: '#E89AA6', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 500 }}>
                              {deleting ? '...' : 'Confirmer'}
                            </button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setDeleteConfirm(guest.id) }} title="Supprimer"
                              style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
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

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''} · <span style={{ color: 'rgba(255,255,255,0.4)' }}>{filteredPersons} personne{filteredPersons > 1 ? 's' : ''}</span>
            {filtered.length !== guests.length && ' (filtrées sur ' + guests.length + ')'}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
            Trié par {sortField === 'full_name' ? 'nom' : sortField === 'table' ? 'table' : sortField === 'phone' ? 'téléphone' : sortField === 'side' ? 'côté' : sortField === 'is_couple' ? 'format' : 'statut'} {sortDir === 'asc' ? '↑' : '↓'}
          </p>
        </div>
      </div>

      {modalMode && (
        <GuestModal mode={modalMode} guest={editingGuest} tables={tables} eventId={event.id}
          onClose={() => { setModalMode(null); setEditingGuest(undefined) }}
          onSuccess={async () => { setModalMode(null); setEditingGuest(undefined); await reload() }} />
      )}

      {showImport && (
        <ImportGuestsModal eventId={event.id} tables={tables}
          onClose={() => setShowImport(false)}
          onSuccess={async () => { setShowImport(false); await reload() }} />
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1 }} onClick={() => setDeleteConfirm(null)} />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}