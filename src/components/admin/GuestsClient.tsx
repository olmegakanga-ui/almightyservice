'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Search, Download, Copy, Printer,
  Pencil, Trash2, Link2, MessageCircle, X, Check,
  Users, UserCheck, UserX, Clock, Upload,
  ChevronUp, ChevronDown, AlertTriangle,
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
  venue_name?: string
}

interface Props {
  event:         Event
  initialGuests: Guest[]
  tables:        Table[]
}

type ModalMode = 'add' | 'edit' | null
type SortField = 'full_name' | 'table' | 'phone' | 'side' | 'is_couple' | 'rsvp'
type SortDir   = 'asc' | 'desc'
type MsgType   = 'INVITATION' | 'RELANCE' | 'RAPPEL_J1' | 'JOUR_J' | 'REPORT'

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

// ── Formatage date/heure ────────────────────────────────────
function formatEventDate(iso: string) {
  const d      = new Date(iso)
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  const time   = iso.includes('T') ? iso.split('T')[1].slice(0, 5).replace(':', 'h') : '19h00'
  return {
    full: `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    time,
  }
}

// ── Construction des messages WhatsApp ──────────────────────
function buildMessage(type: MsgType, guest: Guest, event: Event, origin: string): string {
  const url        = `${origin}/invitation/${guest.invitation_token}`
  const { full, time } = formatEventDate(event.event_date)
  const venue      = event.venue_name ?? ''
  const couple     = `${event.groom_name} & ${event.bride_name}`

  switch (type) {
    case 'INVITATION':
      return `*${guest.full_name}*\n\n` +
        `*${couple}* ont l'immense joie et l'honneur de vous convier aux festivités de leur mariage.\n\n` +
        `Date : *${full}* à *${time}*\n` +
        (venue ? `Lieu : *${venue}*\n\n` : '\n') +
        `Consultez votre invitation personnalisée et confirmez votre présence :\n${url}\n\n` +
        `- AlmightyService`

    case 'RELANCE':
      return `*${guest.full_name}*\n\n` +
        `Nous n'avons pas encore reçu votre confirmation pour le mariage de *${couple}*.\n\n` +
        `Le grand jour approche et nous aimerions vous compter parmi nous le *${full}* à *${time}*.\n` +
        (venue ? `Lieu : *${venue}*\n\n` : '\n') +
        `Confirmez votre présence via votre invitation :\n${url}\n\n` +
        `- AlmightyService`

    case 'RAPPEL_J1':
      return `*${guest.full_name}*\n\n` +
        `C'est demain ! Le mariage de *${couple}* a lieu le *${full}* à *${time}*.\n` +
        (venue ? `Lieu : *${venue}*\n\n` : '\n') +
        `Retrouvez tous les détails et votre QR code d'entrée sur votre invitation :\n${url}\n\n` +
        `- AlmightyService`

    case 'JOUR_J':
      return `*${guest.full_name}*\n\n` +
        `C'est aujourd'hui ! *${couple}* vous accueillent avec joie et bonheur.\n\n` +
        `Rendez-vous à *${time}*.\n` +
        (venue ? `Lieu : *${venue}*\n\n` : '\n') +
        `Votre QR code d'entrée se trouve sur votre invitation :\n${url}\n\n` +
        `- AlmightyService`

    case 'REPORT':
      return `Cher(e) *${guest.full_name}*,\n\n` +
        `Nous vous informons avec regret que le mariage de *${couple}*, prévu le *${full}*, est malheureusement reporté à une date ultérieure.\n\n` +
        `La nouvelle date vous sera communiquée très prochainement.\n\n` +
        `Merci infiniment de votre compréhension.\n\n` +
        `— *AlmightyService*`
  }
}

const MSG_MENU: { type: MsgType; label: string; desc: string; color: string }[] = [
  { type: 'INVITATION', label: 'Invitation',  desc: 'Envoi initial',           color: '#25D366' },
  { type: 'RELANCE',    label: 'Relance',     desc: 'Non-confirmés uniquement', color: 'var(--gold-light)' },
  { type: 'RAPPEL_J1',  label: 'Rappel J-1',  desc: 'La veille du mariage',    color: '#9DB4F5' },
  { type: 'JOUR_J',     label: 'Message Jour J', desc: 'Le matin du mariage',  color: '#FFB6C1' },
  
]

