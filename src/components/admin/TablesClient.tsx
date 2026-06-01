'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Search, X, Check, Pencil, Trash2,
  Users, Copy, Download, Printer,
} from 'lucide-react'

interface Table {
  id:       string
  name:     string
  capacity: number
  category: 'VIP' | 'FAMILLE' | 'AMIS' | 'AUTRES'
  side:     'HOMME' | 'FEMME'
  event_id: string
}

interface Guest {
  id:             string
  full_name:      string
  table_id:       string | null
  side:           string
  rsvp_responses: { status: string } | null
}

interface Event {
  id:         string
  groom_name: string
  bride_name: string
}

interface Props {
  event:         Event
  initialTables: Table[]
  guests:        Guest[]
}

type ModalMode = 'add' | 'edit' | null

const CATEGORY_COLOR: Record<string, string> = {
  VIP:     'rgba(201,169,110,0.15)',
  FAMILLE: 'rgba(100,149,237,0.1)',
  AMIS:    'rgba(90,138,106,0.1)',
  AUTRES:  'rgba(255,255,255,0.06)',
}

const RSVP_COLOR: Record<string, string> = {
  confirmed: '#7EC89A',
  declined:  '#E89AA6',
  pending:   'rgba(255,255,255,0.5)',
}

// ── MODAL ─────────────────────────────────────────────────
function TableModal({
  mode, table, eventId, onClose, onSuccess,
}: {
  mode:      ModalMode
  table?:    Table
  eventId:   string
  onClose:   () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name:     table?.name ?? '',
    capacity: table?.capacity ?? 10,
    category: table?.category ?? 'FAMILLE' as Table['category'],
    side:     table?.side ?? 'HOMME' as 'HOMME' | 'FEMME',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    let result

    if (mode === 'add') {
      result = await supabase.from('guest_tables').insert({
        event_id: eventId,
        name:     form.name.trim(),
        capacity: form.capacity,
        category: form.category,
        side:     form.side,
      })
    } else {
      result = await supabase.from('guest_tables').update({
        name:     form.name.trim(),
        capacity: form.capacity,
        category: form.category,
        side:     form.side,
      }).eq('id', table!.id)
    }

    if (result.error) { setError(result.error.message); setLoading(false); return }
    setLoading(false)
    onSuccess()
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

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontSize:      '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.35)',
    marginBottom:  '6px',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: '440px', background: '#141210', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
            {mode === 'add' ? 'Nouvelle table' : 'Modifier la table'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nom de la table *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Table VIP"
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Nombre de chaises (capacité)</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={50}
              value={form.capacity}
              onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
              onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Catégorie</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as Table['category'] }))}
              >
                <option value="VIP">VIP</option>
                <option value="FAMILLE">Famille</option>
                <option value="AMIS">Amis</option>
                <option value="AUTRES">Autres</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Table côté de</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.side}
                onChange={e => setForm(p => ({ ...p, side: e.target.value as 'HOMME' | 'FEMME' }))}
              >
                <option value="HOMME">Marié (Homme)</option>
                <option value="FEMME">Mariée (Femme)</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: '#E89AA6', fontSize: '0.82rem', padding: '10px', background: 'rgba(184,80,96,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop:      '8px',
              padding:        '14px',
              borderRadius:   '100px',
              border:         '1px solid rgba(201,169,110,0.5)',
              background:     'rgba(201,169,110,0.1)',
              color:          'var(--gold-light)',
              fontFamily:     'var(--font-body)',
              fontSize:       '0.78rem',
              letterSpacing:  '0.15em',
              textTransform:  'uppercase',
              cursor:         loading ? 'not-allowed' : 'pointer',
              opacity:        loading ? 0.6 : 1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
            }}
          >
            <Check size={14} />
            {loading ? 'Sauvegarde...' : mode === 'add' ? 'Ajouter la table' : 'Modifier la table'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DRAWER INVITÉS ────────────────────────────────────────
function GuestsDrawer({ table, guests, onClose }: {
  table:   Table
  guests:  Guest[]
  onClose: () => void
}) {
  const tableGuests = guests.filter(g => g.table_id === table.id)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '380px', height: '100vh', background: '#141210', borderLeft: '1px solid rgba(201,169,110,0.15)', padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'white' }}>
              {table.name}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
              {tableGuests.length} / {table.capacity} invités
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{
            height:     '100%',
            width:      Math.min(100, (tableGuests.length / table.capacity) * 100) + '%',
            background: tableGuests.length >= table.capacity ? '#E89AA6' : 'var(--gold)',
            borderRadius:'2px',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {tableGuests.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>
            Aucun invité assigné à cette table
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tableGuests.map(guest => {
              const status = guest.rsvp_responses?.status ?? 'pending'
              return (
                <div key={guest.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: RSVP_COLOR[status], fontSize: '0.88rem' }}>
                    {guest.full_name}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: RSVP_COLOR[status] }}>
                    {status === 'confirmed' ? '✓' : status === 'declined' ? '✗' : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PAGE PRINCIPALE ───────────────────────────────────────
export default function TablesClient({ event, initialTables, guests }: Props) {
  const [tables, setTables]             = useState<Table[]>(initialTables)
  const [search, setSearch]             = useState('')
  const [sideFilter, setSideFilter]     = useState<'ALL' | 'HOMME' | 'FEMME'>('ALL')
  const [modalMode, setModalMode]       = useState<ModalMode>(null)
  const [editingTable, setEditingTable] = useState<Table | undefined>()
  const [drawerTable, setDrawerTable]   = useState<Table | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const filtered = useMemo(() => {
    return tables.filter(t => {
      const matchSide   = sideFilter === 'ALL' || t.side === sideFilter
      const q           = search.toLowerCase()
      const matchSearch = !q
        || t.name.toLowerCase().includes(q)
        || t.category.toLowerCase().includes(q)
        || guests.some(g => g.table_id === t.id && g.full_name.toLowerCase().includes(q))
      return matchSide && matchSearch
    })
  }, [tables, search, sideFilter, guests])

  const reload = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('guest_tables')
      .select('*')
      .eq('event_id', event.id)
      .order('name', { ascending: true })
    if (data) setTables(data)
  }

  const handleDelete = async (tableId: string) => {
    setDeleting(true)
    try {
      const supabase      = createClient()
      const { error }     = await supabase
        .from('guest_tables')
        .delete()
        .eq('id', tableId)

      if (error) {
        alert('Erreur suppression: ' + error.message)
      } else {
        await reload()
      }
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const exportCSV = () => {
    const headers = ['Nom','Côté','Catégorie','Capacité','Invités','Taux remplissage']
    const rows    = filtered.map(t => {
      const count = guests.filter(g => g.table_id === t.id).length
      return [t.name, t.side, t.category, t.capacity, count, Math.round((count / t.capacity) * 100) + '%']
    })
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = 'tables-' + event.groom_name + '-' + event.bride_name + '.csv'
    a.click()
  }

  const thStyle: React.CSSProperties = {
    padding:       '12px 16px',
    fontSize:      '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.3)',
    textAlign:     'left',
    borderBottom:  '1px solid rgba(255,255,255,0.08)',
    whiteSpace:    'nowrap',
  }

  const cellStyle: React.CSSProperties = {
    padding:      '14px 16px',
    fontSize:     '0.85rem',
    color:        'rgba(255,255,255,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace:   'nowrap',
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          {event.groom_name} & {event.bride_name}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
          Gestion des tables
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Total tables',  value: tables.length,                                  color: 'rgba(255,255,255,0.7)' },
          { label: 'Côté Marié',   value: tables.filter(t => t.side === 'HOMME').length,   color: '#9DB4F5' },
          { label: 'Côté Mariée',  value: tables.filter(t => t.side === 'FEMME').length,   color: '#FFB6C1' },
          { label: 'Total invités', value: guests.length,                                  color: 'rgba(201,169,110,0.8)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.1em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Résumé Homme / Femme */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {(['HOMME', 'FEMME'] as const).map(side => {
          const sideTables = tables.filter(t => t.side === side)
          const sideGuests = guests.filter(g => g.side === side)
          return (
            <div key={side} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: side === 'HOMME' ? '#9DB4F5' : '#FFB6C1', marginBottom: '12px' }}>
                Côté {side === 'HOMME' ? 'Marié' : 'Mariée'} — {sideTables.length} table{sideTables.length > 1 ? 's' : ''} · {sideGuests.length} invités
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sideTables.map(t => {
                  const count = guests.filter(g => g.table_id === t.id).length
                  return (
                    <div
                      key={t.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: CATEGORY_COLOR[t.category], cursor: 'pointer' }}
                      onClick={() => setDrawerTable(t)}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{t.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>{t.category}</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: count >= t.capacity ? '#E89AA6' : 'var(--gold)', fontFamily: 'var(--font-display)', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }}>
                        {count}/{t.capacity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher table, catégorie, invité..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'HOMME', 'FEMME'] as const).map(f => (
            <button key={f} onClick={() => setSideFilter(f)} style={{ padding: '8px 14px', borderRadius: '8px', border: sideFilter === f ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)', background: sideFilter === f ? 'rgba(201,169,110,0.1)' : 'transparent', color: sideFilter === f ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer' }}>
              {f === 'ALL' ? 'Tous' : f === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button onClick={() => navigator.clipboard.writeText(filtered.map(t => t.name).join('\n'))}
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
          <button
            onClick={() => { setEditingTable(undefined); setModalMode('add') }}
            style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.1)', color: 'var(--gold-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Plus size={15} /> Ajouter une table
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nom de la table</th>
                <th style={thStyle}>Côté</th>
                <th style={thStyle}>Catégorie</th>
                <th style={thStyle}>Invités / Capacité</th>
                <th style={thStyle}>Remplissage</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...cellStyle, textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.2)' }}>
                    Aucune table trouvée
                  </td>
                </tr>
              ) : (
                filtered.map(table => {
                  const count    = guests.filter(g => g.table_id === table.id).length
                  const pct      = Math.min(100, Math.round((count / table.capacity) * 100))
                  const isFull   = count >= table.capacity
                  const isConfirm = deleteConfirm === table.id
                  return (
                    <tr key={table.id}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td style={cellStyle}>
                        <button onClick={() => setDrawerTable(table)} style={{ background: 'none', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          {table.name}
                        </button>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '6px', background: table.side === 'HOMME' ? 'rgba(100,149,237,0.1)' : 'rgba(255,182,193,0.1)', color: table.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1' }}>
                          {table.side === 'HOMME' ? '♂ Marié' : '♀ Mariée'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '6px', background: CATEGORY_COLOR[table.category], color: 'rgba(255,255,255,0.7)' }}>
                          {table.category}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <button onClick={() => setDrawerTable(table)} style={{ background: 'none', border: 'none', color: isFull ? '#E89AA6' : 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1rem', padding: 0 }}>
                          {count}/{table.capacity}
                        </button>
                      </td>
                      <td style={{ ...cellStyle, minWidth: '140px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: isFull ? '#E89AA6' : 'var(--gold)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', minWidth: '32px' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                          <button
                            onClick={() => { setEditingTable(table); setModalMode('edit') }}
                            title="Modifier"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                          >
                            <Pencil size={13} />
                          </button>
                          {isConfirm ? (
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(table.id) }}
                              disabled={deleting}
                              style={{ position: 'relative', zIndex: 20, padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(184,80,96,0.5)', background: 'rgba(184,80,96,0.2)', color: '#E89AA6', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 500 }}
                            >
                              {deleting ? '...' : 'Confirmer'}
                            </button>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); setDeleteConfirm(table.id) }}
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
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            {filtered.length} table{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <TableModal
          mode={modalMode}
          table={editingTable}
          eventId={event.id}
          onClose={() => { setModalMode(null); setEditingTable(undefined) }}
          onSuccess={async () => { setModalMode(null); setEditingTable(undefined); await reload() }}
        />
      )}

      {/* Drawer */}
      {drawerTable && (
        <GuestsDrawer
          table={drawerTable}
          guests={guests}
          onClose={() => setDrawerTable(null)}
        />
      )}

      {/* Overlay fermeture confirmation */}
      {deleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1 }}
          onClick={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}