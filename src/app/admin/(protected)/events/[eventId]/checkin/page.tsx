import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CheckinDashboardClient from '@/components/admin/CheckinDashboardClient'

export default async function CheckinPage({
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

  const { data: guests } = await supabase
    .from('guests')
    .select(`
      id, full_name, side, checked_in, checked_in_at,
      guest_tables ( name ),
      rsvp_responses ( status )
    `)
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false, nullsFirst: false })

  const { data: logs } = await supabase
    .from('checkin_logs')
    .select('performed_at, guests(full_name)')
    .eq('event_id', eventId)
    .eq('action', 'checkin')
    .order('performed_at', { ascending: false })
    .limit(10)

  return (
    <CheckinDashboardClient
      event={event}
      guests={guests ?? []}
      recentLogs={logs ?? []}
    />
  )
}