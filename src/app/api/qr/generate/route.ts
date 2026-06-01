import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signQRToken } from '@/lib/qr-jwt'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId } = await request.json()

    if (!guestId || !eventId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db       = supabase as any

    const { data: guest } = await db
      .from('guests')
      .select('id, invitation_token, event_id')
      .eq('id', guestId)
      .eq('event_id', eventId)
      .single()

    if (!guest) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    const jwt = await signQRToken({
      token:   guest.invitation_token,
      guestId: guest.id,
      eventId: guest.event_id,
    })

    return NextResponse.json({ success: true, jwt })

  } catch (err) {
    console.error('Erreur génération QR JWT:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}