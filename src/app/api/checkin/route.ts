/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const db = supabase as any

    const { data: guest, error: guestError } = await db
      .from('guests')
      .select(`
        *,
        guest_tables ( name, category, capacity ),
        rsvp_responses ( status ),
        drink_selections ( drink_name, drink_category )
      `)
      .eq('invitation_token', token)
      .single()

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