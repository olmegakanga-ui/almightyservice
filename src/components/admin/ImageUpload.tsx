'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader, ImageIcon } from 'lucide-react'

interface Props {
  label:        string
  currentUrl?:  string
  onUpload:     (url: string) => void
  aspectRatio?: string
}

export default function ImageUpload({
  label,
  currentUrl,
  onUpload,
  aspectRatio = '16/9',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState<string | null>(currentUrl ?? null)
  const [error, setError]         = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Fichier invalide — images uniquement')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop lourd — max 10MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        setError('Cloudinary non configuré — vérifiez les variables d\'environnement')
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'almightyservice/events')

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload',
        { method: 'POST', body: formData }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message ?? 'Erreur upload Cloudinary')
        return
      }

      const optimizedUrl = data.secure_url.replace(
        '/upload/',
        '/upload/w_1920,q_auto,f_auto/'
      )

      setPreview(optimizedUrl)
      onUpload(optimizedUrl)

    } catch {
      setError('Erreur réseau lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const remove = () => {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <p style={{
        fontSize:      '0.68rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color:         'rgba(255,255,255,0.4)',
        marginBottom:  '10px',
      }}>
        {label}
      </p>

      {preview ? (
        <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
          <img
            src={preview}
            alt="Aperçu"
            style={{
              width:       '100%',
              aspectRatio,
              objectFit:   'cover',
              display:     'block',
            }}
          />
          {/* Overlay actions */}
          <div
            style={{
              position:       'absolute',
              inset:          0,
              background:     'rgba(0,0,0,0.45)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '12px',
              opacity:        0,
              transition:     'opacity 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
          >
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                padding:      '10px 20px',
                borderRadius: '100px',
                border:       '1px solid rgba(255,255,255,0.4)',
                background:   'rgba(255,255,255,0.15)',
                color:        'white',
                fontSize:     '0.8rem',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          '6px',
              }}
            >
              <Upload size={14} /> Remplacer
            </button>
            <button
              onClick={remove}
              style={{
                padding:      '10px',
                borderRadius: '100px',
                border:       '1px solid rgba(232,154,166,0.4)',
                background:   'rgba(184,80,96,0.2)',
                color:        '#E89AA6',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            width:          '100%',
            aspectRatio,
            border:         '2px dashed rgba(201,169,110,0.25)',
            borderRadius:   '14px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '12px',
            cursor:         'pointer',
            transition:     'all 0.2s ease',
            background:     'rgba(255,255,255,0.02)',
          }}
          onMouseEnter={e => {
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
              <Loader
                size={28}
                color="var(--gold)"
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                Upload en cours...
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
                <p style={{
                  color:        'rgba(255,255,255,0.6)',
                  fontSize:     '0.85rem',
                  marginBottom: '4px',
                }}>
                  Glissez une image ici
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
                  ou cliquez pour parcourir · JPG, PNG, WebP · max 10MB
                </p>
              </div>
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
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}