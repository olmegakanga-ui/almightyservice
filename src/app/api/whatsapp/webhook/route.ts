import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? 'almightyservice-webhook-2026'

// Vérification du webhook Meta (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Réception des événements Meta (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' })
    }

    const supabase = await createClient()

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value

        // Statuts de messages
        for (const status of value.statuses ?? []) {
          const waMessageId = status.id
          const newStatus   = status.status // sent, delivered, read, failed

          // Mettre à jour le statut dans notre DB
          await (supabase as any)
            .from('whatsapp_messages')
            .update({
              status:   newStatus,
              read_at:  newStatus === 'read' ? new Date().toISOString() : null,
            })
            .eq('wa_message_id', waMessageId)
        }
      }
    }

    return NextResponse.json({ status: 'ok' })

  } catch (err) {
    console.error('Erreur webhook WhatsApp:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}