'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'
import GalleryUpload from '@/components/admin/GalleryUpload'
import { parseEventDate } from '@/lib/date-utils'
import {
  Save, Loader, Check, Plus, Trash2,
  GripVertical, Eye, Copy,
} from 'lucide-react'

interface ProgramItem {
  time:        string
  description: string
}

interface DrinkCategory {
  categoryName: string
  drinks:       string[]
}

interface Event {
  id:                        string
  groom_name:                string
  bride_name:                string
  event_date:                string
  event_time:                string
  venue_name:                string
  venue_address:             string
  venue_lat:                 number
  venue_lng:                 number
  background_image_url:      string
  invitation_text:           string
  hero_message:              string
  end_message:               string
  theme_name:                string
  dress_code?:               string
  dress_colors?:             string[]
  rsvp_deadline:             string
  drink_options_json:        DrinkCategory[]
  program_json:              ProgramItem[]
  theme_color_primary:       string
  theme_color_secondary:     string
  status:                    'draft' | 'active' | 'completed' | 'archived'
  whatsapp_transfer_allowed: boolean
  groom_phone?:              string
  bride_phone?:              string
  music_url?:                string
  music_volume?:             number
  gift_options?:             string[]
  sections_order?:           string[]
  gallery_images?:           string[]
}

interface Props {
  event: Event
}

type Tab = 'general' | 'content' | 'program' | 'drinks' | 'media' | 'rsvp' | 'apparence' | 'extras' | 'sections'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general',   label: 'Général' },
  { id: 'content',   label: 'Contenu' },
  { id: 'program',   label: 'Programme' },
  { id: 'drinks',    label: 'Boissons' },
  { id: 'media',     label: 'Médias' },
  { id: 'rsvp',      label: 'RSVP' },
  { id: 'apparence', label: 'Apparence' },
  { id: 'extras',    label: 'Musique & Cadeaux' },
  { id: 'sections',  label: 'Sections' },
]

const DEFAULT_SECTIONS = ['countdown','card','rsvp','qrcode','drinks','guestbook','gift','map','dresscode','gallery']

const SECTION_LABELS: Record<string, string> = {
  countdown: 'Compte à rebours',
  card:      'Carte d\'invitation',
  rsvp:      'RSVP — Confirmation',
  qrcode:    'QR Code d\'entrée',
  drinks:    'Choix des boissons',
  guestbook: 'Livre d\'or',
  gift:      'Type de cadeau',
  map:       'Carte & Plan',
  dresscode: 'Dress code',
  gallery:   'Galerie photo',
}

const SECTION_HINTS: Record<string, string> = {
  countdown: 'Décompte jusqu\'au jour J',
  card:      'Le carton avec le programme de la journée',
  rsvp:      'Boutons Confirmer / Décliner',
  qrcode:    'Code d\'entrée à scanner au contrôle',
  drinks:    'L\'invité choisit jusqu\'à 2 boissons',
  guestbook: 'Message des invités aux mariés',
  gift:      'Enveloppe ou présent',
  map:       'Localisation et itinéraire',
  dresscode: 'Tenue et couleurs suggérées',
  gallery:   'Album de photos du couple — se remplit dans l\'onglet Médias',
}

