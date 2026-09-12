/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const { eventId, backgroundUrl, positions } = await request.json()
    if (!eventId || !positions || typeof positions !== 'object') return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const db = supabase as any
    const [{ data: eventAccess }, { data: superadminAccess }] = await Promise.all([
      db.from('event_users').select('role').eq('event_id', eventId).eq('email', user.email).maybeSingle(),
      db.from('event_users').select('id').eq('email', user.email).eq('role', 'superadmin').limit(1).maybeSingle(),
    ])

    const canManageLayout = superadminAccess || ['superadmin', 'couple'].includes(eventAccess?.role)
    if (!canManageLayout) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    // L'utilisateur est autorisé ci-dessus. Les écritures passent par le client
    // serveur afin que le superadmin global ne soit pas bloqué par une RLS liée
    // uniquement à l'événement courant.
    const adminDb = createAdminClient() as any

    const { error: eventError } = await adminDb.from('events').update({ room_map_url: backgroundUrl || null }).eq('id', eventId)
    if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

    const updates = Object.entries(positions as Record<string, { x: number; y: number }>).map(([id, point]) =>
      adminDb.from('guest_tables').update({ position_x: point.x, position_y: point.y }).eq('id', id).eq('event_id', eventId)
    )
    const results = await Promise.all(updates)
    const failed = results.find(result => result.error)
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
