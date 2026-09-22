import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/admin/SettingsClient'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const supabase    = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/admin/login')

  const adminDb = createAdminClient()
  const { data: superadmin } = await adminDb
    .from('event_users')
    .select('id')
    .eq('email', user.email)
    .eq('role', 'superadmin')
    .limit(1)
    .maybeSingle()

  if (!superadmin) redirect(`/admin/events/${eventId}/guests`)

  const { data: event } = await adminDb
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event) notFound()

  return <SettingsClient event={event} />
}
