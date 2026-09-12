/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrientationClient from '@/components/admin/OrientationClient'

export default async function OrientationPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const supabase = await createClient()
  const db = supabase as any

  const [{ data: event }, { data: tables }, { data: arrivals }] = await Promise.all([
    db.from('events').select('id, groom_name, bride_name, room_map_url').eq('id', eventId).single(),
    db.from('guest_tables').select('id, name, category, side, position_x, position_y').eq('event_id', eventId),
    db.from('checkin_logs')
      .select('id, performed_at, orientation_status, guests(id, full_name, side, is_couple, guest_tables(id, name, category, side, position_x, position_y))')
      .eq('event_id', eventId).eq('action', 'checkin').order('performed_at', { ascending: false }).limit(60),
  ])

  if (!event) notFound()
  return <OrientationClient event={event} tables={tables ?? []} arrivals={arrivals ?? []} />
}
