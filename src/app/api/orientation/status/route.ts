/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const { logId, eventId, status } = await request.json()
    if (!logId || !eventId || !['new', 'claimed', 'seated'].includes(status)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const db = supabase as any
    const { data: access } = await db.from('event_users').select('id').eq('event_id', eventId).eq('email', user.email).single()
    if (!access) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { error } = await db.from('checkin_logs').update({
      orientation_status: status,
      orientation_updated_at: new Date().toISOString(),
      orientation_by: user.email,
    }).eq('id', logId).eq('event_id', eventId).eq('action', 'checkin')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
