'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'
import {
  Save, Loader, Check, Plus, Trash2,
  GripVertical, Eye, Copy,
} from 'lucide-react'

interface ProgramItem {
  time: string
  description: string
}

interface DrinkCategory {
  categoryName: string
  drinks: string[]
}

interface Event {
  id: string
  groom_name: string
  bride_name: string
  event_date: string
  event_time: string
  venue_name: string
  venue_address: string
  venue_lat: number
  venue_lng: number
  background_image_url: string
  invitation_text: string
  hero_message: string
  end_message: string
  theme_name: string
  rsvp_deadline: string
  drink_options_json: DrinkCategory[]
  program_json: ProgramItem[]
  theme_color_primary: string
  theme_color_secondary: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  whatsapp_transfer_allowed: boolean
}

interface Props {
  event: Event
}

type Tab = 'general' | 'content' | 'program' | 'drinks' | 'media' | 'rsvp' | 'apparence'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general',   label: 'Général' },
  { id: 'content',   label: 'Contenu' },
  { id: 'program',   label: 'Programme' },
  { id: 'drinks',    label: 'Boissons' },
  { id: 'media',     label: 'Médias' },
  { id: 'rsvp',      label: 'RSVP' },
  { id: 'apparence', label: 'Apparence' },
]

export default function SettingsClient({ event }: Props) {
  const router  = useRouter()
  const [tab, setTab]       = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // État formulaire
  const [form, setForm] = useState({
    groom_name:            event.groom_name,
    bride_name:            event.bride_name,
    event_date:            event.event_date?.split('T')[0] ?? '',
    event_time:            event.event_time ?? event.event_date?.split('T')[1]?.slice(0,5) ?? '19:00',
    venue_name:            event.venue_name,
    venue_address:         event.venue_address,
    venue_lat:             String(event.venue_lat),
    venue_lng:             String(event.venue_lng),
    background_image_url:  event.background_image_url,
    invitation_text:       event.invitation_text,
    hero_message:          event.hero_message ?? '',
    end_message:           event.end_message ?? '',
    theme_name:            event.theme_name ?? '',
    rsvp_deadline:         event.rsvp_deadline?.split('T')[0] ?? '',
    theme_color_primary:   event.theme_color_primary,
    theme_color_secondary: event.theme_color_secondary,
    status:                event.status,
    whatsapp_transfer_allowed: event.whatsapp_transfer_allowed,
  })

  const [program, setProgram] = useState<ProgramItem[]>(
    Array.isArray(event.program_json) ? event.program_json : []
  )

  const [drinks, setDrinks] = useState<DrinkCategory[]>(
    Array.isArray(event.drink_options_json) ? event.drink_options_json : []
  )

  const set = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const db       = supabase as any

      const eventDatetime = `${form.event_date}T${form.event_time}:00`
      const rsvpDeadline  = form.rsvp_deadline
        ? `${form.rsvp_deadline}T23:59:59`
        : null

      const { error: updateError } = await db
        .from('events')
        .update({
          groom_name:            form.groom_name.trim(),
          bride_name:            form.bride_name.trim(),
          event_date:            eventDatetime,
          event_time:            form.event_time,
          venue_name:            form.venue_name.trim(),
          venue_address:         form.venue_address.trim(),
          venue_lat:             parseFloat(form.venue_lat) || 0,
          venue_lng:             parseFloat(form.venue_lng) || 0,
          background_image_url:  form.background_image_url,
          invitation_text:       form.invitation_text.trim(),
          hero_message:          form.hero_message.trim(),
          end_message:           form.end_message.trim(),
          theme_name:            form.theme_name.trim(),
          rsvp_deadline:         rsvpDeadline,
          theme_color_primary:   form.theme_color_primary,
          theme_color_secondary: form.theme_color_secondary,
          status:                form.status,
          whatsapp_transfer_allowed: form.whatsapp_transfer_allowed,
          program_json:          program,
          drink_options_json:    drinks,
        })
        .eq('id', event.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '12px 16px',
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color:        'white',
    fontFamily:   'var(--font-body)',
    fontSize:     '0.9rem',
    outline:      'none',
    transition:   'border-color 0.2s ease',
  }

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontSize:      '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.4)',
    marginBottom:  '8px',
  }

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(201,169,110,0.5)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
  }

  // ── Programme ────────────────────────────────────────────
  const addProgramItem = () => {
    setProgram(prev => [...prev, { time: '', description: '' }])
  }

  const updateProgramItem = (idx: number, key: keyof ProgramItem, value: string) => {
    setProgram(prev => prev.map((item, i) =>
      i === idx ? { ...item, [key]: value } : item
    ))
  }

  const removeProgramItem = (idx: number) => {
    setProgram(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Boissons ─────────────────────────────────────────────
  const addCategory = () => {
    setDrinks(prev => [...prev, { categoryName: '', drinks: [] }])
  }

  const updateCategoryName = (ci: number, name: string) => {
    setDrinks(prev => prev.map((cat, i) =>
      i === ci ? { ...cat, categoryName: name } : cat
    ))
  }

  const removeCategory = (ci: number) => {
    setDrinks(prev => prev.filter((_, i) => i !== ci))
  }

  const addDrink = (ci: number) => {
    setDrinks(prev => prev.map((cat, i) =>
      i === ci ? { ...cat, drinks: [...cat.drinks, ''] } : cat
    ))
  }

  const updateDrink = (ci: number, di: number, value: string) => {
    setDrinks(prev => prev.map((cat, i) =>
      i === ci ? {
        ...cat,
        drinks: cat.drinks.map((d, j) => j === di ? value : d)
      } : cat
    ))
  }

  const removeDrink = (ci: number, di: number) => {
    setDrinks(prev => prev.map((cat, i) =>
      i === ci ? {
        ...cat,
        drinks: cat.drinks.filter((_, j) => j !== di)
      } : cat
    ))
  }

  // ── Preview / Duplicate ──────────────────────────────────
  const handlePreview = () => {
    window.open(`/invitation/demo-token-001`, '_blank')
  }

  const handleDuplicate = async () => {
    const supabase = createClient()
    const db       = supabase as any

    const { data: newEvent } = await db
      .from('events')
      .insert({
        ...event,
        id:         undefined,
        slug:       event.groom_name + '-' + event.bride_name + '-copy-' + Date.now(),
        groom_name: event.groom_name + ' (Copie)',
        status:     'draft',
        created_at: undefined,
        updated_at: undefined,
      })
      .select('id')
      .single()

    if (newEvent) {
      router.push('/admin/events/' + newEvent.id + '/settings')
    }
  }

  return (
    <div style={{ padding: '40px' }}>

      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        marginBottom:   '32px',
        flexWrap:       'wrap',
        gap:            '16px',
      }}>
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
            {form.groom_name} & {form.bride_name}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'white' }}>
            Paramètres
          </h1>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePreview}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              padding:      '10px 18px',
              borderRadius: '100px',
              border:       '1px solid rgba(255,255,255,0.1)',
              background:   'transparent',
              color:        'rgba(255,255,255,0.5)',
              fontSize:     '0.8rem',
              cursor:       'pointer',
            }}
          >
            <Eye size={14} /> Prévisualiser
          </button>

          <button
            onClick={handleDuplicate}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              padding:      '10px 18px',
              borderRadius: '100px',
              border:       '1px solid rgba(255,255,255,0.1)',
              background:   'transparent',
              color:        'rgba(255,255,255,0.5)',
              fontSize:     '0.8rem',
              cursor:       'pointer',
            }}
          >
            <Copy size={14} /> Dupliquer
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
              padding:      '12px 24px',
              borderRadius: '100px',
              border:       'none',
              background:   saved
                ? 'rgba(90,138,106,0.8)'
                : 'rgba(201,169,110,0.8)',
              color:        'white',
              fontSize:     '0.85rem',
              fontWeight:   500,
              cursor:       saving ? 'not-allowed' : 'pointer',
              transition:   'all 0.3s ease',
            }}
          >
            {saving ? (
              <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sauvegarde...</>
            ) : saved ? (
              <><Check size={15} /> Sauvegardé !</>
            ) : (
              <><Save size={15} /> Sauvegarder</>
            )}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{
        display:      'flex',
        gap:          '6px',
        marginBottom: '32px',
        flexWrap:     'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom:'16px',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding:      '8px 18px',
              borderRadius: '8px',
              border:       tab === t.id ? '1px solid rgba(201,169,110,0.4)' : '1px solid transparent',
              background:   tab === t.id ? 'rgba(201,169,110,0.1)' : 'transparent',
              color:        tab === t.id ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
              fontSize:     '0.82rem',
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          padding:      '14px 16px',
          background:   'rgba(184,80,96,0.1)',
          border:       '1px solid rgba(184,80,96,0.3)',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <p style={{ color: '#E89AA6', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* ── TAB: GÉNÉRAL ── */}
      {tab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nom du marié</label>
              <input style={inputStyle} value={form.groom_name} onChange={e => set('groom_name', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Nom de la mariée</label>
              <input style={inputStyle} value={form.bride_name} onChange={e => set('bride_name', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Date du mariage</label>
              <input type="date" style={inputStyle} value={form.event_date} onChange={e => set('event_date', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input type="time" style={inputStyle} value={form.event_time} onChange={e => set('event_time', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nom du lieu</label>
            <input style={inputStyle} value={form.venue_name} onChange={e => set('venue_name', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>Adresse</label>
            <input style={inputStyle} value={form.venue_address} onChange={e => set('venue_address', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Latitude GPS</label>
              <input style={inputStyle} value={form.venue_lat} onChange={e => set('venue_lat', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Longitude GPS</label>
              <input style={inputStyle} value={form.venue_lng} onChange={e => set('venue_lng', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Statut</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)} onFocus={focus} onBlur={blur}>
              <option value="draft">Brouillon</option>
              <option value="active">Publié (actif)</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>
      )}

      {/* ── TAB: CONTENU ── */}
      {tab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div>
            <label style={labelStyle}>Message Hero</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.hero_message}
              onChange={e => set('hero_message', e.target.value)}
              onFocus={focus} onBlur={blur}
            />
          </div>
          <div>
            <label style={labelStyle}>Texte principal de l&apos;invitation</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.invitation_text}
              onChange={e => set('invitation_text', e.target.value)}
              onFocus={focus} onBlur={blur}
            />
          </div>
          <div>
            <label style={labelStyle}>Thème</label>
            <input style={inputStyle} value={form.theme_name} onChange={e => set('theme_name', e.target.value)} onFocus={focus} onBlur={blur} placeholder="Ex: Noir & Or" />
          </div>
          <div>
            <label style={labelStyle}>Message de fin</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.end_message}
              onChange={e => set('end_message', e.target.value)}
              onFocus={focus} onBlur={blur}
            />
          </div>
        </div>
      )}

      {/* ── TAB: PROGRAMME ── */}
      {tab === 'program' && (
        <div style={{ maxWidth: '700px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Le programme apparaît automatiquement dans l&apos;invitation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {program.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display:      'grid',
                  gridTemplateColumns: '120px 1fr 40px',
                  gap:          '12px',
                  alignItems:   'center',
                  padding:      '16px',
                  background:   'rgba(255,255,255,0.03)',
                  border:       '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GripVertical size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  <input
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }}
                    value={item.time}
                    onChange={e => updateProgramItem(idx, 'time', e.target.value)}
                    placeholder="19h00"
                    onFocus={focus} onBlur={blur}
                  />
                </div>
                <input
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }}
                  value={item.description}
                  onChange={e => updateProgramItem(idx, 'description', e.target.value)}
                  placeholder="Description de l'activité"
                  onFocus={focus} onBlur={blur}
                />
                <button
                  onClick={() => removeProgramItem(idx)}
                  style={{
                    padding:      '8px',
                    borderRadius: '8px',
                    border:       '1px solid rgba(184,80,96,0.3)',
                    background:   'rgba(184,80,96,0.1)',
                    color:        '#E89AA6',
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addProgramItem}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
              padding:      '12px 20px',
              borderRadius: '100px',
              border:       '1px solid rgba(201,169,110,0.3)',
              background:   'rgba(201,169,110,0.05)',
              color:        'var(--gold-light)',
              fontSize:     '0.82rem',
              cursor:       'pointer',
            }}
          >
            <Plus size={14} /> Ajouter une étape
          </button>
        </div>
      )}

      {/* ── TAB: BOISSONS ── */}
      {tab === 'drinks' && (
        <div style={{ maxWidth: '700px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Les boissons apparaissent dans l&apos;invitation. Max 2 choix par invité.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '20px' }}>
            {drinks.map((cat, ci) => (
              <div
                key={ci}
                style={{
                  padding:      '20px',
                  background:   'rgba(255,255,255,0.02)',
                  border:       '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                }}
              >
                {/* Nom catégorie */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={cat.categoryName}
                    onChange={e => updateCategoryName(ci, e.target.value)}
                    placeholder="Ex: Boissons importées"
                    onFocus={focus} onBlur={blur}
                  />
                  <button
                    onClick={() => removeCategory(ci)}
                    style={{
                      padding:      '10px',
                      borderRadius: '8px',
                      border:       '1px solid rgba(184,80,96,0.3)',
                      background:   'rgba(184,80,96,0.1)',
                      color:        '#E89AA6',
                      cursor:       'pointer',
                      flexShrink:   0,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Boissons de la catégorie */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {cat.drinks.map((drink, di) => (
                    <div key={di} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        style={{ ...inputStyle, flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                        value={drink}
                        onChange={e => updateDrink(ci, di, e.target.value)}
                        placeholder="Nom de la boisson"
                        onFocus={focus} onBlur={blur}
                      />
                      <button
                        onClick={() => removeDrink(ci, di)}
                        style={{
                          padding:      '8px',
                          borderRadius: '8px',
                          border:       '1px solid rgba(255,255,255,0.08)',
                          background:   'transparent',
                          color:        'rgba(255,255,255,0.3)',
                          cursor:       'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addDrink(ci)}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '6px',
                    padding:      '8px 16px',
                    borderRadius: '100px',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    background:   'transparent',
                    color:        'rgba(255,255,255,0.4)',
                    fontSize:     '0.78rem',
                    cursor:       'pointer',
                  }}
                >
                  <Plus size={12} /> Ajouter une boisson
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCategory}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
              padding:      '12px 20px',
              borderRadius: '100px',
              border:       '1px solid rgba(201,169,110,0.3)',
              background:   'rgba(201,169,110,0.05)',
              color:        'var(--gold-light)',
              fontSize:     '0.82rem',
              cursor:       'pointer',
            }}
          >
            <Plus size={14} /> Ajouter une catégorie
          </button>
        </div>
      )}

      {/* ── TAB: MÉDIAS ── */}
      {tab === 'media' && (
        <div style={{ maxWidth: '700px' }}>
          <ImageUpload
            label="Photo de fond (image du couple)"
            currentUrl={form.background_image_url}
            onUpload={url => set('background_image_url', url)}
            aspectRatio="16/9"
          />
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginTop: '12px' }}>
            Cette image apparaît en arrière-plan fixe sur toute la page d&apos;invitation.
            Recommandé : photo du couple, format paysage, min 1920×1080px.
          </p>
        </div>
      )}

      {/* ── TAB: RSVP ── */}
      {tab === 'rsvp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div>
            <label style={labelStyle}>Date limite RSVP</label>
            <input
              type="date"
              style={inputStyle}
              value={form.rsvp_deadline}
              onChange={e => set('rsvp_deadline', e.target.value)}
              onFocus={focus} onBlur={blur}
            />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '6px' }}>
              Les invités ne pourront plus confirmer après cette date.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Transfert WhatsApp</label>
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '14px',
                padding:      '14px 16px',
                background:   'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                cursor:       'pointer',
                border:       '1px solid rgba(255,255,255,0.07)',
              }}
              onClick={() => set('whatsapp_transfer_allowed', !form.whatsapp_transfer_allowed)}
            >
              <div style={{
                width:          '20px',
                height:         '20px',
                borderRadius:   '6px',
                border:         form.whatsapp_transfer_allowed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                background:     form.whatsapp_transfer_allowed ? 'var(--gold)' : 'transparent',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}>
                {form.whatsapp_transfer_allowed && (
                  <span style={{ color: '#0D0B09', fontSize: '12px', fontWeight: 700 }}>✓</span>
                )}
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '0.85rem' }}>
                  Autoriser le transfert des invitations WhatsApp
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                  Si désactivé, un avertissement s&apos;affiche si le lien est ouvert depuis un autre appareil
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: APPARENCE ── */}
      {tab === 'apparence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Couleur principale</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={form.theme_color_primary}
                  onChange={e => set('theme_color_primary', e.target.value)}
                  style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.theme_color_primary}
                  onChange={e => set('theme_color_primary', e.target.value)}
                  onFocus={focus} onBlur={blur}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Couleur secondaire</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={form.theme_color_secondary}
                  onChange={e => set('theme_color_secondary', e.target.value)}
                  style={{ width: '48px', height: '48px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.theme_color_secondary}
                  onChange={e => set('theme_color_secondary', e.target.value)}
                  onFocus={focus} onBlur={blur}
                />
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div style={{
            padding:      '20px',
            borderRadius: '16px',
            background:   form.theme_color_primary + '15',
            border:       '1px solid ' + form.theme_color_primary + '40',
            textAlign:    'center',
          }}>
            <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem', color: form.theme_color_primary, marginBottom: '4px' }}>
              {form.groom_name} & {form.bride_name}
            </p>
            <p style={{ color: form.theme_color_secondary, fontSize: '0.85rem', opacity: 0.8 }}>
              Aperçu du thème couleur
            </p>
          </div>
        </div>
      )}

      {/* Bouton save fixe en bas */}
      <div style={{
        position:   'fixed',
        bottom:     '24px',
        right:      '24px',
        zIndex:     100,
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            padding:      '14px 28px',
            borderRadius: '100px',
            border:       'none',
            background:   saved
              ? 'rgba(90,138,106,0.9)'
              : 'rgba(201,169,110,0.9)',
            color:        'white',
            fontSize:     '0.88rem',
            fontWeight:   500,
            cursor:       saving ? 'not-allowed' : 'pointer',
            boxShadow:    '0 8px 32px rgba(0,0,0,0.4)',
            transition:   'all 0.3s ease',
          }}
        >
          {saving ? (
            <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sauvegarde...</>
          ) : saved ? (
            <><Check size={15} /> Sauvegardé !</>
          ) : (
            <><Save size={15} /> Sauvegarder</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}