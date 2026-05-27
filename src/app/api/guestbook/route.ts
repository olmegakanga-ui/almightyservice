/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, message } = await request.json()

    if (!guestId || !eventId || !message?.trim()) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message trop long' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { error } = await db
      .from('guestbook_entries')
      .upsert(
        {
          guest_id: guestId,
          event_id: eventId,
          message:  message.trim(),
        },
        { onConflict: 'guest_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Erreur API guestbook:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}