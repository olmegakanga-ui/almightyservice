/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query   = searchParams.get('q') ?? ''
    const eventId = searchParams.get('eventId') ?? ''

    if (!eventId || query.length < 2) {
      return NextResponse.json({ guests: [] })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { data: guests } = await db
      .from('guests')
      .select(`
        id, full_name, phone, side, is_couple,
        checked_in, checked_in_at,
        guest_tables ( name, category ),
        rsvp_responses ( status ),
        drink_selections ( drink_name )
      `)
      .eq('event_id', eventId)
      .or(
        'full_name.ilike.%' + query + '%,' +
        'phone.ilike.%' + query + '%'
      )
      .limit(10)

    return NextResponse.json(
      {
        guests: guests?.map((g: any) => ({
          id:          g.id,
          fullName:    g.full_name,
          phone:       g.phone,
          side:        g.side,
          isCouple:    g.is_couple,
          checkedIn:   g.checked_in ?? false,
          checkedInAt: g.checked_in_at,
          table:       g.guest_tables ? {
            name:     g.guest_tables.name,
            category: g.guest_tables.category,
          } : null,
          rsvpStatus: g.rsvp_responses?.status ?? 'pending',
          drinks:     g.drink_selections?.map(
            (d: { drink_name: string }) => d.drink_name
          ) ?? [],
        })) ?? [],
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )

  } catch (err) {
    console.error('Erreur search:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}