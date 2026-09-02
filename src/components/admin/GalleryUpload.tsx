'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  label:    string
  images:   string[]
  onChange: (urls: string[]) => void
  max?:     number
}

export default function GalleryUpload({
  label,
  images,
  onChange,
  max = 12,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState<{ done: number; total: number } | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const uploadOne = async (file: File): Promise<string | null> => {
    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary non configuré — vérifiez les variables d\'environnement')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'almightyservice/gallery')

    const res  = await fetch(
      'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload',
      { method: 'POST', body: formData }
    )
    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message ?? 'Erreur upload Cloudinary')
      return null
    }

    // Largeur 1400 : suffisant pour un affichage plein écran sans alourdir la page
    return data.secure_url.replace('/upload/', '/upload/w_1400,q_auto,f_auto/')
  }

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    const room = max - images.length
    if (room <= 0) {
      setError('Maximum ' + max + ' photos atteint')
      return
    }

    const valid = files
      .filter(f => f.type.startsWith('image/'))
      .filter(f => f.size <= 10 * 1024 * 1024)
      .slice(0, room)

    if (valid.length === 0) {
      setError('Aucun fichier valide — images de moins de 10 Mo uniquement')
      return
    }

    if (valid.length < files.length) {
      setError(files.length - valid.length + ' fichier(s) ignoré(s) — format invalide, trop lourd, ou limite atteinte')
    } else {
      setError(null)
    }

    setUploading(true)
    setProgress({ done: 0, total: valid.length })

    const uploaded: string[] = []
    for (let i = 0; i < valid.length; i++) {
      const url = await uploadOne(valid[i])
      if (url) uploaded.push(url)
      setProgress({ done: i + 1, total: valid.length })
    }

    if (uploaded.length > 0) onChange([...images, ...uploaded])

    setUploading(false)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  const removeAt = (idx: number) =>
    onChange(images.filter((_, i) => i !== idx))

  const moveLeft = (idx: number) => {
    if (idx === 0) return
    const next = [...images]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    onChange(next)
  }

  const moveRight = (idx: number) => {
    if (idx === images.length - 1) return
    const next = [...images]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    onChange(next)
  }

  const miniBtn: React.CSSProperties = {
    width:          '28px',
    height:         '28px',
    flexShrink:     0,
    borderRadius:   '8px',
    border:         '1px solid rgba(255,255,255,0.2)',
    background:     'rgba(0,0,0,0.55)',
    color:          'white',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        0,
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <p style={{
          fontSize:      '0.68rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,0.4)',
        }}>
          {label}
        </p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          {images.length} / {max}
        </p>
      </div>

      {/* Vignettes */}
      {images.length > 0 && (
        <div className="gallery-thumbs">
          {images.map((url, idx) => (
            <div key={url + idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={'Photo ' + (idx + 1)}
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              />

              {/* Numéro d'ordre */}
              <span style={{
                position:     'absolute',
                top:          '8px',
                left:         '8px',
                padding:      '2px 8px',
                borderRadius: '100px',
                background:   'rgba(0,0,0,0.6)',
                color:        'var(--gold-light)',
                fontSize:     '0.7rem',
                fontFamily:   'var(--font-display)',
              }}>
                {idx + 1}
              </span>

              {/* Retirer */}
              <button
                onClick={() => removeAt(idx)}
                title="Retirer cette photo"
                style={{ ...miniBtn, position: 'absolute', top: '8px', right: '8px', border: '1px solid rgba(232,154,166,0.45)', background: 'rgba(184,80,96,0.55)', color: '#FFD9DF' }}
              >
                <X size={14} />
              </button>

              {/* Réordonner */}
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <button
                  onClick={() => moveLeft(idx)}
                  disabled={idx === 0}
                  title="Déplacer avant"
                  style={{ ...miniBtn, opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => moveRight(idx)}
                  disabled={idx === images.length - 1}
                  title="Déplacer après"
                  style={{ ...miniBtn, opacity: idx === images.length - 1 ? 0.3 : 1, cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'ajout */}
      {images.length < max && (
        <div
          onClick={() => { if (!uploading) inputRef.current?.click() }}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            width:          '100%',
            padding:        '28px 20px',
            border:         '2px dashed rgba(201,169,110,0.25)',
            borderRadius:   '14px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '12px',
            cursor:         uploading ? 'wait' : 'pointer',
            transition:     'all 0.2s ease',
            background:     'rgba(255,255,255,0.02)',
            marginTop:      images.length > 0 ? '14px' : 0,
          }}
          onMouseEnter={e => {
            if (uploading) return
            e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)'
            e.currentTarget.style.background  = 'rgba(201,169,110,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'
            e.currentTarget.style.background  = 'rgba(255,255,255,0.02)'
          }}
        >
          {uploading ? (
            <>
              <Loader size={28} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                {progress ? 'Envoi ' + progress.done + ' sur ' + progress.total + '...' : 'Upload en cours...'}
              </p>
            </>
          ) : (
            <>
              <div style={{
                width:          '48px',
                height:         '48px',
                borderRadius:   '50%',
                background:     'rgba(201,169,110,0.1)',
                border:         '1px solid rgba(201,169,110,0.25)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                <ImageIcon size={20} color="var(--gold)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '4px' }}>
                  Glissez vos photos ici
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
                  ou cliquez pour parcourir · plusieurs à la fois · JPG, PNG, WebP · max 10 Mo chacune
                </p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '100px',
                  border: '1px solid rgba(201,169,110,0.3)',
                  background: 'rgba(201,169,110,0.06)',
                  color: 'var(--gold-light)', fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                <Upload size={13} /> Ajouter des photos
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: '#E89AA6', fontSize: '0.78rem', marginTop: '8px' }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => { if (e.target.files) handleFiles(e.target.files) }}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .gallery-thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
          gap: 12px;
        }
      `}</style>
    </div>
  )
}
