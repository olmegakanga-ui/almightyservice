'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Loader } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  groom_name:         string
  bride_name:         string
  event_date:         string
  event_time:         string
  venue_name:         string
  venue_address:      string
  venue_lat:          string
  venue_lng:          string
  rsvp_deadline:      string
  hero_message:       string
  invitation_text:    string
  theme_name:         string
  end_message:        string
  theme_color_primary:   string
  theme_color_secondary: string
  status:             'draft' | 'active' | 'completed'
}

const INITIAL: FormData = {
  groom_name:            '',
  bride_name:            '',
  event_date:            '',
  event_time:            '19:00',
  venue_name:            '',
  venue_address:         '',
  venue_lat:             '-4.3276',
  venue_lng:             '15.3136',
  rsvp_deadline:         '',
  hero_message:          'Nous avons l\'immense plaisir de vous convier à la célébration de notre mariage.',
  invitation_text:       'ont l\'immense joie et l\'honneur de vous convier aux festivités de leur mariage religieux',
  theme_name:            '',
  end_message:           '',
  theme_color_primary:   '#C9A96E',
  theme_color_secondary: '#E8D5B0',
  status:                'draft',
}

function generateSlug(groom: string, bride: string, date: string): string {
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  const clean = (s: string) => s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${clean(groom)}-${clean(bride)}-${year}`
}

export default function NewEventForm() {
  const router = useRouter()
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [section, setSection] = useState<'general' | 'content' | 'config'>('general')

  const set = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!form.groom_name.trim()) { setError('Le nom du marié est requis'); return }
    if (!form.bride_name.trim()) { setError('Le nom de la mariée est requis'); return }
    if (!form.event_date)        { setError('La date du mariage est requise'); return }
    if (!form.venue_name.trim()) { setError('Le lieu est requis'); return }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const db = supabase as any

      // Construire la date+heure complète
      const eventDatetime = `${form.event_date}T${form.event_time}:00`

      // Deadline RSVP (par défaut J-7 si non renseignée)
      let rsvpDeadline = form.rsvp_deadline
        ? `${form.rsvp_deadline}T23:59:59`
        : null
      if (!rsvpDeadline) {
        const d = new Date(eventDatetime)
        d.setDate(d.getDate() - 7)
        rsvpDeadline = d.toISOString()
      }

      const slug = generateSlug(form.groom_name, form.bride_name, form.event_date)

      // Vérifier que le slug n'existe pas déjà
      const { data: existing } = await db
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single()

      const finalSlug = existing
        ? `${slug}-${Date.now()}`
        : slug

      const { data: newEvent, error: insertError } = await db
        .from('events')
        .insert({
          slug:                  finalSlug,
          groom_name:            form.groom_name.trim(),
          bride_name:            form.bride_name.trim(),
          event_date:            eventDatetime,
          event_time:            form.event_time,
          venue_name:            form.venue_name.trim(),
          venue_address:         form.venue_address.trim(),
          venue_lat:             parseFloat(form.venue_lat) || -4.3276,
          venue_lng:             parseFloat(form.venue_lng) || 15.3136,
          rsvp_deadline:         rsvpDeadline,
          hero_message:          form.hero_message.trim(),
          invitation_text:       form.invitation_text.trim(),
          theme_name:            form.theme_name.trim(),
          end_message:           form.end_message.trim(),
          theme_color_primary:   form.theme_color_primary,
          theme_color_secondary: form.theme_color_secondary,
          status:                form.status,
          background_image_url:  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80',
          program_json:          '[]',
          drink_options_json:    '[]',
        })
        .select('id')
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Rediriger vers le dashboard du nouveau mariage
      router.push('/admin/events/' + newEvent.id + '/guests')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width:       '100%',
    padding:     '12px 16px',
    background:  'rgba(255,255,255,0.05)',
    border:      '1px solid rgba(255,255,255,0.1)',
    borderRadius:'12px',
    color:       'white',
    fontFamily:  'var(--font-body)',
    fontSize:    '0.9rem',
    outline:     'none',
    transition:  'border-color 0.2s ease',
  }

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontSize:      '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.4)',
    marginBottom:  '8px',
  }

  const sectionBtnStyle = (active: boolean): React.CSSProperties => ({
    padding:     '8px 20px',
    borderRadius:'8px',
    border:      active ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
    background:  active ? 'rgba(201,169,110,0.1)' : 'transparent',
    color:       active ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
    fontSize:    '0.82rem',
    cursor:      'pointer',
    transition:  'all 0.2s ease',
  })

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(201,169,110,0.5)'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <Link
          href="/admin/events"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '6px',
            color:          'rgba(255,255,255,0.3)',
            textDecoration: 'none',
            fontSize:       '0.82rem',
            marginBottom:   '16px',
          }}
        >
          <ArrowLeft size={14} /> Retour aux mariages
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize:   '2.5rem',
          fontWeight: 300,
          color:      'white',
          marginBottom: '8px',
        }}>
          Nouveau mariage
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
          Créez un événement en quelques minutes
        </p>
      </div>

      {/* Onglets de section */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button onClick={() => setSection('general')} style={sectionBtnStyle(section === 'general')}>
          1. Informations
        </button>
        <button onClick={() => setSection('content')} style={sectionBtnStyle(section === 'content')}>
          2. Contenu
        </button>
        <button onClick={() => setSection('config')} style={sectionBtnStyle(section === 'config')}>
          3. Apparence
        </button>
      </div>

      {/* ── SECTION 1 : Informations générales ── */}
      {section === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Noms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nom du marié *</label>
              <input
                style={inputStyle}
                value={form.groom_name}
                onChange={e => set('groom_name', e.target.value)}
                placeholder="Jonathan"
                onFocus={focus} onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Nom de la mariée *</label>
              <input
                style={inputStyle}
                value={form.bride_name}
                onChange={e => set('bride_name', e.target.value)}
                placeholder="Christelle"
                onFocus={focus} onBlur={blur}
              />
            </div>
          </div>

          {/* Date + Heure */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Date du mariage *</label>
              <input
                style={inputStyle}
                type="date"
                value={form.event_date}
                onChange={e => set('event_date', e.target.value)}
                onFocus={focus} onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input
                style={inputStyle}
                type="time"
                value={form.event_time}
                onChange={e => set('event_time', e.target.value)}
                onFocus={focus} onBlur={blur}
              />
            </div>
          </div>

          {/* Lieu */}
          <div>
            <label style={labelStyle}>Nom du lieu *</label>
            <input
              style={inputStyle}
              value={form.venue_name}
              onChange={e => set('venue_name', e.target.value)}
              placeholder="Salle des Fêtes Le Prestige"
              onFocus={focus} onBlur={blur}
            />
          </div>

          <div>
            <label style={labelStyle}>Adresse complète</label>
            <input
              style={inputStyle}
              value={form.venue_address}
              onChange={e => set('venue_address', e.target.value)}
              placeholder="Avenue du Commerce 14, Kinshasa, RDC"
              onFocus={focus} onBlur={blur}
            />
          </div>

          {/* Coordonnées GPS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Latitude GPS</label>
              <input
                style={inputStyle}
                value={form.venue_lat}
                onChange={e => set('venue_lat', e.target.value)}
                placeholder="-4.3276"
                onFocus={focus} onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Longitude GPS</label>
              <input
                style={inputStyle}
                value={form.venue_lng}
                onChange={e => set('venue_lng', e.target.value)}
                placeholder="15.3136"
                onFocus={focus} onBlur={blur}
              />
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            💡 Trouvez les coordonnées sur Google Maps → clic droit sur le lieu → copier les coordonnées
          </p>

          {/* Deadline RSVP */}
          <div>
            <label style={labelStyle}>Date limite RSVP</label>
            <input
              style={inputStyle}
              type="date"
              value={form.rsvp_deadline}
              onChange={e => set('rsvp_deadline', e.target.value)}
              onFocus={focus} onBlur={blur}
            />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '6px' }}>
              Laissez vide pour J-7 automatique
            </p>
          </div>

          <button
            onClick={() => setSection('content')}
            style={{
              alignSelf:     'flex-end',
              padding:       '12px 28px',
              borderRadius:  '100px',
              border:        '1px solid rgba(201,169,110,0.4)',
              background:    'rgba(201,169,110,0.1)',
              color:         'var(--gold-light)',
              fontFamily:    'var(--font-body)',
              fontSize:      '0.82rem',
              cursor:        'pointer',
              letterSpacing: '0.1em',
            }}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* ── SECTION 2 : Contenu ── */}
      {section === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={labelStyle}>Message Hero (section d&apos;accueil)</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.hero_message}
              onChange={e => set('hero_message', e.target.value)}
              placeholder="Nous avons l'immense plaisir de vous convier..."
              onFocus={focus} onBlur={blur}
            />
          </div>

          <div>
            <label style={labelStyle}>Texte principal de l&apos;invitation</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.invitation_text}
              onChange={e => set('invitation_text', e.target.value)}
              placeholder="ont l'immense joie de vous convier aux festivités..."
              onFocus={focus} onBlur={blur}
            />
          </div>

          <div>
            <label style={labelStyle}>Thème de l&apos;événement</label>
            <input
              style={inputStyle}
              value={form.theme_name}
              onChange={e => set('theme_name', e.target.value)}
              placeholder="Ex: Noir & Or, Blanc & Rose, Royal..."
              onFocus={focus} onBlur={blur}
            />
          </div>

          <div>
            <label style={labelStyle}>Message de fin (footer)</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.end_message}
              onChange={e => set('end_message', e.target.value)}
              placeholder="Merci de partager ce moment précieux avec nous..."
              onFocus={focus} onBlur={blur}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setSection('general')}
              style={{
                padding:    '12px 28px',
                borderRadius:'100px',
                border:     '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color:      'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-body)',
                fontSize:   '0.82rem',
                cursor:     'pointer',
              }}
            >
              ← Retour
            </button>
            <button
              onClick={() => setSection('config')}
              style={{
                padding:       '12px 28px',
                borderRadius:  '100px',
                border:        '1px solid rgba(201,169,110,0.4)',
                background:    'rgba(201,169,110,0.1)',
                color:         'var(--gold-light)',
                fontFamily:    'var(--font-body)',
                fontSize:      '0.82rem',
                cursor:        'pointer',
                letterSpacing: '0.1em',
              }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 3 : Apparence & Statut ── */}
      {section === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Couleurs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Couleur principale</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={form.theme_color_primary}
                  onChange={e => set('theme_color_primary', e.target.value)}
                  style={{
                    width:        '48px',
                    height:       '48px',
                    borderRadius: '10px',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    background:   'transparent',
                    cursor:       'pointer',
                    padding:      '2px',
                  }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.theme_color_primary}
                  onChange={e => set('theme_color_primary', e.target.value)}
                  placeholder="#C9A96E"
                  onFocus={focus} onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Couleur secondaire</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={form.theme_color_secondary}
                  onChange={e => set('theme_color_secondary', e.target.value)}
                  style={{
                    width:        '48px',
                    height:       '48px',
                    borderRadius: '10px',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    background:   'transparent',
                    cursor:       'pointer',
                    padding:      '2px',
                  }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.theme_color_secondary}
                  onChange={e => set('theme_color_secondary', e.target.value)}
                  placeholder="#E8D5B0"
                  onFocus={focus} onBlur={blur}
                />
              </div>
            </div>
          </div>

          {/* Prévisualisation couleurs */}
          <div style={{
            padding:      '16px 20px',
            borderRadius: '14px',
            background:   form.theme_color_primary + '15',
            border:       '1px solid ' + form.theme_color_primary + '40',
            display:      'flex',
            alignItems:   'center',
            gap:          '12px',
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: form.theme_color_primary }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: form.theme_color_secondary }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
              Aperçu des couleurs du thème
            </p>
          </div>

          {/* Statut */}
          <div>
            <label style={labelStyle}>Statut de l&apos;événement</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.status}
              onChange={e => set('status', e.target.value as FormData['status'])}
              onFocus={focus} onBlur={blur}
            >
              <option value="draft">Brouillon — non visible</option>
              <option value="active">Publié — invitations actives</option>
              <option value="completed">Terminé — archivé</option>
            </select>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '6px' }}>
              En brouillon, les invitations ne sont pas accessibles
            </p>
          </div>

          {/* Récapitulatif */}
          {form.groom_name && form.bride_name && form.event_date && (
            <div style={{
              padding:      '20px',
              background:   'rgba(255,255,255,0.03)',
              border:       '1px solid rgba(201,169,110,0.15)',
              borderRadius: '16px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Récapitulatif
              </p>
              <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '8px' }}>
                {form.groom_name} & {form.bride_name}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                📅 {new Date(form.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {form.event_time}
              </p>
              {form.venue_name && (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '4px' }}>
                  📍 {form.venue_name}
                </p>
              )}
              <p style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                <span style={{
                  padding:      '3px 10px',
                  borderRadius: '100px',
                  background:   form.status === 'active' ? 'rgba(90,138,106,0.2)' : 'rgba(255,255,255,0.08)',
                  color:        form.status === 'active' ? '#7EC89A' : 'rgba(255,255,255,0.4)',
                  border:       form.status === 'active' ? '1px solid rgba(90,138,106,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  {form.status === 'draft' ? 'Brouillon' : form.status === 'active' ? 'Publié' : 'Terminé'}
                </span>
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div style={{
              padding:      '14px 16px',
              background:   'rgba(184,80,96,0.1)',
              border:       '1px solid rgba(184,80,96,0.3)',
              borderRadius: '12px',
            }}>
              <p style={{ color: '#E89AA6', fontSize: '0.85rem' }}>{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setSection('content')}
              style={{
                padding:    '12px 28px',
                borderRadius:'100px',
                border:     '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color:      'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-body)',
                fontSize:   '0.82rem',
                cursor:     'pointer',
              }}
            >
              ← Retour
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !form.groom_name || !form.bride_name || !form.event_date || !form.venue_name}
              style={{
                padding:       '14px 36px',
                borderRadius:  '100px',
                border:        'none',
                background:    loading ? 'rgba(90,138,106,0.3)' : 'rgba(90,138,106,0.8)',
                color:         'white',
                fontFamily:    'var(--font-body)',
                fontSize:      '0.9rem',
                fontWeight:    500,
                cursor:        loading ? 'not-allowed' : 'pointer',
                display:       'flex',
                alignItems:    'center',
                gap:           '8px',
                opacity:       (!form.groom_name || !form.bride_name || !form.event_date || !form.venue_name) ? 0.4 : 1,
                transition:    'all 0.2s ease',
              }}
            >
              {loading ? (
                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Création...</>
              ) : (
                <><Check size={16} /> Créer le mariage</>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="color"]::-webkit-color-swatch-wrapper {
          filter: invert(1) opacity(0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}