'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, CameraOff } from 'lucide-react'
import GuestCheckinCard from './GuestCheckinCard'
import ManualGuestSearch from './ManualGuestSearch'

interface Event {
  id: string
  groom_name: string
  bride_name: string
  status: string
}

interface GuestInfo {
  id: string
  fullName: string
  phone: string
  side: 'HOMME' | 'FEMME'
  isCouple: boolean
  label: string
  checkedIn: boolean
  checkedInAt: string | null
  checkedInBy: string | null
  table: { name: string; category: string; capacity: number } | null
  rsvpStatus: string
  drinks: string[]
}

export default function ScanClient({ event }: { event: Event }) {
  const [mode, setMode]           = useState<'camera' | 'manual'>('camera')
  const [scanning, setScanning]   = useState(false)
  const [guest, setGuest]         = useState<GuestInfo | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const scannerRef = useRef<unknown>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const processQrCode = async (raw: string) => {
    setScanError(null)
    try {
      let token: string
      try {
        const parsed = JSON.parse(raw)
        token = parsed.token ?? raw
      } catch {
        token = raw
      }

      const res = await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, eventId: event.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setScanError(data.error ?? 'QR Code invalide')
        return
      }

      setGuest(data.guest)
    } catch {
      setScanError('Erreur lors du traitement du QR Code')
    }
  }

  const startScanner = async () => {
    if (!containerRef.current) return
    setScanError(null)
    setCameraError(false)

    try {
      // Import dynamique pour éviter les erreurs SSR
      const { Html5Qrcode } = await import('html5-qrcode')

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          // QR détecté — arrête le scanner et traite
          await scanner.stop()
          setScanning(false)
          await processQrCode(decodedText)
        },
        () => {
          // Pas de QR détecté — continue (ne rien faire)
        }
      )

      setScanning(true)
    } catch (err) {
      console.error('Erreur caméra:', err)
      setCameraError(true)
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const scanner = scannerRef.current as InstanceType<typeof Html5Qrcode>
        if (scanner) await scanner.stop()
      } catch {
        // Ignore les erreurs d'arrêt
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  const reset = async () => {
    setGuest(null)
    setScanError(null)
    setCameraError(false)
    if (mode === 'camera') {
      await startScanner()
    }
  }

  // Démarre le scanner quand on arrive en mode caméra
  useEffect(() => {
    if (mode === 'camera' && !guest) {
      // Petit délai pour que le DOM soit prêt
      const t = setTimeout(() => startScanner(), 300)
      return () => {
        clearTimeout(t)
        stopScanner()
      }
    } else {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Nettoyage au démontage
  useEffect(() => {
    return () => { stopScanner() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0B09',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            Scanner QR
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
            {event.groom_name} & {event.bride_name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setMode('camera')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: mode === 'camera' ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
              background: mode === 'camera' ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: mode === 'camera' ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Camera size={13} /> Caméra
          </button>
          <button
            onClick={() => setMode('manual')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: mode === 'manual' ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
              background: mode === 'manual' ? 'rgba(201,169,110,0.1)' : 'transparent',
              color: mode === 'manual' ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            Recherche
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '20px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>

        {guest ? (
          <GuestCheckinCard
            guest={guest}
            eventId={event.id}
            onReset={reset}
          />
        ) : (
          <>
            {/* Mode caméra */}
            {mode === 'camera' && (
              <div>
                {/* Conteneur QR scanner */}
                <div
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#000',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                  }}
                >
                  {/* Zone de rendu html5-qrcode */}
                  <div
                    id="qr-reader"
                    ref={containerRef}
                    style={{
                      width: '100%',
                      display: cameraError ? 'none' : 'block',
                    }}
                  />

                  {/* Overlay viseur */}
                  {scanning && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}>
                      <div style={{
                        width: '200px',
                        height: '200px',
                        border: '2px solid var(--gold)',
                        borderRadius: '16px',
                        opacity: 0.7,
                      }} />
                    </div>
                  )}

                  {/* Erreur caméra */}
                  {cameraError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '48px 24px',
                      textAlign: 'center',
                    }}>
                      <CameraOff size={40} color="#E89AA6" />
                      <p style={{ color: '#E89AA6', fontSize: '0.9rem' }}>
                        Accès caméra refusé
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
                        Autorisez la caméra dans les paramètres Safari ou utilisez la recherche manuelle
                      </p>
                      <button
                        onClick={() => setMode('manual')}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '100px',
                          border: '1px solid rgba(201,169,110,0.4)',
                          background: 'rgba(201,169,110,0.1)',
                          color: 'var(--gold-light)',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Utiliser la recherche manuelle
                      </button>
                    </div>
                  )}
                </div>

                {/* Erreur scan */}
                {scanError && (
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(184,80,96,0.1)',
                    border: '1px solid rgba(184,80,96,0.3)',
                    borderRadius: '12px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ color: '#E89AA6', fontSize: '0.85rem' }}>{scanError}</p>
                    <button
                      onClick={reset}
                      style={{
                        marginTop: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Réessayer →
                    </button>
                  </div>
                )}

                {scanning && !scanError && (
                  <p style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: '0.78rem',
                    marginTop: '8px',
                  }}>
                    Pointez la caméra vers le QR Code de l&apos;invité
                  </p>
                )}
              </div>
            )}

            {/* Mode manuel */}
            {mode === 'manual' && (
              <ManualGuestSearch
                eventId={event.id}
                onSelectGuest={guest => setGuest(guest as GuestInfo)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}