/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/service'
import {
  invitationTemplate,
  reminderTemplate,
  lastReminderTemplate,
  dayOfTemplate,
  formatDate,
  formatTime,
} from '@/lib/whatsapp/templates'

export async function POST(request: NextRequest) {
  try {
    const { eventId, messageType, onlyPending } = await request.json()

    if (!eventId || !messageType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    // Charger l'événement
    const { data: event } = await db
      .from('events')
      .select('groom_name, bride_name, event_date, venue_name')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    // Charger les invités
    let query = db
      .from('guests')
      .select('id, full_name, phone, invitation_token, rsvp_responses(status)')
      .eq('event_id', eventId)
      .not('phone', 'eq', '')

    // Si onlyPending = true, envoyer seulement aux non-confirmés
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
      return NextResponse.json({ success: true, sent: 0, failed: 0 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ?? process.env.VERCEL_URL
      ?? 'http://localhost:3000'

    let sent   = 0
    let failed = 0
    const errors: string[] = []

    // Envoi en batch avec délai entre chaque
    for (const guest of guests) {
      const invitationUrl = `${baseUrl.startsWith('http') ? baseUrl : 'https://' + baseUrl}/invitation/${guest.invitation_token}`

      const templateData = {
        guestName:     guest.full_name,
        groomName:     event.groom_name,
        brideName:     event.bride_name,
        eventDate:     formatDate(event.event_date),
        eventTime:     formatTime(event.event_date),
        venueName:     event.venue_name,
        invitationUrl,
      }

      let messageText: string
      switch (messageType) {
        case 'INVITATION':   messageText = invitationTemplate(templateData);    break
        case 'RELANCE':      messageText = reminderTemplate(templateData);      break
        case 'RAPPEL_WA':    messageText = lastReminderTemplate(templateData);  break
        case 'MERCI':        messageText = dayOfTemplate(templateData);         break
        default:             messageText = invitationTemplate(templateData)
      }

      // Enregistrer en DB
      const { data: waMessage } = await db
        .from('whatsapp_messages')
        .insert({
          guest_id:     guest.id,
          event_id:     eventId,
          type:         messageType,
          status:       'pending',
          message_text: messageText,
          sent_at:      new Date().toISOString(),
        })
        .select('id')
        .single()

      // Envoyer
      const result = await sendWhatsAppMessage(guest.phone, messageText)

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
      }

      // Délai de 500ms entre chaque envoi pour respecter les rate limits
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