// ── MENU WHATSAPP PAR INVITÉ ────────────────────────────────
function WhatsAppMenu({
  guest, event, onClose,
}: {
  guest:   Guest
  event:   Event
  onClose: () => void
}) {
  const rsvpStatus = guest.rsvp_responses?.status ?? 'pending'
  const isPending  = rsvpStatus === 'pending'

  const send = (type: MsgType) => {
    const text  = encodeURIComponent(buildMessage(type, guest, event, window.location.origin))
    const phone = guest.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
    onClose()
  }

  return (
    <>
      {/* Overlay de fermeture */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 50 }}
        onClick={onClose}
      />

      {/* Menu */}
      <div style={{
        position:     'absolute',
        top:          '100%',
        right:        0,
        marginTop:    '6px',
        width:        '230px',
        background:   '#141210',
        border:       '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        boxShadow:    '0 12px 40px rgba(0,0,0,0.6)',
        zIndex:       60,
        overflow:     'hidden',
        textAlign:    'left',
      }}>
        <p style={{
          padding:       '10px 14px',
          fontSize:      '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.3)',
          borderBottom:  '1px solid rgba(255,255,255,0.06)',
        }}>
          Envoyer via WhatsApp
        </p>

        {MSG_MENU.map(item => {
          // La relance ne concerne que les invités n'ayant pas confirmé
          const disabled = item.type === 'RELANCE' && !isPending

          return (
            <button
              key={item.type}
              onClick={() => !disabled && send(item.type)}
              disabled={disabled}
              style={{
                display:    'block',
                width:      '100%',
                padding:    '10px 14px',
                background: 'transparent',
                border:     'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                textAlign:  'left',
                cursor:     disabled ? 'not-allowed' : 'pointer',
                opacity:    disabled ? 0.35 : 1,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <p style={{ color: disabled ? 'rgba(255,255,255,0.4)' : item.color, fontSize: '0.82rem', marginBottom: '2px' }}>
                {item.label}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.68rem' }}>
                {disabled ? `Déjà ${RSVP_LABEL[rsvpStatus].toLowerCase()}` : item.desc}
              </p>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── MODAL INVITÉ ────────────────────────────────────────────
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
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

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

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Check size={14} />
              {loading ? 'Sauvegarde...' : mode === 'add' ? 'Ajouter' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MODAL REPORT (envoi en masse) ───────────────────────────
function ReportModal({
  event, guests, onClose,
}: {
  event:   Event
  guests:  Guest[]
  onClose: () => void
}) {
  const withPhone             = guests.filter(g => g.phone && g.phone.length >= 8)
  const [sent, setSent]       = useState(0)
  const [started, setStarted] = useState(false)

  const handleSend = () => {
    setStarted(true)
    withPhone.forEach((guest, i) => {
      setTimeout(() => {
        const text  = encodeURIComponent(buildMessage('REPORT', guest, event, window.location.origin))
        const phone = guest.phone.replace(/[^0-9]/g, '')
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
        setSent(s => s + 1)
      }, i * 1500)
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', paddingTop: '5vh', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: '480px', background: '#141210', border: '1px solid rgba(232,154,166,0.3)', borderRadius: '24px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(232,154,166,0.1)', border: '1px solid rgba(232,154,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={16} color="#E89AA6" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, color: 'white' }}>
              Report du mariage
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
            Aperçu du message
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {guests[0]
              ? buildMessage('REPORT', { ...guests[0], full_name: "[Nom de l'invité]" }, event, '')
              : ''}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'white', lineHeight: 1 }}>{guests.length}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Total invités</p>
          </div>
          <div style={{ padding: '14px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#25D366', lineHeight: 1 }}>{withPhone.length}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Avec téléphone</p>
          </div>
        </div>

        {started && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Ouverture des conversations...</p>
              <p style={{ fontSize: '0.75rem', color: '#25D366' }}>{sent} / {withPhone.length}</p>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: withPhone.length > 0 ? (sent / withPhone.length * 100) + '%' : '0%', background: '#25D366', borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
              Chaque conversation s&apos;ouvre toutes les 1.5s — envoyez manuellement dans chaque fenêtre WhatsApp.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          {!started ? (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={withPhone.length === 0}
                style={{ flex: 2, padding: '14px', borderRadius: '100px', border: '1px solid rgba(232,154,166,0.4)', background: 'rgba(232,154,166,0.1)', color: '#E89AA6', fontFamily: 'var(--font-body)', fontSize: '0.78rem', cursor: withPhone.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: withPhone.length === 0 ? 0.4 : 1 }}
              >
                <MessageCircle size={14} />
                Envoyer à {withPhone.length} invité{withPhone.length > 1 ? 's' : ''}
              </button>
            </>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.4)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={14} /> Terminé
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ─────────────────────────────────────────
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
  const [showReport, setShowReport]       = useState(false)
  const [openMenuId, setOpenMenuId]       = useState<string | null>(null)

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
        case 'full_name': va = a.full_name;                           vb = b.full_name; break
        case 'table':     va = a.guest_tables?.name ?? '';            vb = b.guest_tables?.name ?? ''; break
        case 'phone':     va = a.phone;                               vb = b.phone; break
        case 'side':      va = a.side;                                vb = b.side; break
        case 'is_couple': va = a.is_couple ? '1' : '0';              vb = b.is_couple ? '1' : '0'; break
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

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(window.location.origin + '/invitation/' + token)
  }

  const exportCSV = () => {
    const headers = ['Nom','Téléphone','Table','Côté','Couple','Personnes','Statut RSVP','Étiquette','Lien invitation']
    const rows    = filtered.map(g => [
      g.full_name, g.phone, g.guest_tables?.name ?? '', g.side,
      g.is_couple ? 'Oui' : 'Non', g.is_couple ? '2' : '1',
      RSVP_LABEL[g.rsvp_responses?.status ?? 'pending'], g.label ?? '',
      window.location.origin + '/invitation/' + g.invitation_token,
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
            Côté Marié — {event.groom_name}
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
            Côté Mariée — {event.bride_name}
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
              {f === 'ALL' ? 'Tous' : f === 'HOMME' ? 'Marié' : 'Mariée'}
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
          <button onClick={() => setShowReport(true)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(232,154,166,0.4)', background: 'rgba(232,154,166,0.08)', color: '#E89AA6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            <AlertTriangle size={13} /> Report mariage
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
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
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
                  const menuOpen   = openMenuId === guest.id

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
                          {guest.side === 'HOMME' ? 'Marié' : 'Mariée'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: guest.is_couple ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                          {guest.is_couple ? 'Couple (2)' : 'Solo (1)'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: RSVP_COLOR[rsvpStatus], fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: RSVP_COLOR[rsvpStatus], flexShrink: 0 }} />
                          {RSVP_LABEL[rsvpStatus]}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{guest.label || '—'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center', overflow: 'visible' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', position: 'relative' }}>

                          {/* Copier lien */}
                          <button onClick={() => copyLink(guest.invitation_token)} title="Copier le lien"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                            <Link2 size={13} />
                          </button>

                          {/* Menu WhatsApp */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => hasPhone && setOpenMenuId(menuOpen ? null : guest.id)}
                              disabled={!hasPhone}
                              title={hasPhone ? 'Envoyer un message WhatsApp' : 'Numéro manquant'}
                              style={{
                                padding:      '6px 10px',
                                borderRadius: '6px',
                                border:       hasPhone ? '1px solid rgba(37,211,102,0.35)' : '1px solid rgba(255,255,255,0.05)',
                                background:   menuOpen ? 'rgba(37,211,102,0.2)' : hasPhone ? 'rgba(37,211,102,0.08)' : 'transparent',
                                color:        hasPhone ? '#25D366' : 'rgba(255,255,255,0.15)',
                                cursor:       hasPhone ? 'pointer' : 'not-allowed',
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '4px',
                              }}
                            >
                              <MessageCircle size={13} />
                              <ChevronDown size={10} />
                            </button>

                            {menuOpen && hasPhone && (
                              <WhatsAppMenu
                                guest={guest}
                                event={event}
                                onClose={() => setOpenMenuId(null)}
                              />
                            )}
                          </div>

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

      {/* Modals */}
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

      {showReport && (
        <ReportModal
          event={event}
          guests={guests}
          onClose={() => setShowReport(false)}
        />
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1 }} onClick={() => setDeleteConfirm(null)} />
      )}
    </div>
  )
}