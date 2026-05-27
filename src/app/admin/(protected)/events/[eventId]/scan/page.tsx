import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ScanClient from '@/components/admin/ScanClient'

export default async function ScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, groom_name, bride_name, status')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  return <ScanClient event={event} />
}