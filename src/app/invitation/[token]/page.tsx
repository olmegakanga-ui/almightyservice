import { notFound } from 'next/navigation'
import { getInvitationByToken } from '@/lib/invitation'
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
import { EventData, GuestData } from '@/types/invitation'

const Divider = () => (
  <div
    style={{
      height:     '1px',
      background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)',
      margin:     '0 48px',
    }}
  />
)

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const data = await getInvitationByToken(token)

  if (!data) {
    notFound()
  }

  const event: EventData = {
    id:                 data.eventId,
    groomName:          data.groomName,
    brideName:          data.brideName,
    eventDate:          data.eventDate,
    venueName:          data.venueName,
    venueAddress:       data.venueAddress,
    venueLat:           data.venueLat,
    venueLng:           data.venueLng,
    backgroundImageUrl: data.backgroundImageUrl,
    invitationText:     data.invitationText,
    programItems:       data.programItems,
    rsvpDeadline:       data.rsvpDeadline,
    drinkOptions:       data.drinkOptions,
    themeColor:         data.themeColor,
  }

  const guest: GuestData = {
    id:               data.guestId,
    fullName:         data.guestFullName,
    tableId:          data.guestTableId,
    tableName:        data.guestTableName,
    side:             data.guestSide,
    invitationToken:  data.invitationToken,
    rsvpStatus:       data.rsvpStatus,
    selectedDrinks:   data.selectedDrinks,
    guestbookMessage: data.guestbookMessage,
    giftChoice:       data.giftChoice,
  }

  return (
    <>
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
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(160deg, rgba(13,11,9,0.55) 0%, rgba(13,11,9,0.35) 50%, rgba(13,11,9,0.65) 100%)',
          }}
        />
      </div>

      {/* Grain cinématique */}
      <div
        aria-hidden
        className="grain-overlay"
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Contenu */}
      <main style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>
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