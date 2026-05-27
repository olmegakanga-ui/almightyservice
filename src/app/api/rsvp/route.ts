/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, status } = await request.json()

    if (!guestId || !eventId || !status) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (!['confirmed', 'declined', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { error } = await db
      .from('rsvp_responses')
      .upsert(
        {
          guest_id:     guestId,
          event_id:     eventId,
          status:       status,
          responded_at: status !== 'pending' ? new Date().toISOString() : null,
        },
        { onConflict: 'guest_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status })

  } catch (err) {
    console.error('Erreur API RSVP:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}