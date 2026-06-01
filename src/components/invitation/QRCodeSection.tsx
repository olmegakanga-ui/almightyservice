'use client'

import { useEffect, useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Shield, RefreshCw } from 'lucide-react'

interface Props {
  guestId:         string
  guestName:       string
  tableName:       string | null
  invitationToken: string
  eventTitle:      string
  eventId:         string
}

export default function QRCodeSection({
  guestId,
  guestName,
  tableName,
  invitationToken,
  eventTitle,
  eventId,
}: Props) {
  const [qrValue, setQrValue] = useState<string>(invitationToken)
  const [secured, setSecured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const sectionRef            = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Générer le JWT sécurisé au chargement
  useEffect(() => {
    const generateJWT = async () => {
      setLoading(true)
      try {
        const res  = await fetch('/api/qr/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ guestId, eventId }),
        })
        const data = await res.json()
        if (data.success && data.jwt) {
          setQrValue(data.jwt)
          setSecured(true)
        }
      } catch {
        setQrValue(invitationToken)
      } finally {
        setLoading(false)
      }
    }

    if (guestId && eventId) {
      generateJWT()
    }
  }, [guestId, eventId, invitationToken])

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement
    if (!canvas) return
    const url  = canvas.toDataURL('image/png')
    const a    = document.createElement('a')
    a.href     = url
    a.download = `invitation-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>

        {/* Numéro décoratif */}
        <p
          className="font-display"
          style={{
            fontSize:     '6rem',
            fontWeight:   300,
            color:        'var(--gold)',
            opacity:      0.06,
            lineHeight:   1,
            marginBottom: '-32px',
            userSelect:   'none',
          }}
        >
          04
        </p>

        <p className="label-overline" style={{ marginBottom: '12px' }}>
          Votre pass d&apos;entrée
        </p>

        <h2
          className="font-display"
          style={{
            fontSize:      'clamp(2rem, 4vw, 3rem)',
            fontWeight:    300,
            color:         'white',
            marginBottom:  '40px',
            letterSpacing: '-0.01em',
          }}
        >
          QR Code
        </h2>

        {/* QR Code */}
        <div
          id="qr-canvas"
          style={{
            display:        'inline-flex',
            flexDirection:  'column',
            alignItems:     'center',
            padding:        '28px',
            background:     'white',
            borderRadius:   '20px',
            marginBottom:   '16px',
            opacity:        visible ? 1 : 0,
            transform:      visible ? 'scale(1)' : 'scale(0.9)',
            transition:     'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <QRCodeCanvas
            value={qrValue}
            size={200}
            level="H"
            includeMargin={false}
            imageSettings={{
              src:      '/logo-qr.png',
              width:    32,
              height:   32,
              excavate: true,
            }}
          />
        </div>

        {/* Badge sécurisé — SOUS le QR */}
        <div style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '6px',
          padding:        '5px 14px',
          borderRadius:   '100px',
          background:     secured
            ? 'rgba(90,138,106,0.1)'
            : 'rgba(255,255,255,0.04)',
          border:         secured
            ? '1px solid rgba(90,138,106,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          marginBottom:   '32px',
        }}>
          {loading ? (
            <RefreshCw
              size={11}
              color="rgba(255,255,255,0.3)"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          ) : (
            <Shield size={11} color={secured ? '#7EC89A' : 'rgba(255,255,255,0.3)'} />
          )}
          <span style={{
            fontSize:      '0.72rem',
            color:         secured ? '#7EC89A' : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
          }}>
            {loading
              ? 'Sécurisation...'
              : secured
              ? 'QR Code sécurisé JWT'
              : 'QR Code standard'}
          </span>
        </div>

        {/* Infos invité */}
        <div style={{ marginBottom: '32px' }}>
          <p
            className="font-script"
            style={{
              fontSize:     '1.8rem',
              color:        'white',
              marginBottom: '4px',
            }}
          >
            {guestName}
          </p>
          {tableName && (
            <p style={{
              color:         'var(--gold-light)',
              fontSize:      '0.85rem',
              letterSpacing: '0.1em',
            }}>
              Table : {tableName}
            </p>
          )}
          <p style={{
            color:     'rgba(255,255,255,0.3)',
            fontSize:  '0.78rem',
            marginTop: '4px',
          }}>
            {eventTitle}
          </p>
        </div>

        {/* Bouton télécharger */}
        <button
          onClick={handleDownload}
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            padding:        '14px 28px',
            borderRadius:   '100px',
            border:         '1px solid rgba(201,169,110,0.3)',
            background:     'rgba(201,169,110,0.08)',
            color:          'var(--gold-light)',
            fontFamily:     'var(--font-body)',
            fontSize:       '0.82rem',
            letterSpacing:  '0.1em',
            cursor:         'pointer',
            transition:     'all 0.2s ease',
          }}
        >
          <Download size={14} />
          Télécharger mon invitation
        </button>

        <p style={{
          color:      'rgba(255,255,255,0.2)',
          fontSize:   '0.72rem',
          marginTop:  '16px',
          lineHeight: 1.6,
        }}>
          Présentez ce QR Code à l&apos;entrée le jour du mariage.<br />
          {secured && 'Ce code est valide 24h et cryptographiquement sécurisé.'}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}