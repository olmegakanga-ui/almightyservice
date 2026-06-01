/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import StatsClient from '@/components/admin/StatsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const db       = supabase as any

  // Tous les événements
  const { data: events } = await db
    .from('events')
    .select('id, groom_name, bride_name, event_date, status')
    .order('event_date', { ascending: true })

  // Tous les invités
  const { data: guests } = await db
    .from('guests')
    .select('id, event_id, checked_in, rsvp_responses(status)')

  // Tous les messages WhatsApp
  const { data: messages } = await db
    .from('whatsapp_messages')
    .select('id, event_id, status, type, sent_at')
    .order('sent_at', { ascending: false })
    .limit(100)

  // Toutes les boissons
  const { data: drinks } = await db
    .from('drink_selections')
    .select('drink_name, event_id')

  return (
    <StatsClient
      events={events ?? []}
      guests={guests ?? []}
      messages={messages ?? []}
      drinks={drinks ?? []}
    />
  )
}