import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInvitationByToken } from '@/lib/invitation'
import InvitationWrapper from '@/components/invitation/InvitationWrapper'
import { EventData, GuestData } from '@/types/invitation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const data      = await getInvitationByToken(token)

  if (!data) return { title: 'Invitation' }

  const title       = `${data.groomName} & ${data.brideName} — Invitation`
  const description = `Vous êtes cordialement invité(e) au mariage de ${data.groomName} & ${data.brideName}`
  const image       = data.backgroundImageUrl

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type:   'website',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [image],
    },
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data      = await getInvitationByToken(token)

  if (!data) notFound()

  const event: EventData = {
    id:                  data.eventId,
    groomName:           data.groomName,
    brideName:           data.brideName,
    eventDate:           data.eventDate,
    venueName:           data.venueName,
    venueAddress:        data.venueAddress,
    venueLat:            data.venueLat,
    venueLng:            data.venueLng,
    backgroundImageUrl:  data.backgroundImageUrl,
    invitationText:      data.invitationText,
    programItems:        data.programItems,
    rsvpDeadline:        data.rsvpDeadline,
    drinkOptions:        data.drinkOptions,
    themeColor:          data.themeColor,
    themeColorSecondary: data.themeColorSecondary,
    musicUrl:            data.musicUrl,
    musicVolume:         data.musicVolume,
    giftOptions:         data.giftOptions,
    sectionsOrder:       data.sectionsOrder,
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

  return <InvitationWrapper event={event} guest={guest} />
}