/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, drinks } = await request.json()

    if (!guestId || !eventId || !Array.isArray(drinks)) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (drinks.length > 2) {
      return NextResponse.json({ error: 'Maximum 2 boissons' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { error: deleteError } = await db
      .from('drink_selections')
      .delete()
      .eq('guest_id', guestId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    if (drinks.length > 0) {
      const rows = drinks.map((drink: { name: string; category: string }) => ({
        guest_id:       guestId,
        event_id:       eventId,
        drink_name:     drink.name,
        drink_category: drink.category ?? '',
      }))

      const { error: insertError } = await db
        .from('drink_selections')
        .insert(rows)

      if (insertError) {
        console.error('Erreur boissons:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, count: drinks.length })

  } catch (err) {
    console.error('Erreur API drinks:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}