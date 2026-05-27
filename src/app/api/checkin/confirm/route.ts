/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, performedBy } = await request.json()

    if (!guestId || !eventId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db = supabase as any

    // Lecture de l'invité
    const { data: rows, error: fetchError } = await db
      .rpc('get_guest_checkin_status', { p_guest_id: guestId })

    if (fetchError || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    const guest = rows[0] as {
      id: string
      checked_in: boolean
      full_name: string
      checked_in_at: string | null
    }

    if (guest.checked_in === true) {
      return NextResponse.json({
        error:       'already_checked_in',
        message:     guest.full_name + ' a déjà été enregistré à l\'entrée',
        checkedInAt: guest.checked_in_at,
      }, { status: 409 })
    }

    const now = new Date().toISOString()

    const { error: rpcError } = await db
      .rpc('checkin_guest', {
        p_guest_id:   guestId,
        p_checked_at: now,
        p_checked_by: performedBy ?? 'Protocole',
      })

    if (rpcError) {
      return NextResponse.json(
        { error: rpcError.message },
        { status: 500 }
      )
    }

    await db.from('checkin_logs').insert({
      guest_id:     guestId,
      event_id:     eventId,
      action:       'checkin',
      performed_by: performedBy ?? 'Protocole',
      performed_at: now,
    })

    return NextResponse.json({ success: true, checkedInAt: now })

  } catch (err) {
    console.error('Erreur confirm check-in:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}