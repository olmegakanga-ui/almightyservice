import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TablesClient from '@/components/admin/TablesClient'

export default async function TablesPage({
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
    .order('name', { ascending: true })

  const { data: guests } = await supabase
    .from('guests')
    .select('id, full_name, table_id, side, rsvp_responses(status)')
    .eq('event_id', eventId)
    .order('full_name', { ascending: true })

  return (
    <TablesClient
      event={event}
      initialTables={tables ?? []}
      guests={guests ?? []}
    />
  )
}