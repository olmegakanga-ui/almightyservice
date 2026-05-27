import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GuestbookReportClient from '@/components/admin/GuestbookReportClient'

export default async function GuestbookPage({
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

  const { data: entries } = await supabase
    .from('guestbook_entries')
    .select('message, created_at, guests(full_name, side)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  return <GuestbookReportClient event={event} entries={entries ?? []} />
}