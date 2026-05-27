import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactionsClient from '@/components/admin/ReactionsClient'

export default async function ReactionsPage({
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

  const { data: rsvps } = await supabase
    .from('rsvp_responses')
    .select('status, guests(full_name, side)')
    .eq('event_id', eventId)

  return <ReactionsClient event={event} rsvps={rsvps ?? []} />
}