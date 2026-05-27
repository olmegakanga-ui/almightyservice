/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId manquant' }, { status: 400 })
    }

    const supabase = await createClient()
    const db = supabase as any

    const { data: messages } = await db
      .from('whatsapp_messages')
      .select(`
        id, type, status, sent_at, read_at, error_message,
        guests ( full_name, phone )
      `)
      .eq('event_id', eventId)
      .order('sent_at', { ascending: false })

    // Statistiques
    const stats = {
      total:     messages?.length ?? 0,
      sent:      messages?.filter((m: any) => m.status === 'sent').length ?? 0,
      delivered: messages?.filter((m: any) => m.status === 'delivered').length ?? 0,
      read:      messages?.filter((m: any) => m.status === 'read').length ?? 0,
      failed:    messages?.filter((m: any) => m.status === 'failed').length ?? 0,
      pending:   messages?.filter((m: any) => m.status === 'pending').length ?? 0,
    }

    return NextResponse.json({ success: true, stats, messages: messages ?? [] })

  } catch (err) {
    console.error('Erreur API WhatsApp status:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}