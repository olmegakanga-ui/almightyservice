/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage, TemplateData } from '@/lib/whatsapp/service'
import { dayOfTemplate, formatDate, formatTime, invitationTemplate, lastReminderTemplate, reminderTemplate } from '@/lib/whatsapp/templates'

export async function POST(request: NextRequest) {
  try {
    const { eventId, messageType, onlyPending, guestIds } = await request.json()

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
      .select('groom_name, bride_name, groom_full_name, bride_full_name, event_date, venue_name, background_image_url, gift_preference_message, gift_message_channels')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Noms utilisés dans les messages WhatsApp — complets si renseignés,
    // sinon les prénoms affichés sur l'invitation.
    const groomLabel = (event.groom_full_name || '').trim() || event.groom_name
    const brideLabel = (event.bride_full_name || '').trim() || event.bride_name

    // Charger les invités avec téléphone
    let query = db
      .from('guests')
      .select('id, full_name, phone, invitation_token, rsvp_responses(status)')
      .eq('event_id', eventId)
      .not('phone', 'is', null)
      .neq('phone', '')

    // Si guestIds spécifiés — envoi à un ou plusieurs invités précis
    if (guestIds && Array.isArray(guestIds) && guestIds.length > 0) {
      query = query.in('id', guestIds)
    } else if (onlyPending) {
      // Si onlyPending = true, exclure les confirmés
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

      // Extraire l'heure directement depuis la chaîne ISO (pas de conversion UTC)
      const eventDateStr = formatDate(event.event_date)
      const eventTimeStr = event.event_date.includes('T')
        ? event.event_date.split('T')[1].slice(0, 5).replace(':', 'h')
        : formatTime(event.event_date)

      // TemplateData pour le template Meta approuvé
      const templateData: TemplateData = {
        guestName:     guest.full_name,
        groomName:     groomLabel,
        brideName:     brideLabel,
        eventDate:     eventDateStr,
        eventTime:     eventTimeStr,
        venueName:     event.venue_name,
        invitationUrl,
        imageUrl:      event.background_image_url || undefined,
        giftPreferenceMessage: Array.isArray(event.gift_message_channels) && event.gift_message_channels.includes(messageType)
          ? event.gift_preference_message ?? undefined
          : undefined,
      }

      const fallbackMessage = messageType === 'RELANCE' ? reminderTemplate(templateData)
        : messageType === 'RAPPEL_WA' ? lastReminderTemplate(templateData)
        : messageType === 'MERCI' ? dayOfTemplate(templateData)
        : invitationTemplate(templateData)

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
