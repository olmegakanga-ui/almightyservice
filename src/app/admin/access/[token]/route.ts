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

  // Chercher l'utilisateur par access_token
  const { data: eventUser } = await db
    .from('event_users')
    .select('*, events(status)')
    .eq('access_token', token)
    .single()

  if (!eventUser) {
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  // Vérifier que le mariage est encore actif
  if (eventUser.events?.status !== 'active') {
    return NextResponse.redirect(new URL('/admin/login?reason=expired', request.url))
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

  if (error || !data?.properties?.action_link) {
    console.error('Erreur génération lien:', error)
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Mettre à jour last_login_at
  await db
    .from('event_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', eventUser.id)

  return NextResponse.redirect(data.properties.action_link)
}