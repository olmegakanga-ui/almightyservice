'use client'

import { useState } from 'react'
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

  const goldColor  = event.themeColor         || '#C9A96E'
  const goldLight  = event.themeColorSecondary || '#D4B483'
  const goldBorder = goldColor + '40'
  const goldSubtle = goldColor + '15'

  return (
    <>
      {/* Animation d'ouverture */}
      {!introDone && (
        <EnvelopeIntro
          groomName={event.groomName}
          brideName={event.brideName}
          guestName={guest.fullName}
          themeColor={goldColor}
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

      {/* Contenu avec couleurs dynamiques */}
      <main
        style={{
          position:  'relative',
          zIndex:    2,
          minHeight: '100vh',
          opacity:   introDone ? 1 : 0,
          transition:'opacity 0.8s ease',
          '--gold':        goldColor,
          '--gold-light':  goldLight,
          '--gold-border': goldBorder,
          '--gold-subtle': goldSubtle,
        } as React.CSSProperties}
      >
        <HeroSection event={event} guest={guest} />
        <Divider />
        <CountdownSection eventDate={event.eventDate} />
        <Divider />
        <InvitationCardSection event={event} guest={guest} />
        <Divider />
        <RsvpSection
          deadline={event.rsvpDeadline}
          guestId={guest.id}
          eventId={event.id}
          initialStatus={guest.rsvpStatus}
        />
        <Divider />
        <QRCodeSection
          guestId={guest.id}
          guestName={guest.fullName}
          tableName={guest.tableName}
          invitationToken={guest.invitationToken}
          eventTitle={event.groomName + ' & ' + event.brideName}
          eventId={event.id}
        />
        <Divider />
        <DrinksSection
          categories={event.drinkOptions}
          guestId={guest.id}
          eventId={event.id}
          initialSelected={guest.selectedDrinks}
        />
        <Divider />
        <GuestbookSection
          guestId={guest.id}
          eventId={event.id}
          guestName={guest.fullName}
          initialMessage={guest.guestbookMessage}
        />
        <Divider />
        <GiftSection
          guestId={guest.id}
          eventId={event.id}
          initialChoice={guest.giftChoice}
        />
        <Divider />
        <MapSection
          venueName={event.venueName}
          venueAddress={event.venueAddress}
          lat={event.venueLat}
          lng={event.venueLng}
        />
        <FooterSection event={event} />
      </main>
    </>
  )
}