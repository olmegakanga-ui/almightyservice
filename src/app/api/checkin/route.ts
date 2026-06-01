/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyQRToken } from '@/lib/qr-jwt'

export async function POST(request: NextRequest) {
  try {
    const { token, eventId } = await request.json()

    if (!token || !eventId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db       = supabase as any

    let invitationToken = token
    let guestId: string | null = null

    // Essayer de décoder comme JWT d'abord
    const jwtPayload = await verifyQRToken(token)

    if (jwtPayload) {
      // ✅ JWT valide — utiliser les données du payload
      if (jwtPayload.eventId !== eventId) {
        return NextResponse.json(
          { error: 'QR Code invalide pour cet événement' },
          { status: 403 }
        )
      }
      invitationToken = jwtPayload.token
      guestId         = jwtPayload.guestId
    }
    // Sinon on utilise le token brut (compatibilité ascendante)

    // Charger l'invité
    let query = db
      .from('guests')
      .select(`
        *,
        guest_tables ( name, category, capacity ),
        rsvp_responses ( status ),
        drink_selections ( drink_name, drink_category )
      `)

    if (guestId) {
      query = query.eq('id', guestId)
    } else {
      query = query.eq('invitation_token', invitationToken)
    }

    const { data: guest, error: guestError } = await query.single()

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'QR Code invalide — invité introuvable' },
        { status: 404 }
      )
    }

    if (guest.event_id !== eventId) {
      return NextResponse.json(
        { error: 'Ce QR Code appartient à un autre mariage' },
        { status: 403 }
      )
    }

    const { data: event } = await db
      .from('events')
      .select('status, groom_name, bride_name')
      .eq('id', eventId)
      .single()

    if (!event || event.status !== 'active') {
      return NextResponse.json(
        { error: "Cet événement n'est pas actif" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        guest: {
          id:          guest.id,
          fullName:    guest.full_name,
          phone:       guest.phone,
          side:        guest.side,
          isCouple:    guest.is_couple,
          label:       guest.label,
          checkedIn:   guest.checked_in ?? false,
          checkedInAt: guest.checked_in_at,
          checkedInBy: guest.checked_in_by,
          table:       guest.guest_tables ? {
            name:     guest.guest_tables.name,
            category: guest.guest_tables.category,
            capacity: guest.guest_tables.capacity,
          } : null,
          rsvpStatus: guest.rsvp_responses?.status ?? 'pending',
          drinks:     guest.drink_selections?.map(
            (d: { drink_name: string }) => d.drink_name
          ) ?? [],
          isJwtVerified: !!jwtPayload, // ✅ indique si le QR est signé
        },
        event: {
          groomName: event.groom_name,
          brideName: event.bride_name,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )

  } catch (err) {
    console.error('Erreur API scan:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}