import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GuestsClient from '@/components/admin/GuestsClient'

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createClient()

  // Charger l'événement
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  // Charger les invités avec leur table et leur RSVP
  const { data: guests } = await supabase
    .from('guests')
    .select(`
      *,
      guest_tables ( name, category ),
      rsvp_responses ( status )
    `)
    .eq('event_id', eventId)
    .order('full_name', { ascending: true })

  // Charger les tables pour les selects
  const { data: tables } = await supabase
    .from('guest_tables')
    .select('*')
    .eq('event_id', eventId)
    .order('name', { ascending: true })

  return (
    <GuestsClient
      event={event}
      initialGuests={guests ?? []}
      tables={tables ?? []}
    />
  )
}