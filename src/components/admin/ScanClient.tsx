'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, CameraOff, RefreshCw } from 'lucide-react'
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
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Démarre la caméra
  const startCamera = async () => {
    setScanError(null)
    setCameraError(false)
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      startQrDetection()
    } catch {
      setCameraError(true)
      setScanning(false)
    }
  }

  // Arrête la caméra
  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  // Détection QR via BarcodeDetector (API native navigateur)
  const startQrDetection = () => {
    if (!('BarcodeDetector' in window)) {
      setScanError('Ce navigateur ne supporte pas le scan QR natif. Utilisez la recherche manuelle.')
      stopCamera()
      return
    }

    // @ts-expect-error BarcodeDetector est une API expérimentale
    const detector = new BarcodeDetector({ formats: ['qr_code'] })

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return

      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length > 0) {
          const rawValue = codes[0].rawValue
          stopCamera()
          await processQrCode(rawValue)
        }
      } catch {
        // Continue scanning
      }
    }, 500)
  }

  // Traite le contenu du QR Code
  const processQrCode = async (raw: string) => {
    setScanError(null)
    try {
      // Le QR contient un JSON avec { guestId, token, name, table }
      let token: string

      try {
        const parsed = JSON.parse(raw)
        token = parsed.token ?? raw
      } catch {
        // Si ce n'est pas du JSON, on traite la valeur brute comme token
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

  // Sélection depuis la recherche manuelle
  const handleManualSelect = (g: GuestInfo) => {
    setGuest(g)
  }

  const reset = () => {
    setGuest(null)
    setScanError(null)
    if (mode === 'camera') {
      startCamera()
    }
  }

  useEffect(() => {
    if (mode === 'camera' && !guest) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [mode])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0B09',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header compact */}
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

        {/* Toggle mode */}
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

      {/* Contenu principal */}
      <div style={{ flex: 1, padding: '20px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>

        {/* Résultat invité */}
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
                <div style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#000',
                  aspectRatio: '1',
                  marginBottom: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
                    playsInline
                    muted
                  />

                  {/* Overlay viseur */}
                  {scanning && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '200px',
                        height: '200px',
                        border: '2px solid var(--gold)',
                        borderRadius: '16px',
                        opacity: 0.6,
                      }} />
                    </div>
                  )}

                  {/* Pas de caméra */}
                  {!scanning && !cameraError && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
                      <Camera size={40} color="rgba(255,255,255,0.2)" />
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Caméra inactive</p>
                    </div>
                  )}

                  {cameraError && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px', padding: '20px', textAlign: 'center' }}>
                      <CameraOff size={40} color="#E89AA6" />
                      <p style={{ color: '#E89AA6', fontSize: '0.85rem' }}>Accès caméra refusé</p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>Autorisez la caméra dans les paramètres du navigateur ou utilisez la recherche manuelle</p>
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
                  </div>
                )}

                {/* Boutons caméra */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!scanning && (
                    <button
                      onClick={startCamera}
                      style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '100px',
                        border: '1px solid rgba(201,169,110,0.4)',
                        background: 'rgba(201,169,110,0.1)',
                        color: 'var(--gold-light)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Camera size={16} /> Activer la caméra
                    </button>
                  )}

                  {scanning && (
                    <button
                      onClick={stopCamera}
                      style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '100px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <RefreshCw size={14} /> Redémarrer
                    </button>
                  )}
                </div>

                {/* Instruction */}
                {scanning && !scanError && (
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', marginTop: '12px' }}>
                    Pointez la caméra vers le QR Code de l&apos;invité
                  </p>
                )}
              </div>
            )}

            {/* Mode manuel */}
            {mode === 'manual' && (
              <ManualGuestSearch
                eventId={event.id}
                onSelectGuest={handleManualSelect}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}