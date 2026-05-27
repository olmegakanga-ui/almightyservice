import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SeatingClient from '@/components/admin/SeatingClient'

export default async function SeatingPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, groom_name, bride_name')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  const { data: tables } = await supabase
    .from('guest_tables')
    .select('*')
    .eq('event_id', eventId)
    .order('side', { ascending: true })
    .order('name', { ascending: true })

  const { data: guests } = await supabase
    .from('guests')
    .select('id, full_name, table_id, side, checked_in, checked_in_at, rsvp_responses(status)')
    .eq('event_id', eventId)

  return (
    <SeatingClient
      event={event}
      tables={tables ?? []}
      guests={guests ?? []}
    />
  )
}