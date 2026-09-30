'use client'

import React, { useState, useEffect, useRef } from 'react'
import AnimatedInvitation from '@/components/invitation/AnimatedInvitation'
import EnvelopeIntro from '@/components/invitation/EnvelopeIntro'
import FloralIntro from '@/components/invitation/FloralIntro'
import { EventData, GuestData } from '@/types/invitation'
import HeroSection from '@/components/invitation/HeroSection'
import FloralHeroSection from '@/components/invitation/FloralHeroSection'
import CountdownSection from '@/components/invitation/CountdownSection'
import InvitationCardSection from '@/components/invitation/InvitationCardSection'
import RsvpSection from '@/components/invitation/RsvpSection'
import QRCodeSection from '@/components/invitation/QRCodeSection'
import DrinksSection from '@/components/invitation/DrinksSection'
import GuestbookSection from '@/components/invitation/GuestbookSection'
import GiftSection from '@/components/invitation/GiftSection'
import DressCodeSection from '@/components/invitation/DressCodeSection'
import GallerySection from '@/components/invitation/GallerySection'
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

  const goldColor  = event.themeColor          || '#C9A96E'
  const goldLight  = event.themeColorSecondary || '#D4B483'
  const goldBorder = goldColor + '40'
  const goldSubtle = goldColor + '15'

  // ── Initialiser l'audio ───────────────────────────────────
  useEffect(() => {
    if (!event.musicUrl) return

    const audio       = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src         = event.musicUrl
    audio.loop        = true
    audio.volume      = (event.musicVolume ?? 30) / 100
    audio.preload     = 'auto'
    audioRef.current  = audio

    return () => { audio.pause(); audio.src = '' }
  }, [event.musicUrl, event.musicVolume])

  // ── Démarrer au premier clic ──────────────────────────────
  useEffect(() => {
    if (!event.musicUrl || started) return

    const handler = () => {
      const audio = audioRef.current
      if (!audio) return
      audio.play()
        .then(() => setStarted(true))
        .catch(err => console.error('Audio play failed:', err))
    }

    document.addEventListener('click',      handler, { once: true })
    document.addEventListener('touchstart', handler, { once: true })

    return () => {
      document.removeEventListener('click',      handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [event.musicUrl, started])

  if (event.presentationStyle === 'animated') return <AnimatedInvitation event={event} />

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
          giftPreferenceMessage={event.giftPreferenceMessage}
          showGiftPreferenceMessage={event.showGiftPreferenceMessage}
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
    dresscode: (
      <React.Fragment key="dresscode">
        <DressCodeSection
          dressCode={event.dressCode}
          dressColors={event.dressColors}
        />
        <Divider />
      </React.Fragment>
    ),
    gallery: (
      <React.Fragment key="gallery">
        <GallerySection
          images={event.galleryImages}
          groomName={event.groomName}
          brideName={event.brideName}
        />
        <Divider />
      </React.Fragment>
    ),
  }

  // La liste vient du serveur, qui a déjà appliqué le repli par défaut.
  // Un tableau vide signifie « toutes les sections optionnelles désactivées »
  // et doit être respecté tel quel.
  const order = Array.isArray(event.sectionsOrder) ? event.sectionsOrder : []

  return (
    <>
      {/* Animation d'ouverture */}
      {!introDone && (
        event.presentationStyle === 'floral' ? <FloralIntro
          groomName={event.groomName}
          brideName={event.brideName}
          guestName={guest.fullName}
          eventDate={event.eventDate}
          venueName={event.venueName}
          photoUrl={event.galleryImages[0] || event.backgroundImageUrl || null}
          showCouple={event.envelopeShowCouple}
          showBranding={event.showBranding}
          onComplete={() => setIntroDone(true)}
        /> : <EnvelopeIntro
          groomName={event.groomName}
          brideName={event.brideName}
          guestName={guest.fullName}
          themeColor={goldColor}
          themeColorSecondary={goldLight}
          eventDate={event.eventDate}
          venueName={event.venueName}
          envelopeMessage={event.envelopeMessage}
          showCouple={event.envelopeShowCouple}
          showBranding={event.showBranding}
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
          backgroundImage:    event.presentationStyle === 'floral'
            ? "url('/images/floral-invitation-v2.webp')"
            : 'url(' + event.backgroundImageUrl + ')',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
        }}
      >
        <div style={{
          position:   'absolute',
          inset:      0,
          background: event.presentationStyle === 'floral' ? 'rgba(248,226,218,.68)' : `linear-gradient(160deg,
                        color-mix(in srgb, ${goldColor} 26%, rgba(0,0,0,0.80)) 0%,
                        color-mix(in srgb, ${goldLight} 22%, rgba(0,0,0,0.62)) 50%,
                        color-mix(in srgb, ${goldColor} 28%, rgba(0,0,0,0.84)) 100%)`,
        }} />
      </div>

      {/* Grain cinématique */}
      <div
        aria-hidden
        className={event.presentationStyle === 'floral' ? '' : 'grain-overlay'}
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Contenu */}
      <main
        className={event.presentationStyle === 'floral' ? 'floral-theme' : undefined}
        style={{
          position:   'relative',
          zIndex:     2,
          minHeight:  '100vh',
          opacity:    introDone ? 1 : 0,
          transition: 'opacity 0.8s ease',
          '--gold':        event.presentationStyle === 'floral' ? '#9c6572' : goldColor,
          '--gold-light':  event.presentationStyle === 'floral' ? '#80515e' : goldLight,
          '--gold-border': event.presentationStyle === 'floral' ? '#d7adb6' : goldBorder,
          '--gold-subtle': event.presentationStyle === 'floral' ? '#f4d9dd' : goldSubtle,
        } as React.CSSProperties}
      >
        {event.presentationStyle === 'floral' && <style>{`
          .floral-theme { color:#63494e; background:linear-gradient(180deg,#faeae4b0,#f8e3dccc); }
          .floral-theme section:not(.floral-hero),.floral-theme footer {
            max-width:880px; margin:18px auto; border:1px solid #e9c8c7;
            border-radius:26px; background:#fff9f2e8; box-shadow:0 10px 35px #9c6d6c20;
            overflow:hidden;
          }
          .floral-theme section:not(.floral-hero) [style*="color: white"],
          .floral-theme footer [style*="color: white"],
          .floral-theme section:not(.floral-hero) [style*="color: rgba(255, 255, 255"],
          .floral-theme footer [style*="color: rgba(255, 255, 255"],
          .floral-theme section:not(.floral-hero) [style*="color: rgba(255,255,255"],
          .floral-theme footer [style*="color: rgba(255,255,255"] {
            color:#664e53!important; text-shadow:none!important;
          }
          .floral-theme section:not(.floral-hero) [style*="background: rgba(0, 0, 0"],
          .floral-theme footer [style*="background: rgba(0, 0, 0"],
          .floral-theme section:not(.floral-hero) [style*="background: rgba(0,0,0"],
          .floral-theme footer [style*="background: rgba(0,0,0"] {
            background:rgba(255,250,246,.72)!important;
          }
          .floral-theme section:not(.floral-hero) textarea,
          .floral-theme section:not(.floral-hero) input {
            color:#5e4449!important; background:#fffaf7!important;
          }
          .floral-theme .label-overline { color:#946771!important; }
          .floral-theme .glass,.floral-theme .glass-light,.floral-theme .glass-strong {
            background:rgba(255,250,247,.84)!important; border-color:#e7c6c4!important;
          }
          .floral-theme .divider-gold { opacity:.45; }
          @media(max-width:920px) { .floral-theme section:not(.floral-hero),.floral-theme footer { margin:14px 12px; } }
        `}</style>}
        {/* Hero — toujours en premier */}
        {event.presentationStyle === 'floral'
          ? <FloralHeroSection event={event} guest={guest} />
          : <HeroSection event={event} guest={guest} />}
        <Divider />

        {/* Sections dans l'ordre configuré */}
        {order.map(key => SECTIONS[key] ?? null)}

        {/* Footer — toujours en dernier */}
        <FooterSection event={event} />
      </main>
    </>
  )
}
