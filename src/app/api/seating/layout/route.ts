/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const { eventId, backgroundUrl, positions } = await request.json()
    if (!eventId || !positions || typeof positions !== 'object') return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const db = supabase as any
    const { data: access } = await db.from('event_users').select('role').eq('event_id', eventId).eq('email', user.email).single()
    if (!access || !['superadmin', 'couple'].includes(access.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { error: eventError } = await db.from('events').update({ room_map_url: backgroundUrl || null }).eq('id', eventId)
    if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

    const updates = Object.entries(positions as Record<string, { x: number; y: number }>).map(([id, point]) =>
      db.from('guest_tables').update({ position_x: point.x, position_y: point.y }).eq('id', id).eq('event_id', eventId)
    )
    const results = await Promise.all(updates)
    const failed = results.find(result => result.error)
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
