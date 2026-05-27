/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, giftType } = await request.json()

    if (!guestId || !eventId || !giftType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (!['envelope', 'present'].includes(giftType)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { error } = await db
      .from('gift_choices')
      .upsert(
        {
          guest_id:  guestId,
          event_id:  eventId,
          gift_type: giftType,
        },
        { onConflict: 'guest_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, giftType })

  } catch (err) {
    console.error('Erreur API gift:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}