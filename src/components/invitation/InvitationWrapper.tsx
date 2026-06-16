'use client'

import React, { useState, useEffect, useRef } from 'react'
import EnvelopeIntro from '@/components/invitation/EnvelopeIntro'
import { EventData, GuestData } from '@/types/invitation'
import HeroSection from '@/components/invitation/HeroSection'
import CountdownSection from '@/components/invitation/CountdownSection'
import InvitationCardSection from '@/components/invitation/InvitationCardSection'
import RsvpSection from '@/components/invitation/RsvpSection'
import QRCodeSection from '@/components/invitation/QRCodeSection'
import DrinksSection from '@/components/invitation/DrinksSection'
import GuestbookSection from '@/components/invitation/GuestbookSection'
import GiftSection from '@/components/invitation/GiftSection'
import MapSection from '@/components/invitation/MapSection'
import FooterSection from '@/components/invitation/FooterSection'

const Divider = () => (
  <div style={{
    height:     '1px',
    background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)',
    margin:     '0 48px',
  }} />
)

interface Props {
  event: EventData
  guest: GuestData
}

export default function InvitationWrapper({ event, guest }: Props) {
  const [introDone, setIntroDone] = useState(false)
  const [started, setStarted]     = useState(false)
  const audioRef                  = useRef<HTMLAudioElement | null>(null)

  const goldColor  = event.themeColor         || '#C9A96E'
  const goldLight  = event.themeColorSecondary || '#D4B483'
  const goldBorder = goldColor + '40'
  const goldSubtle = goldColor + '15'

  // ── Initialiser l'audio ───────────────────────────────────
  useEffect(() => {
    if (!event.musicUrl) return
    const audio      = new Audio(event.musicUrl)
    audio.loop       = true
    audio.volume     = (event.musicVolume ?? 30) / 100
    audio.preload    = 'auto'
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [event.musicUrl, event.musicVolume])

  // ── Démarrer au premier clic ──────────────────────────────
  useEffect(() => {
    if (!event.musicUrl || started) return
    const handler = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error)
        setStarted(true)
      }
    }
    document.addEventListener('click',      handler, { once: true })
    document.addEventListener('touchstart', handler, { once: true })
    return () => {
      document.removeEventListener('click',      handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [event.musicUrl, started])

  // ── Sections dynamiques ───────────────────────────────────
  const SECTIONS: Record<string, React.ReactNode> = {
    countdown: (
      <React.Fragment key="countdown">
        <CountdownSection eventDate={event.eventDate} />
        <Divider />
      </React.Fragment>
    ),
    card: (
      <React.Fragment key="card">
        <InvitationCardSection event={event} guest={guest} />
        <Divider />
      </React.Fragment>
    ),
    rsvp: (
      <React.Fragment key="rsvp">
        <RsvpSection
          deadline={event.rsvpDeadline}
          guestId={guest.id}
          eventId={event.id}
          initialStatus={guest.rsvpStatus}
        />
        <Divider />
      </React.Fragment>
    ),
    qrcode: (
      <React.Fragment key="qrcode">
        <QRCodeSection
          guestId={guest.id}
          guestName={guest.fullName}
          tableName={guest.tableName}
          invitationToken={guest.invitationToken}
          eventTitle={event.groomName + ' & ' + event.brideName}
          eventId={event.id}
        />
        <Divider />
      </React.Fragment>
    ),
    drinks: (
      <React.Fragment key="drinks">
        <DrinksSection
          categories={event.drinkOptions}
          guestId={guest.id}
          eventId={event.id}
          initialSelected={guest.selectedDrinks}
        />
        <Divider />
      </React.Fragment>
    ),
    guestbook: (
      <React.Fragment key="guestbook">
        <GuestbookSection
          guestId={guest.id}
          eventId={event.id}
          guestName={guest.fullName}
          initialMessage={guest.guestbookMessage}
        />
        <Divider />
      </React.Fragment>
    ),
    gift: (
      <React.Fragment key="gift">
        <GiftSection
          guestId={guest.id}
          eventId={event.id}
          initialChoice={guest.giftChoice}
          giftOptions={event.giftOptions}
        />
        <Divider />
      </React.Fragment>
    ),
    map: (
      <React.Fragment key="map">
        <MapSection
          venueName={event.venueName}
          venueAddress={event.venueAddress}
          lat={event.venueLat}
          lng={event.venueLng}
        />
        <Divider />
      </React.Fragment>
    ),
  }

  const order = event.sectionsOrder?.length
    ? event.sectionsOrder
    : ['countdown','card','rsvp','qrcode','drinks','guestbook','gift','map']

  return (
    <>
      {/* Animation d'ouverture */}
      {!introDone && (
        <EnvelopeIntro
          groomName={event.groomName}
          brideName={event.brideName}
          guestName={guest.fullName}
          themeColor={goldColor}
          eventDate={event.eventDate}
          venueName={event.venueName}
          onComplete={() => setIntroDone(true)}
        />
      )}

      {/* Fond fixe */}
      <div
        aria-hidden
        style={{
          position:           'fixed',
          inset:              0,
          zIndex:             0,
          backgroundImage:    'url(' + event.backgroundImageUrl + ')',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
        }}
      >
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(160deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.82) 100%)',
        }} />
      </div>

      {/* Grain cinématique */}
      <div
        aria-hidden
        className="grain-overlay"
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Contenu */}
      <main
        style={{
          position:   'relative',
          zIndex:     2,
          minHeight:  '100vh',
          opacity:    introDone ? 1 : 0,
          transition: 'opacity 0.8s ease',
          '--gold':        goldColor,
          '--gold-light':  goldLight,
          '--gold-border': goldBorder,
          '--gold-subtle': goldSubtle,
        } as React.CSSProperties}
      >
        {/* Hero — toujours en premier */}
        <HeroSection event={event} guest={guest} />
        <Divider />

        {/* Sections dans l'ordre configuré */}
        {order.map(key => SECTIONS[key] ?? null)}

        {/* Footer — toujours en dernier */}
        <FooterSection event={event} />
      </main>
    </>
  )
}