export default function SettingsClient({ event }: Props) {
  const router              = useRouter()
  const [tab, setTab]       = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    groom_name:                event.groom_name,
    bride_name:                event.bride_name,
    event_date:                event.event_date?.split('T')[0] ?? '',
    event_time:                event.event_time ?? event.event_date?.split('T')[1]?.slice(0, 5) ?? '19:00',
    venue_name:                event.venue_name,
    venue_address:             event.venue_address,
    venue_lat:                 String(event.venue_lat),
    venue_lng:                 String(event.venue_lng),
    background_image_url:      event.background_image_url,
    invitation_text:           event.invitation_text,
    hero_message:              event.hero_message ?? '',
    end_message:               event.end_message ?? '',
    dress_code:                event.dress_code ?? '',
    dress_colors:              event.dress_colors ?? [],
    rsvp_deadline:             event.rsvp_deadline?.split('T')[0] ?? '',
    theme_color_primary:       event.theme_color_primary,
    theme_color_secondary:     event.theme_color_secondary,
    status:                    event.status,
    whatsapp_transfer_allowed: event.whatsapp_transfer_allowed,
    groom_phone:               event.groom_phone  ?? '',
    bride_phone:               event.bride_phone  ?? '',
    music_url:                 event.music_url    ?? '',
    music_volume:              event.music_volume ?? 30,
    gift_options:              event.gift_options    ?? ['envelope','present'],
    sections_order:            Array.isArray(event.sections_order) ? event.sections_order : DEFAULT_SECTIONS,
    gallery_images:            Array.isArray(event.gallery_images) ? event.gallery_images : [],
  })

  const [program, setProgram] = useState<ProgramItem[]>(
    Array.isArray(event.program_json) ? event.program_json : []
  )
  const [drinks, setDrinks] = useState<DrinkCategory[]>(
    Array.isArray(event.drink_options_json) ? event.drink_options_json : []
  )

  const set = (key: string, value: string | boolean | number | string[]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const supabase      = createClient()
      const db            = supabase as any
      const eventDatetime = `${form.event_date}T${form.event_time}:00`
      const rsvpDeadline  = form.rsvp_deadline ? `${form.rsvp_deadline}T23:59:59` : null

      const { error: updateError } = await db
        .from('events')
        .update({
          groom_name:                form.groom_name.trim(),
          bride_name:                form.bride_name.trim(),
          event_date:                eventDatetime,
          event_time:                form.event_time,
          venue_name:                form.venue_name.trim(),
          venue_address:             form.venue_address.trim(),
          venue_lat:                 parseFloat(form.venue_lat) || 0,
          venue_lng:                 parseFloat(form.venue_lng) || 0,
          background_image_url:      form.background_image_url,
          invitation_text:           form.invitation_text.trim(),
          hero_message:              form.hero_message.trim(),
          end_message:               form.end_message.trim(),
          dress_code:                form.dress_code.trim() || null,
          dress_colors:              form.dress_colors,
          rsvp_deadline:             rsvpDeadline,
          theme_color_primary:       form.theme_color_primary,
          theme_color_secondary:     form.theme_color_secondary,
          status:                    form.status,
          whatsapp_transfer_allowed: form.whatsapp_transfer_allowed,
          program_json:              program,
          drink_options_json:        drinks,
          groom_phone:               form.groom_phone.trim(),
          bride_phone:               form.bride_phone.trim(),
          music_url:                 form.music_url.trim() || null,
          music_volume:              Number(form.music_volume),
          gift_options:              form.gift_options,
          sections_order:            form.sections_order,
          gallery_images:            form.gallery_images,
        })
        .eq('id', event.id)

      if (updateError) { setError(updateError.message); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    const supabase = createClient()
    const { data: firstGuest } = await (supabase as any)
      .from('guests').select('invitation_token')
      .eq('event_id', event.id).not('invitation_token', 'is', null)
      .limit(1).single()
    if (firstGuest?.invitation_token) {
      window.open('/invitation/' + firstGuest.invitation_token, '_blank')
    } else {
      alert("Aucun invité trouvé. Ajoutez d'abord un invité.")
    }
  }

  const handleDuplicate = async () => {
    const supabase = createClient()
    const db       = supabase as any
    const { data: newEvent } = await db.from('events').insert({
      slug:                      event.groom_name + '-' + event.bride_name + '-copy-' + Date.now(),
      groom_name:                event.groom_name + ' (Copie)',
      bride_name:                event.bride_name,
      event_date:                event.event_date,
      event_time:                event.event_time,
      venue_name:                event.venue_name,
      venue_address:             event.venue_address,
      venue_lat:                 event.venue_lat,
      venue_lng:                 event.venue_lng,
      background_image_url:      event.background_image_url,
      invitation_text:           event.invitation_text,
      hero_message:              event.hero_message,
      end_message:               event.end_message,
      dress_code:                event.dress_code ?? null,
      dress_colors:              event.dress_colors ?? [],
      rsvp_deadline:             event.rsvp_deadline,
      theme_color_primary:       event.theme_color_primary,
      theme_color_secondary:     event.theme_color_secondary,
      status:                    'draft',
      program_json:              event.program_json,
      drink_options_json:        event.drink_options_json,
      whatsapp_transfer_allowed: event.whatsapp_transfer_allowed,
      groom_phone:               event.groom_phone  ?? '',
      bride_phone:               event.bride_phone  ?? '',
      music_url:                 event.music_url    ?? null,
      music_volume:              event.music_volume ?? 30,
      gift_options:              event.gift_options   ?? ['envelope','present'],
      sections_order:            Array.isArray(event.sections_order) ? event.sections_order : DEFAULT_SECTIONS,
      gallery_images:            Array.isArray(event.gallery_images) ? event.gallery_images : [],
    }).select('id').single()
    if (newEvent) router.push('/admin/events/' + newEvent.id + '/settings')
  }

  // Programme
  const addProgramItem    = () => setProgram(prev => [...prev, { time: '', description: '' }])
  const updateProgramItem = (idx: number, key: keyof ProgramItem, value: string) =>
    setProgram(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item))
  const removeProgramItem = (idx: number) => setProgram(prev => prev.filter((_, i) => i !== idx))

  // Boissons
  const addCategory        = () => setDrinks(prev => [...prev, { categoryName: '', drinks: [] }])
  const updateCategoryName = (ci: number, name: string) =>
    setDrinks(prev => prev.map((cat, i) => i === ci ? { ...cat, categoryName: name } : cat))
  const removeCategory     = (ci: number) => setDrinks(prev => prev.filter((_, i) => i !== ci))
  const addDrink           = (ci: number) =>
    setDrinks(prev => prev.map((cat, i) => i === ci ? { ...cat, drinks: [...cat.drinks, ''] } : cat))
  const updateDrink        = (ci: number, di: number, value: string) =>
    setDrinks(prev => prev.map((cat, i) => i === ci ? { ...cat, drinks: cat.drinks.map((d, j) => j === di ? value : d) } : cat))
  const removeDrink        = (ci: number, di: number) =>
    setDrinks(prev => prev.map((cat, i) => i === ci ? { ...cat, drinks: cat.drinks.filter((_, j) => j !== di) } : cat))

  // Sections — ordre
  const activeSections   = form.sections_order as string[]
  const inactiveSections = DEFAULT_SECTIONS.filter(s => !activeSections.includes(s))

  const moveSectionUp = (idx: number) => {
    if (idx === 0) return
    const arr = [...activeSections]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    set('sections_order', arr)
  }
  const moveSectionDown = (idx: number) => {
    const arr = [...activeSections]
    if (idx === arr.length - 1) return
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    set('sections_order', arr)
  }

  // Sections — activation / désactivation
  const disableSection = (key: string) =>
    set('sections_order', activeSections.filter(s => s !== key))
  const enableSection  = (key: string) =>
    set('sections_order', [...activeSections, key])

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', color: 'white', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
  }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    { e.target.style.borderColor = 'rgba(201,169,110,0.5)' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  const SaveButton = ({ fixed = false }: { fixed?: boolean }) => (
    <button onClick={handleSave} disabled={saving} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: fixed ? '14px 28px' : '12px 24px',
      borderRadius: '100px', border: 'none',
      background: saved ? 'rgba(90,138,106,0.9)' : 'rgba(201,169,110,0.9)',
      color: 'white', fontSize: fixed ? '0.88rem' : '0.85rem', fontWeight: 500,
      cursor: saving ? 'not-allowed' : 'pointer',
      boxShadow: fixed ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      transition: 'all 0.3s ease', whiteSpace: 'nowrap',
    }}>
      {saving ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sauvegarde...</>
        : saved ? <><Check size={15} /> Sauvegardé !</>
        : <><Save size={15} /> Sauvegarder</>}
    </button>
  )

  return (
    <div className="admin-page">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
            {form.groom_name} &amp; {form.bride_name}
          </p>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'white', lineHeight: 1.15 }}>
            Paramètres
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handlePreview} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Eye size={14} /> Prévisualiser
          </button>
          <button onClick={handleDuplicate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Copy size={14} /> Dupliquer
          </button>
          <SaveButton />
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 18px', borderRadius: '8px', border: tab === t.id ? '1px solid rgba(201,169,110,0.4)' : '1px solid transparent', background: tab === t.id ? 'rgba(201,169,110,0.1)' : 'transparent', color: tab === t.id ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '14px 16px', background: 'rgba(184,80,96,0.1)', border: '1px solid rgba(184,80,96,0.3)', borderRadius: '12px', marginBottom: '24px' }}>
          <p style={{ color: '#E89AA6', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* ── GÉNÉRAL ── */}
      {tab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div className="duo-grid">
            <div>
              <label style={labelStyle}>Nom du marié</label>
              <input style={inputStyle} value={form.groom_name} onChange={e => set('groom_name', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Nom de la mariée</label>
              <input style={inputStyle} value={form.bride_name} onChange={e => set('bride_name', e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div className="duo-grid">
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
          <div className="duo-grid">
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
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '6px' }}>
              En brouillon, les invitations ne sont pas accessibles
            </p>
          </div>
        </div>
      )}

      {/* ── CONTENU ── */}
      {tab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          <div>
            <label style={labelStyle}>Message Hero</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }} value={form.hero_message} onChange={e => set('hero_message', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>Texte principal de l&apos;invitation</label>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginBottom: '6px' }}>
              Utilisez Entrée pour créer des paragraphes — ils seront respectés sur l&apos;invitation.
            </p>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '140px', lineHeight: 1.8 }} value={form.invitation_text} onChange={e => set('invitation_text', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>Dress code</label>
            <input style={inputStyle} value={form.dress_code} onChange={e => set('dress_code', e.target.value)} placeholder="Ex : Tenue de soirée, Chic décontracté" onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>Couleurs suggérées</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              {(form.dress_colors as string[]).map((color, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={e => {
                      const next = [...(form.dress_colors as string[])]
                      next[idx] = e.target.value
                      set('dress_colors', next)
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                  />
                  <button
                    onClick={() => set('dress_colors', (form.dress_colors as string[]).filter((_, i) => i !== idx))}
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(184,80,96,0.3)', background: 'rgba(184,80,96,0.1)', color: '#E89AA6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => set('dress_colors', [...(form.dress_colors as string[]), '#C9A96E'])}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.05)', color: 'var(--gold-light)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              <Plus size={13} /> Ajouter une couleur
            </button>
          </div>
          <div>
            <label style={labelStyle}>Message de fin</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }} value={form.end_message} onChange={e => set('end_message', e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
        </div>
      )}

      {/* ── PROGRAMME ── */}
      {tab === 'program' && (
        <div style={{ maxWidth: '700px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Le programme apparaît automatiquement dans l&apos;invitation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {program.map((item, idx) => (
              <div key={idx} className="program-row" style={{ alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <GripVertical size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  <input style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }} value={item.time} onChange={e => updateProgramItem(idx, 'time', e.target.value)} placeholder="19h00" onFocus={focus} onBlur={blur} />
                </div>
                <input style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem' }} value={item.description} onChange={e => updateProgramItem(idx, 'description', e.target.value)} placeholder="Description de l'activité" onFocus={focus} onBlur={blur} />
                <button onClick={() => removeProgramItem(idx)} style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '8px', border: '1px solid rgba(184,80,96,0.3)', background: 'rgba(184,80,96,0.1)', color: '#E89AA6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addProgramItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.05)', color: 'var(--gold-light)', fontSize: '0.82rem', cursor: 'pointer' }}>
            <Plus size={14} /> Ajouter une étape
          </button>
        </div>
      )}

      {/* ── BOISSONS ── */}
      {tab === 'drinks' && (
        <div style={{ maxWidth: '700px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Les boissons apparaissent dans l&apos;invitation. Max 2 choix par invité.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '20px' }}>
            {drinks.map((cat, ci) => (
              <div key={ci} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={cat.categoryName} onChange={e => updateCategoryName(ci, e.target.value)} placeholder="Ex: Boissons importées" onFocus={focus} onBlur={blur} />
                  <button onClick={() => removeCategory(ci)} style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '8px', border: '1px solid rgba(184,80,96,0.3)', background: 'rgba(184,80,96,0.1)', color: '#E89AA6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {cat.drinks.map((drink, di) => (
                    <div key={di} style={{ display: 'flex', gap: '8px' }}>
                      <input style={{ ...inputStyle, flex: 1, minWidth: 0, padding: '10px 14px', fontSize: '0.85rem' }} value={drink} onChange={e => updateDrink(ci, di, e.target.value)} placeholder="Nom de la boisson" onFocus={focus} onBlur={blur} />
                      <button onClick={() => removeDrink(ci, di)} style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addDrink(ci)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <Plus size={12} /> Ajouter une boisson
                </button>
              </div>
            ))}
          </div>
          <button onClick={addCategory} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.05)', color: 'var(--gold-light)', fontSize: '0.82rem', cursor: 'pointer' }}>
            <Plus size={14} /> Ajouter une catégorie
          </button>
        </div>
      )}

      {/* ── MÉDIAS ── */}
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

          {/* Galerie photo */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <GalleryUpload
              label="Galerie photo du couple"
              images={form.gallery_images as string[]}
              onChange={urls => set('gallery_images', urls)}
              max={12}
            />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', marginTop: '14px', lineHeight: 1.6 }}>
              Ces photos s&apos;affichent dans la section Galerie de l&apos;invitation, sous forme de carrousel.
              Format portrait recommandé. Pensez à activer la section Galerie depuis l&apos;onglet Sections.
            </p>
            {(form.gallery_images as string[]).length > 0 && !activeSections.includes('gallery') && (
              <p style={{ color: '#E89AA6', fontSize: '0.78rem', marginTop: '10px', padding: '12px 14px', background: 'rgba(184,80,96,0.08)', border: '1px solid rgba(184,80,96,0.2)', borderRadius: '10px' }}>
                La section Galerie est désactivée — ces photos ne sont pas visibles par les invités.
                Activez-la depuis l&apos;onglet Sections.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── RSVP ── */}
      {tab === 'rsvp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          {!activeSections.includes('rsvp') && (
            <div style={{ padding: '14px 16px', background: 'rgba(232,154,166,0.08)', border: '1px solid rgba(232,154,166,0.25)', borderRadius: '12px' }}>
              <p style={{ color: '#E89AA6', fontSize: '0.82rem' }}>
                La section RSVP est actuellement désactivée pour ce mariage — les invités ne verront pas les boutons de confirmation.
                Réactivez-la depuis l&apos;onglet Sections.
              </p>
            </div>
          )}
          <div>
            <label style={labelStyle}>Date limite RSVP</label>
            <input type="date" style={inputStyle} value={form.rsvp_deadline} onChange={e => set('rsvp_deadline', e.target.value)} onFocus={focus} onBlur={blur} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '6px' }}>
              Les invités ne pourront plus confirmer après cette date.
            </p>
          </div>
          {form.rsvp_deadline && (
            <div style={{ padding: '14px 16px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '12px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                Les invités verront :{' '}
                <span style={{ color: 'var(--gold-light)' }}>
                  Date limite : {parseEventDate(form.rsvp_deadline).full}
                </span>
              </p>
            </div>
          )}
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
              Notifications RSVP WhatsApp
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Le marié et la mariée recevront un message WhatsApp chaque fois qu&apos;un invité de leur côté confirme sa présence.
            </p>
            <div className="duo-grid">
              <div>
                <label style={labelStyle}>WhatsApp du marié</label>
                <input style={inputStyle} value={form.groom_phone} onChange={e => set('groom_phone', e.target.value)} placeholder="243810000001" onFocus={focus} onBlur={blur} />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '4px' }}>Notifié si invité côté Marié</p>
              </div>
              <div>
                <label style={labelStyle}>WhatsApp de la mariée</label>
                <input style={inputStyle} value={form.bride_phone} onChange={e => set('bride_phone', e.target.value)} placeholder="243810000002" onFocus={focus} onBlur={blur} />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '4px' }}>Notifiée si invité côté Mariée</p>
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Transfert WhatsApp</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => set('whatsapp_transfer_allowed', !form.whatsapp_transfer_allowed)}>
              <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: form.whatsapp_transfer_allowed ? 'none' : '1px solid rgba(255,255,255,0.2)', background: form.whatsapp_transfer_allowed ? 'var(--gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.whatsapp_transfer_allowed && <span style={{ color: '#0D0B09', fontSize: '12px', fontWeight: 700 }}>✓</span>}
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '0.85rem' }}>Autoriser le transfert des invitations WhatsApp</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Si désactivé, un avertissement s&apos;affiche si le lien est ouvert depuis un autre appareil</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── APPARENCE ── */}
      {tab === 'apparence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
          <div className="duo-grid">
            <div>
              <label style={labelStyle}>Couleur principale</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="color" value={form.theme_color_primary} onChange={e => set('theme_color_primary', e.target.value)} style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={form.theme_color_primary} onChange={e => set('theme_color_primary', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Couleur secondaire</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="color" value={form.theme_color_secondary} onChange={e => set('theme_color_secondary', e.target.value)} style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={form.theme_color_secondary} onChange={e => set('theme_color_secondary', e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
            </div>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', background: form.theme_color_primary + '15', border: '1px solid ' + form.theme_color_primary + '40', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem', color: form.theme_color_primary, marginBottom: '4px' }}>
              {form.groom_name} &amp; {form.bride_name}
            </p>
            <p style={{ color: form.theme_color_secondary, fontSize: '0.85rem', opacity: 0.8 }}>
              Aperçu du thème couleur
            </p>
          </div>
        </div>
      )}

      {/* ── MUSIQUE & CADEAUX ── */}
      {tab === 'extras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '700px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
              Musique d&apos;ambiance
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '20px', lineHeight: 1.6 }}>
              La musique joue en continu à l&apos;ouverture de l&apos;invitation, en boucle avec un volume doux.
              Utilisez une URL directe vers un fichier MP3 (Cloudinary, etc).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>URL du fichier audio (MP3)</label>
                <input style={inputStyle} value={form.music_url} onChange={e => set('music_url', e.target.value)} placeholder="https://res.cloudinary.com/.../musique.mp3" onFocus={focus} onBlur={blur} />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '6px' }}>Laissez vide pour désactiver la musique</p>
              </div>
              <div>
                <label style={labelStyle}>Volume — {form.music_volume}%</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>0%</span>
                  <input type="range" min="0" max="100" step="5" value={form.music_volume} onChange={e => set('music_volume', Number(e.target.value))} style={{ flex: 1, minWidth: 0, accentColor: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>100%</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '4px' }}>Recommandé : 20-40% pour une ambiance douce</p>
              </div>
              {form.music_url && (
                <div style={{ padding: '12px 16px', background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '10px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: '8px' }}>Tester la musique :</p>
                  <audio controls src={form.music_url} style={{ width: '100%', height: '32px', opacity: 0.7 }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
              Options de cadeaux
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Choisissez quelles options afficher sur l&apos;invitation. Si une seule option est activée, elle sera pré-sélectionnée automatiquement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'envelope', label: 'Enveloppe', sub: 'Don en espèces' },
                { id: 'present',  label: 'Présent',   sub: 'Cadeau emballé' },
              ].map(opt => {
                const isActive = (form.gift_options as string[]).includes(opt.id)
                return (
                  <div key={opt.id} onClick={() => {
                    const current = form.gift_options as string[]
                    set('gift_options', isActive ? current.filter(o => o !== opt.id) : [...current, opt.id])
                  }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: isActive ? 'rgba(201,169,110,0.06)' : 'rgba(255,255,255,0.02)', border: isActive ? '1px solid rgba(201,169,110,0.25)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: isActive ? 'none' : '1px solid rgba(255,255,255,0.2)', background: isActive ? 'var(--gold)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                      {isActive && <span style={{ color: '#0D0B09', fontSize: '13px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ color: isActive ? 'var(--gold-light)' : 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{opt.label}</p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{opt.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {(form.gift_options as string[]).length === 0 && (
              <p style={{ color: '#E89AA6', fontSize: '0.78rem', marginTop: '10px', padding: '10px', background: 'rgba(184,80,96,0.08)', borderRadius: '8px' }}>
                Aucune option — la section cadeaux sera masquée sur l&apos;invitation.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── SECTIONS ── */}
      {tab === 'sections' && (
        <div style={{ maxWidth: '560px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: '8px' }}>
            Activez ou désactivez chaque section, et réorganisez-les avec les flèches.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginBottom: '24px' }}>
            Hero et Footer sont toujours affichés, en première et dernière position.
          </p>

          {/* Sections actives */}
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '10px' }}>
            Affichées — {activeSections.length}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>

            {/* Hero — fixe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', opacity: 0.4 }}>
              <GripVertical size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', flex: 1, minWidth: 0 }}>Hero &amp; Présentation</p>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>Fixe</span>
            </div>

            {activeSections.length === 0 && (
              <div style={{ padding: '20px 16px', background: 'rgba(232,154,166,0.06)', border: '1px solid rgba(232,154,166,0.2)', borderRadius: '12px' }}>
                <p style={{ color: '#E89AA6', fontSize: '0.82rem' }}>
                  Aucune section active — l&apos;invitation n&apos;affichera que le Hero et le Footer.
                </p>
              </div>
            )}

            {/* Sections réorganisables */}
            {activeSections.map((key, idx) => {
              const canUp   = idx > 0
              const canDown = idx < activeSections.length - 1
              return (
                <div key={key} className="section-row" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                  {/* Interrupteur */}
                  <button
                    onClick={() => disableSection(key)}
                    title="Désactiver cette section"
                    style={{ width: '22px', height: '22px', flexShrink: 0, borderRadius: '6px', border: 'none', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    <span style={{ color: '#0D0B09', fontSize: '13px', fontWeight: 700, lineHeight: 1 }}>✓</span>
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
                      {SECTION_LABELS[key] ?? key}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem', marginTop: '2px' }}>
                      {SECTION_HINTS[key] ?? ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => moveSectionUp(idx)}
                      disabled={!canUp}
                      title="Monter"
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: canUp ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)', cursor: canUp ? 'pointer' : 'not-allowed', fontSize: '1rem', transition: 'all 0.2s ease' }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSectionDown(idx)}
                      disabled={!canDown}
                      title="Descendre"
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: canDown ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)', cursor: canDown ? 'pointer' : 'not-allowed', fontSize: '1rem', transition: 'all 0.2s ease' }}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Footer — fixe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', opacity: 0.4 }}>
              <GripVertical size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', flex: 1, minWidth: 0 }}>Footer</p>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>Fixe</span>
            </div>
          </div>

          {/* Sections désactivées */}
          {inactiveSections.length > 0 && (
            <>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
                Masquées — {inactiveSections.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inactiveSections.map(key => (
                  <div key={key} className="section-row" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <button
                      onClick={() => enableSection(key)}
                      title="Activer cette section"
                      style={{ width: '22px', height: '22px', flexShrink: 0, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
                        {SECTION_LABELS[key] ?? key}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '2px' }}>
                        {SECTION_HINTS[key] ?? ''}
                      </p>
                    </div>
                    <button
                      onClick={() => enableSection(key)}
                      style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.05)', color: 'var(--gold-light)', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Activer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '24px', lineHeight: 1.6 }}>
            Une section masquée n&apos;apparaît plus sur l&apos;invitation, mais les données déjà saisies par les
            invités sont conservées — la réactiver les fait réapparaître.
          </p>
        </div>
      )}

      {/* Bouton save fixe */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <SaveButton fixed />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); cursor: pointer; }
        input[type="range"] { height: 4px; }

        .admin-page {
          padding: 40px;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .admin-page { padding: 68px 16px 96px; }
        }

        .page-title { font-size: 2rem; }
        @media (max-width: 599px) { .page-title { font-size: 1.55rem; } }

        .duo-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 519px) {
          .duo-grid { grid-template-columns: minmax(0, 1fr); }
        }

        .program-row {
          display: grid;
          grid-template-columns: 130px minmax(0, 1fr) 38px;
          gap: 12px;
        }
        @media (max-width: 599px) {
          .program-row { grid-template-columns: minmax(0, 1fr) 38px; }
          .program-row > div:first-child { grid-column: 1 / -1; }
        }

        .section-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 419px) {
          .section-row { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  )
}
