import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AccessClient from '@/components/admin/AccessClient'

export default async function AccessPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase    = await createClient()

  const { data: event } = await (supabase as any)
    .from('events')
    .select('id, groom_name, bride_name')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  const { data: users } = await (supabase as any)
    .from('event_users')
    .select('*')
    .eq('event_id', eventId)
    .order('role', { ascending: true })

  return <AccessClient event={event} initialUsers={users ?? []} />
}