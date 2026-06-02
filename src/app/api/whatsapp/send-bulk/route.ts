/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage, TemplateData } from '@/lib/whatsapp/service'
import { formatDate, formatTime } from '@/lib/whatsapp/templates'

export async function POST(request: NextRequest) {
  try {
    const { eventId, messageType, onlyPending } = await request.json()

    if (!eventId || !messageType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const db       = supabase as any

    // Charger l'événement avec la photo
    const { data: event } = await db
      .from('events')
      .select('groom_name, bride_name, event_date, venue_name, background_image_url')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Charger les invités avec téléphone
    let query = db
      .from('guests')
      .select('id, full_name, phone, invitation_token, rsvp_responses(status)')
      .eq('event_id', eventId)
      .not('phone', 'is', null)
      .neq('phone', '')

    // Si onlyPending = true, exclure les confirmés
    if (onlyPending) {
      const { data: confirmed } = await db
        .from('rsvp_responses')
        .select('guest_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')

      const confirmedIds = (confirmed ?? []).map((r: any) => r.guest_id)
      if (confirmedIds.length > 0) {
        query = query.not('id', 'in', `(${confirmedIds.join(',')})`)
      }
    }

    const { data: guests } = await query

    if (!guests || guests.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, total: 0 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://almightyservice.vercel.app'

    let sent   = 0
    let failed = 0
    const errors: string[] = []

    for (const guest of guests) {
      if (!guest.phone || guest.phone.length < 8) continue

      const invitationUrl = `${baseUrl}/invitation/${guest.invitation_token}`

      // TemplateData pour le template Meta approuvé
      const templateData: TemplateData = {
        guestName:     guest.full_name,
        groomName:     event.groom_name,
        brideName:     event.bride_name,
        eventDate:     formatDate(event.event_date),
        eventTime:     formatTime(event.event_date),
        venueName:     event.venue_name,
        invitationUrl,
        imageUrl:      event.background_image_url || undefined,
      }

      // Message texte de secours (si pas de template)
      const fallbackMessage = `✨ ${guest.full_name} ✨\n\n${event.groom_name} & ${event.bride_name} ont l'immense joie de vous convier à leur mariage.\n\n📅 ${formatDate(event.event_date)} à ${formatTime(event.event_date)}\n📍 ${event.venue_name}\n\n👇 ${invitationUrl}\n\n— AlmightyService`

      // Enregistrer en DB
      const { data: waMessage } = await db
        .from('whatsapp_messages')
        .insert({
          guest_id:     guest.id,
          event_id:     eventId,
          type:         messageType,
          status:       'pending',
          message_text: fallbackMessage,
          sent_at:      new Date().toISOString(),
        })
        .select('id')
        .single()

      // Envoyer avec template Meta
      const result = await sendWhatsAppMessage(
        guest.phone,
        fallbackMessage,
        messageType === 'INVITATION' ? templateData : undefined
      )

      // Mettre à jour le statut
      await db
        .from('whatsapp_messages')
        .update({
          status:        result.success ? 'sent' : 'failed',
          wa_message_id: result.messageId ?? null,
          error_message: result.error ?? null,
        })
        .eq('id', waMessage?.id)

      if (result.success) {
        sent++
      } else {
        failed++
        errors.push(`${guest.full_name}: ${result.error}`)
        console.error('Erreur envoi WhatsApp:', guest.full_name, result.error)
      }

      // 500ms entre chaque envoi — respecter rate limits Meta
      await new Promise(r => setTimeout(r, 500))
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total:  guests.length,
      errors: errors.slice(0, 5),
    })

  } catch (err) {
    console.error('Erreur API WhatsApp bulk:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}