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
    const { guestId, eventId, messageType } = await request.json()

    if (!guestId || !eventId || !messageType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    // Charger l'invité
    const { data: guest } = await db
      .from('guests')
      .select('id, full_name, phone, invitation_token')
      .eq('id', guestId)
      .single()

    if (!guest) {
      return NextResponse.json({ error: 'Invité introuvable' }, { status: 404 })
    }

    // Charger l'événement
    const { data: event } = await db
      .from('events')
      .select('groom_name, bride_name, event_date, venue_name')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    // Construire l'URL d'invitation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ?? process.env.VERCEL_URL
      ?? 'http://localhost:3000'

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

    // Choisir le template
    let messageText: string
    switch (messageType) {
      case 'INVITATION':
        messageText = invitationTemplate(templateData)
        break
      case 'RELANCE':
        messageText = reminderTemplate(templateData)
        break
      case 'RAPPEL_WA':
        messageText = lastReminderTemplate(templateData)
        break
      case 'MERCI':
        messageText = dayOfTemplate(templateData)
        break
      default:
        messageText = invitationTemplate(templateData)
    }

    // Enregistrer le message en DB (status pending)
    const { data: waMessage } = await db
      .from('whatsapp_messages')
      .insert({
        guest_id:     guestId,
        event_id:     eventId,
        type:         messageType,
        status:       'pending',
        message_text: messageText,
        sent_at:      new Date().toISOString(),
      })
      .select('id')
      .single()

    // Envoyer le message
    const result = await sendWhatsAppMessage(guest.phone, messageText)

    // Mettre à jour le statut
    await db
      .from('whatsapp_messages')
      .update({
        status:        result.success ? 'sent' : 'failed',
        wa_message_id: result.messageId ?? null,
        error_message: result.error ?? null,
      })
      .eq('id', waMessage?.id)

    if (!result.success) {
      return NextResponse.json({
        error: result.error ?? 'Échec de l\'envoi',
      }, { status: 500 })
    }

    return NextResponse.json({
      success:   true,
      messageId: result.messageId,
      phone:     guest.phone,
      preview:   messageText.substring(0, 100) + '...',
    })

  } catch (err) {
    console.error('Erreur API WhatsApp send:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}