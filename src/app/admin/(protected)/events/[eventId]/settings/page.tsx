import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SettingsClient from '@/components/admin/SettingsClient'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase    = await createClient()

  const { data: event } = await (supabase as any)
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  return <SettingsClient event={event} />
}