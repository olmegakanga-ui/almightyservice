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

  const { data: eventUser, error: fetchError } = await db
    .from('event_users')
    .select('*')
    .eq('access_token', token)
    .single()

  if (fetchError || !eventUser) {
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  const next = `/admin/events/${eventUser.event_id}/${
    eventUser.role === 'protocole' ? 'scan' : 'guests'
  }`

  // Générer OTP et le vérifier directement côté serveur
  const { data, error } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email: eventUser.email,
    options: {
      redirectTo: `${request.nextUrl.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data?.properties?.action_link) {
    console.error('Erreur génération lien:', error)
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  // Extraire le hashed_token depuis action_link
  const actionUrl   = new URL(data.properties.action_link)
  const hashedToken = actionUrl.searchParams.get('token')
  const type        = actionUrl.searchParams.get('type') ?? 'magiclink'

  if (!hashedToken) {
    return NextResponse.redirect(new URL('/admin/login?reason=invalid', request.url))
  }

  // Rediriger directement vers notre callback avec le token
  const callbackUrl = new URL('/admin/auth/callback', request.nextUrl.origin)
  callbackUrl.searchParams.set('token_hash', hashedToken)
  callbackUrl.searchParams.set('type', type)
  callbackUrl.searchParams.set('next', next)

  // Mettre à jour last_login_at
  await db
    .from('event_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', eventUser.id)

  return NextResponse.redirect(callbackUrl)
}