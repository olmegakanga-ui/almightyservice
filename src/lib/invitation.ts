/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { DrinkCategory, ProgramItem } from '@/types/database.types'

export interface FullInvitationData {
  eventId:             string
  groomName:           string
  brideName:           string
  eventDate:           string
  venueName:           string
  venueAddress:        string
  venueLat:            number
  venueLng:            number
  backgroundImageUrl:  string
  invitationText:      string
  programItems:        ProgramItem[]
  rsvpDeadline:        string
  drinkOptions:        DrinkCategory[]
  themeColor:          string
  themeColorSecondary: string
  musicUrl:            string | null
  musicVolume:         number
  giftOptions:         string[]
  sectionsOrder:       string[]
  guestId:             string
  guestFullName:       string
  guestSide:           'HOMME' | 'FEMME'
  guestTableName:      string | null
  guestTableId:        string | null
  invitationToken:     string
  isCouple:            boolean
  rsvpStatus:          'pending' | 'confirmed' | 'declined'
  selectedDrinks:      string[]
  guestbookMessage:    string | null
  giftChoice:          'envelope' | 'present' | null
}

const DEFAULT_SECTIONS = ['countdown','card','rsvp','qrcode','drinks','guestbook','gift','map']

export async function getInvitationByToken(
  token: string
): Promise<FullInvitationData | null> {
  const supabase = await createClient()
  const db       = supabase as any

  const { data: guest, error: guestError } = await db
    .from('guests')
    .select('*')
    .eq('invitation_token', token)
    .single()

  if (guestError || !guest) {
    console.error('Invité non trouvé pour le token:', token, guestError)
    return null
  }

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

  let tableName: string | null = null
  if (guest.table_id) {
    const { data: table } = await db
      .from('guest_tables')
      .select('name')
      .eq('id', guest.table_id)
      .single()
    tableName = table?.name ?? null
  }

  const { data: rsvp }      = await db.from('rsvp_responses').select('status').eq('guest_id', guest.id).single()
  const { data: drinks }    = await db.from('drink_selections').select('drink_name').eq('guest_id', guest.id)
  const { data: guestbook } = await db.from('guestbook_entries').select('message').eq('guest_id', guest.id).single()
  const { data: gift }      = await db.from('gift_choices').select('gift_type').eq('guest_id', guest.id).single()

  const rawDrinks = event.drink_options_json
  const drinkOptions: DrinkCategory[] = Array.isArray(rawDrinks)
    ? rawDrinks.map((cat: any) => ({
        categoryName: cat.categoryName ?? cat.category ?? 'Boissons',
        drinks:       Array.isArray(cat.drinks) ? cat.drinks : [],
      }))
    : []

  return {
    eventId:             event.id,
    groomName:           event.groom_name,
    brideName:           event.bride_name,
    eventDate:           event.event_date,
    venueName:           event.venue_name,
    venueAddress:        event.venue_address,
    venueLat:            Number(event.venue_lat),
    venueLng:            Number(event.venue_lng),
    backgroundImageUrl:  event.background_image_url,
    invitationText:      event.invitation_text,
    programItems:        event.program_json as ProgramItem[],
    rsvpDeadline:        event.rsvp_deadline,
    drinkOptions,
    themeColor:          event.theme_color_primary   ?? '#C9A96E',
    themeColorSecondary: event.theme_color_secondary ?? '#D4B483',
    musicUrl:            event.music_url             ?? null,
    musicVolume:         event.music_volume          ?? 30,
    giftOptions:         Array.isArray(event.gift_options)    ? event.gift_options    : ['envelope','present'],
    sectionsOrder:       Array.isArray(event.sections_order)  ? event.sections_order  : DEFAULT_SECTIONS,
    guestId:             guest.id,
    guestFullName:       guest.full_name,
    guestSide:           guest.side,
    guestTableName:      tableName,
    guestTableId:        guest.table_id,
    invitationToken:     guest.invitation_token,
    isCouple:            guest.is_couple,
    rsvpStatus:          (rsvp?.status ?? 'pending') as 'pending' | 'confirmed' | 'declined',
    selectedDrinks:      drinks?.map((d: { drink_name: string }) => d.drink_name) ?? [],
    guestbookMessage:    guestbook?.message ?? null,
    giftChoice:          (gift?.gift_type ?? null) as 'envelope' | 'present' | null,
  }
}