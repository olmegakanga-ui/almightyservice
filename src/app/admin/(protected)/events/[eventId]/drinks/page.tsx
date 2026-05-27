import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DrinksReportClient from '@/components/admin/DrinksReportClient'

export default async function DrinksPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, groom_name, bride_name, drink_options_json')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  const { data: selections } = await supabase
    .from('drink_selections')
    .select('drink_name, drink_category, guests(full_name, side)')
    .eq('event_id', eventId)

  return <DrinksReportClient event={event} selections={selections ?? []} />
}