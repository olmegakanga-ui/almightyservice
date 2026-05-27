import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WhatsAppClient from '@/components/admin/WhatsAppClient'

export default async function WhatsAppPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createClient()

  const { data: event } = await (supabase as any)
    .from('events')
    .select('id, groom_name, bride_name, event_date')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  const { data: guests } = await (supabase as any)
    .from('guests')
    .select('id, full_name, phone, side, rsvp_responses(status)')
    .eq('event_id', eventId)
    .order('full_name')

  const { data: messages } = await (supabase as any)
    .from('whatsapp_messages')
    .select('id, type, status, sent_at, guests(full_name)')
    .eq('event_id', eventId)
    .order('sent_at', { ascending: false })
    .limit(50)

  return (
    <WhatsAppClient
      event={event}
      guests={guests ?? []}
      recentMessages={messages ?? []}
    />
  )
}