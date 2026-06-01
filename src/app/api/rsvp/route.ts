/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/service'
import { rsvpConfirmationNotification } from '@/lib/whatsapp/templates'

export async function POST(request: NextRequest) {
  try {
    const { guestId, eventId, status } = await request.json()

    if (!guestId || !eventId || !status) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'declined', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db       = supabase as any

    // Vérifier le statut précédent pour éviter les doublons de notif
    const { data: existing } = await db
      .from('rsvp_responses')
      .select('status')
      .eq('guest_id', guestId)
      .single()

    const wasAlreadyConfirmed = existing?.status === 'confirmed'

    // Mettre à jour le RSVP
    const { error } = await db
      .from('rsvp_responses')
      .upsert(
        {
          guest_id:     guestId,
          event_id:     eventId,
          status,
          responded_at: status !== 'pending' ? new Date().toISOString() : null,
        },
        { onConflict: 'guest_id' }
      )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // ── Notification WhatsApp au couple ──────────────────────
    // Seulement si NOUVELLE confirmation (pas déjà confirmé)
    if (status === 'confirmed' && !wasAlreadyConfirmed) {
      try {
        // Charger les infos de l'invité + sa table
        const { data: guest } = await db
          .from('guests')
          .select('full_name, side, guest_tables(name)')
          .eq('id', guestId)
          .single()

        // Charger les infos de l'événement avec les numéros du couple
        const { data: event } = await db
          .from('events')
          .select('groom_name, bride_name, groom_phone, bride_phone')
          .eq('id', eventId)
          .single()

        if (guest && event) {
          // Choisir le destinataire selon le côté de l'invité
          const recipientPhone = guest.side === 'HOMME'
            ? event.groom_phone
            : event.bride_phone

          if (recipientPhone && recipientPhone.trim().length > 5) {
            const message = rsvpConfirmationNotification({
              groomName: event.groom_name,
              brideName: event.bride_name,
              guestName: guest.full_name,
              guestSide: guest.side as 'HOMME' | 'FEMME',
              tableName: guest.guest_tables?.name ?? null,
            })

            // Envoi asynchrone — ne bloque pas la réponse RSVP
            sendWhatsAppMessage(recipientPhone.trim(), message).catch(err => {
              console.error('Erreur notification RSVP WhatsApp:', err)
            })
          }
        }
      } catch (notifErr) {
        // Ne jamais bloquer la confirmation si la notif échoue
        console.error('Erreur notification RSVP:', notifErr)
      }
    }

    return NextResponse.json({ success: true, status })

  } catch (err) {
    console.error('Erreur API RSVP:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}