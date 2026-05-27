'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, Download, Check, AlertTriangle } from 'lucide-react'

interface Table {
  id: string
  name: string
  side: 'HOMME' | 'FEMME'
}

interface Props {
  eventId: string
  tables:  Table[]
  onClose: () => void
  onSuccess: () => void
}

interface ParsedGuest {
  full_name: string
  phone:     string
  side:      'HOMME' | 'FEMME'
  is_couple: boolean
  label:     string
  table_id:  string | null
  valid:     boolean
  error?:    string
}

export default function ImportGuestsModal({ eventId, tables, onClose, onSuccess }: Props) {
  const [step, setStep]         = useState<'upload' | 'preview' | 'done'>('upload')
  const [guests, setGuests]     = useState<ParsedGuest[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const [errors, setErrors]     = useState<string[]>([])
  const inputRef                = useRef<HTMLInputElement>(null)

  // Télécharger le template CSV
  const downloadTemplate = () => {
    const headers = 'Nom complet,Téléphone,Côté (HOMME/FEMME),Est couple (OUI/NON),Étiquette,Nom de la table'
    const example1 = 'Benjamin Awuya,243810000001,HOMME,NON,Famille,Actif Matériel'
    const example2 = 'Sophie Mutombo,243810000002,FEMME,OUI,Amis,Grâce Divine'
    const csv = [headers, example1, example2].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'template-invites.csv'
    a.click()
  }

  // Parser le CSV
  const parseCSV = (text: string): ParsedGuest[] => {
    const lines = text.split('\n').filter(l => l.trim())
    const parsed: ParsedGuest[] = []

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))

      if (cols.length < 2) continue

      const fullName  = cols[0] ?? ''
      const phone     = cols[1] ?? ''
      const sideRaw   = (cols[2] ?? 'HOMME').toUpperCase()
      const coupleRaw = (cols[3] ?? 'NON').toUpperCase()
      const label     = cols[4] ?? ''
      const tableName = cols[5] ?? ''

      const side: 'HOMME' | 'FEMME' = sideRaw === 'FEMME' ? 'FEMME' : 'HOMME'
      const isCouple = coupleRaw === 'OUI' || coupleRaw === 'TRUE' || coupleRaw === '1'

      // Trouver la table par nom
      const table = tables.find(t =>
        t.name.toLowerCase() === tableName.toLowerCase()
      )

      const valid = fullName.length > 0
      const error = !valid ? 'Nom manquant' : undefined

      parsed.push({
        full_name: fullName,
        phone:     phone.replace(/[^0-9]/g, ''),
        side,
        is_couple: isCouple,
        label,
        table_id:  table?.id ?? null,
        valid,
        error,
      })
    }

    return parsed
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Fichier CSV uniquement')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setGuests(parsed)
      setStep('preview')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    const validGuests = guests.filter(g => g.valid)
    if (validGuests.length === 0) return

    setImporting(true)
    setErrors([])

    const supabase = createClient()
    const db       = supabase as any
    const errs: string[] = []
    let count = 0

    for (const guest of validGuests) {
      const { error } = await db.from('guests').insert({
        event_id:         eventId,
        full_name:        guest.full_name,
        phone:            guest.phone,
        side:             guest.side,
        is_couple:        guest.is_couple,
        label:            guest.label,
        table_id:         guest.table_id,
      })

      if (error) {
        errs.push(guest.full_name + ' : ' + error.message)
      } else {
        count++
      }
    }

    setImported(count)
    setErrors(errs)
    setImporting(false)
    setStep('done')
  }

  const validCount   = guests.filter(g => g.valid).length
  const invalidCount = guests.filter(g => !g.valid).length

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.75)',
        zIndex:         1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width:        '100%',
        maxWidth:     '680px',
        maxHeight:    '85vh',
        background:   '#141210',
        border:       '1px solid rgba(201,169,110,0.2)',
        borderRadius: '24px',
        overflow:     'hidden',
        display:      'flex',
        flexDirection:'column',
      }}>

        {/* Header */}
        <div style={{
          padding:        '24px 28px',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          flexShrink:     0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300, color: 'white' }}>
              Importer des invités
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: '2px' }}>
              Importez votre liste depuis un fichier CSV
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>

          {/* ── STEP 1 : Upload ── */}
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Template download */}
              <div style={{
                padding:      '16px 20px',
                background:   'rgba(201,169,110,0.05)',
                border:       '1px solid rgba(201,169,110,0.15)',
                borderRadius: '14px',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'space-between',
                gap:          '16px',
              }}>
                <div>
                  <p style={{ color: 'white', fontSize: '0.88rem', marginBottom: '4px' }}>
                    Télécharger le template CSV
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                    Colonnes : Nom, Téléphone, Côté, Couple, Étiquette, Table
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '6px',
                    padding:      '10px 18px',
                    borderRadius: '100px',
                    border:       '1px solid rgba(201,169,110,0.4)',
                    background:   'rgba(201,169,110,0.1)',
                    color:        'var(--gold-light)',
                    fontSize:     '0.78rem',
                    cursor:       'pointer',
                    flexShrink:   0,
                  }}
                >
                  <Download size={13} /> Template
                </button>
              </div>

              {/* Tables disponibles */}
              {tables.length > 0 && (
                <div style={{
                  padding:      '14px 16px',
                  background:   'rgba(255,255,255,0.02)',
                  border:       '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Tables disponibles
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tables.map(t => (
                      <span
                        key={t.id}
                        style={{
                          padding:      '3px 10px',
                          borderRadius: '100px',
                          background:   t.side === 'HOMME' ? 'rgba(100,149,237,0.1)' : 'rgba(255,182,193,0.1)',
                          color:        t.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1',
                          fontSize:     '0.72rem',
                          border:       '1px solid ' + (t.side === 'HOMME' ? 'rgba(100,149,237,0.2)' : 'rgba(255,182,193,0.2)'),
                        }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone de drop */}
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onDragOver={e => e.preventDefault()}
                style={{
                  width:          '100%',
                  padding:        '48px 24px',
                  border:         '2px dashed rgba(201,169,110,0.25)',
                  borderRadius:   '16px',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  gap:            '12px',
                  cursor:         'pointer',
                  textAlign:      'center',
                  transition:     'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'; e.currentTarget.style.background = 'rgba(201,169,110,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Upload size={32} color="var(--gold)" style={{ opacity: 0.6 }} />
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '4px' }}>
                    Glissez votre fichier CSV ici
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
                    ou cliquez pour parcourir
                  </p>
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* ── STEP 2 : Preview ── */}
          {step === 'preview' && (
            <div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(90,138,106,0.1)', border: '1px solid rgba(90,138,106,0.2)', borderRadius: '10px' }}>
                  <p style={{ color: '#7EC89A', fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>{validCount}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>Valides</p>
                </div>
                {invalidCount > 0 && (
                  <div style={{ padding: '12px 16px', background: 'rgba(184,80,96,0.1)', border: '1px solid rgba(184,80,96,0.2)', borderRadius: '10px' }}>
                    <p style={{ color: '#E89AA6', fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>{invalidCount}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>Invalides</p>
                  </div>
                )}
              </div>

              {/* Table preview */}
              <div style={{
                background:   'rgba(255,255,255,0.02)',
                border:       '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                overflow:     'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Nom', 'Téléphone', 'Côté', 'Couple', 'Table', 'Statut'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guests.slice(0, 20).map((g, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <td style={{ padding: '10px 12px', color: g.valid ? 'white' : '#E89AA6' }}>
                          {g.full_name || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)' }}>
                          {g.phone || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: g.side === 'HOMME' ? '#9DB4F5' : '#FFB6C1', fontSize: '0.75rem' }}>
                          {g.side}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                          {g.is_couple ? 'Oui' : 'Non'}
                        </td>
                        <td style={{ padding: '10px 12px', color: g.table_id ? 'var(--gold-light)' : 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                          {g.table_id
                            ? tables.find(t => t.id === g.table_id)?.name ?? '—'
                            : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {g.valid ? (
                            <span style={{ color: '#7EC89A', fontSize: '0.72rem' }}>✓ OK</span>
                          ) : (
                            <span style={{ color: '#E89AA6', fontSize: '0.72rem' }}>✗ {g.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {guests.length > 20 && (
                  <p style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', textAlign: 'center' }}>
                    + {guests.length - 20} autres invités
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3 : Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width:          '64px',
                height:         '64px',
                borderRadius:   '50%',
                background:     'rgba(90,138,106,0.15)',
                border:         '1px solid rgba(90,138,106,0.3)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                margin:         '0 auto 20px',
              }}>
                <Check size={28} color="#7EC89A" />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>
                Import terminé
              </p>
              <p style={{ color: '#7EC89A', fontSize: '1rem', marginBottom: '16px' }}>
                {imported} invité{imported > 1 ? 's' : ''} importé{imported > 1 ? 's' : ''} avec succès
              </p>
              {errors.length > 0 && (
                <div style={{ padding: '14px', background: 'rgba(184,80,96,0.08)', borderRadius: '12px', textAlign: 'left', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={14} color="#E89AA6" />
                    <p style={{ color: '#E89AA6', fontSize: '0.82rem' }}>{errors.length} erreur{errors.length > 1 ? 's' : ''}</p>
                  </div>
                  {errors.slice(0, 3).map((e, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '4px' }}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:        '20px 28px',
          borderTop:      '1px solid rgba(255,255,255,0.06)',
          display:        'flex',
          justifyContent: 'space-between',
          flexShrink:     0,
        }}>
          {step === 'upload' && (
            <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.82rem' }}>
              Annuler
            </button>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('upload')}
                style={{ padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                ← Retour
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '8px',
                  padding:      '12px 28px',
                  borderRadius: '100px',
                  border:       'none',
                  background:   'rgba(90,138,106,0.8)',
                  color:        'white',
                  fontSize:     '0.88rem',
                  fontWeight:   500,
                  cursor:       importing ? 'not-allowed' : 'pointer',
                  opacity:      validCount === 0 ? 0.4 : 1,
                }}
              >
                {importing ? 'Import en cours...' : `Importer ${validCount} invité${validCount > 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {step === 'done' && (
            <button
              onClick={() => { onSuccess(); onClose() }}
              style={{
                width:        '100%',
                padding:      '14px',
                borderRadius: '100px',
                border:       '1px solid rgba(201,169,110,0.4)',
                background:   'rgba(201,169,110,0.1)',
                color:        'var(--gold-light)',
                fontSize:     '0.88rem',
                cursor:       'pointer',
              }}
            >
              Fermer et voir les invités
            </button>
          )}
        </div>
      </div>
    </div>
  )
}