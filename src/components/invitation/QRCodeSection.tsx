'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'

interface Props {
  guestId: string
  guestName: string
  tableName: string | null
  invitationToken: string
  eventTitle: string
}

export default function QRCodeSection({
  guestId,
  guestName,
  tableName,
  invitationToken,
  eventTitle,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Payload QR — contient les infos de l'invité
  const qrPayload = JSON.stringify({
    guestId,
    token: invitationToken,
    name: guestName,
    table: tableName,
  })

  const handleDownload = () => {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return

    // Convertit le SVG en PNG via canvas
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 80

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fond noir
    ctx.fillStyle = '#0D0B09'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // Dessine le QR
      ctx.drawImage(img, 40, 30, size - 80, size - 80)

      // Texte nom
      ctx.fillStyle = '#C9A96E'
      ctx.font = '500 16px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText(guestName, size / 2, size - 20)

      // Texte table
      if (tableName) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '12px Arial, sans-serif'
        ctx.fillText('Table : ' + tableName, size / 2, size)
      }

      // Watermark AlmightyService
      ctx.fillStyle = 'rgba(201,169,110,0.3)'
      ctx.font = '10px Arial, sans-serif'
      ctx.fillText('AlmightyService', size / 2, size + 60)

      // Télécharge
      const link = document.createElement('a')
      link.download = 'invitation-' + guestName.replace(/\s+/g, '-').toLowerCase() + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: '100px 24px', position: 'relative' }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '56px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: '6rem',
              fontWeight: 300,
              color: 'var(--gold)',
              opacity: 0.06,
              lineHeight: 1,
              marginBottom: '-32px',
              userSelect: 'none',
            }}
          >
            04
          </p>
          <p
            className="label-overline"
            style={{ marginBottom: '12px' }}
          >
            Votre accès
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: 'white',
              letterSpacing: '-0.01em',
              marginBottom: '16px',
            }}
          >
            QR Code
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              maxWidth: '380px',
              margin: '0 auto',
            }}
          >
            Ce QR Code vous donnera accès à votre table, vos boissons
            et votre invitation le jour de l&apos;événement.
          </p>
        </div>

        {/* Card QR Code */}
        <div
          ref={qrRef}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.15s',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,169,110,0.2)',
              borderRadius: '28px',
              padding: '40px 32px',
              textAlign: 'center',
            }}
          >
            {/* QR Code visuel */}
            <div
              style={{
                display: 'inline-block',
                padding: '20px',
                background: 'white',
                borderRadius: '16px',
                marginBottom: '32px',
                boxShadow: '0 0 60px rgba(201,169,110,0.08)',
              }}
            >
              <QRCodeSVG
                value={qrPayload}
                size={180}
                bgColor="#ffffff"
                fgColor="#0D0B09"
                level="H"
                style={{ display: 'block' }}
              />
            </div>

            {/* Infos invité */}
            <div style={{ marginBottom: '32px' }}>
              <p
                className="font-script"
                style={{
                  fontSize: '1.8rem',
                  color: 'white',
                  marginBottom: '8px',
                  lineHeight: 1.2,
                }}
              >
                {guestName}
              </p>

              {tableName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '100px',
                    background: 'rgba(201,169,110,0.1)',
                    border: '1px solid rgba(201,169,110,0.25)',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    Table
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--gold-light)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {tableName}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div
              style={{
                width: '60px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
                margin: '0 auto 28px',
              }}
            />

            {/* Note de sécurité */}
            <p
              style={{
                color: 'rgba(255,255,255,0.2)',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              Invitation personnelle — non transférable
              <br />
              {eventTitle}
            </p>

            {/* Bouton télécharger */}
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(201,169,110,0.4)',
                background: 'rgba(201,169,110,0.08)',
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.background = 'rgba(201,169,110,0.18)'
                btn.style.borderColor = 'rgba(201,169,110,0.7)'
                btn.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.background = 'rgba(201,169,110,0.08)'
                btn.style.borderColor = 'rgba(201,169,110,0.4)'
                btn.style.transform = 'translateY(0)'
              }}
            >
              <Download size={14} />
              Télécharger mon QR Code
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}