import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const supabase = createAdminClient()
  const db       = supabase as any

  // Chercher l'utilisateur par access_token — sans join
  const { data: eventUser, error: fetchError } = await db
    .from('event_users')
    .select('*')
    .eq('access_token', token)
    .single()

  console.log('TOKEN:', token)
  console.log('EVENT USER:', eventUser)
  console.log('FETCH ERROR:', fetchError)

  if (!eventUser) {
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  const redirectTo = `${request.nextUrl.origin}/admin/auth/callback?next=/admin/events/${eventUser.event_id}/${
    eventUser.role === 'protocole' ? 'scan' : 'guests'
  }`

  // Générer un Magic Link via admin API
  const { data, error } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email: eventUser.email,
    options: { redirectTo },
  })

  console.log('MAGIC LINK DATA:', data)
  console.log('MAGIC LINK ERROR:', error)

  if (error || !data?.properties?.action_link) {
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  // Mettre à jour last_login_at
  await db
    .from('event_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', eventUser.id)

  return NextResponse.redirect(data.properties.action_link)
}