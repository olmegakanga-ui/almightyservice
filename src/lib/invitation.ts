/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { DrinkCategory, ProgramItem } from '@/types/database.types'

export interface FullInvitationData {
  eventId: string
  groomName: string
  brideName: string
  eventDate: string
  venueName: string
  venueAddress: string
  venueLat: number
  venueLng: number
  backgroundImageUrl: string
  invitationText: string
  programItems: ProgramItem[]
  rsvpDeadline: string
  drinkOptions: DrinkCategory[]
  themeColor: string
  guestId: string
  guestFullName: string
  guestSide: 'HOMME' | 'FEMME'
  guestTableName: string | null
  guestTableId: string | null
  invitationToken: string
  isCouple: boolean
  rsvpStatus: 'pending' | 'confirmed' | 'declined'
  selectedDrinks: string[]
  guestbookMessage: string | null
  giftChoice: 'envelope' | 'present' | null
}

export async function getInvitationByToken(
  token: string
): Promise<FullInvitationData | null> {
  const supabase = await createClient()
  const db = supabase as any

  // 1. Chercher l'invité par token
  const { data: guest, error: guestError } = await db
    .from('guests')
    .select('*')
    .eq('invitation_token', token)
    .single()

  if (guestError || !guest) {
    console.error('Invité non trouvé pour le token:', token, guestError)
    return null
  }

  // 2. Charger l'événement lié
  const { data: event, error: eventError } = await db
    .from('events')
    .select('*')
    .eq('id', guest.event_id)
    .eq('status', 'active')
    .single()

  if (eventError || !event) {
    console.error('Événement non trouvé:', guest.event_id, eventError)
    return null
  }

  // 3. Charger la table de l'invité
  let tableName: string | null = null
  if (guest.table_id) {
    const { data: table } = await db
      .from('guest_tables')
      .select('name')
      .eq('id', guest.table_id)
      .single()
    tableName = table?.name ?? null
  }

  // 4. Charger le RSVP actuel
  const { data: rsvp } = await db
    .from('rsvp_responses')
    .select('status')
    .eq('guest_id', guest.id)
    .single()

  // 5. Charger les boissons sélectionnées
  const { data: drinks } = await db
    .from('drink_selections')
    .select('drink_name')
    .eq('guest_id', guest.id)

  // 6. Charger le livre d'or
  const { data: guestbook } = await db
    .from('guestbook_entries')
    .select('message')
    .eq('guest_id', guest.id)
    .single()

  // 7. Charger le choix de cadeau
  const { data: gift } = await db
    .from('gift_choices')
    .select('gift_type')
    .eq('guest_id', guest.id)
    .single()

  return {
    eventId:            event.id,
    groomName:          event.groom_name,
    brideName:          event.bride_name,
    eventDate:          event.event_date,
    venueName:          event.venue_name,
    venueAddress:       event.venue_address,
    venueLat:           Number(event.venue_lat),
    venueLng:           Number(event.venue_lng),
    backgroundImageUrl: event.background_image_url,
    invitationText:     event.invitation_text,
    programItems:       event.program_json as ProgramItem[],
    rsvpDeadline:       event.rsvp_deadline,
    drinkOptions:       event.drink_options_json as DrinkCategory[],
    themeColor:         event.theme_color_primary,
    guestId:            guest.id,
    guestFullName:      guest.full_name,
    guestSide:          guest.side,
    guestTableName:     tableName,
    guestTableId:       guest.table_id,
    invitationToken:    guest.invitation_token,
    isCouple:           guest.is_couple,
    rsvpStatus:         (rsvp?.status ?? 'pending') as 'pending' | 'confirmed' | 'declined',
    selectedDrinks:     drinks?.map((d: { drink_name: string }) => d.drink_name) ?? [],
    guestbookMessage:   guestbook?.message ?? null,
    giftChoice:         (gift?.gift_type ?? null) as 'envelope' | 'present' | null,
  }
}