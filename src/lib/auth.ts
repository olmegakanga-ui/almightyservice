import { createClient } from '@/lib/supabase/server'

export type UserRole = 'superadmin' | 'couple' | 'protocole'

export interface EventUser {
  id:       string
  eventId:  string
  email:    string
  role:     UserRole
  fullName: string
}

export async function getCurrentUser(): Promise<EventUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await (supabase as any)
    .from('event_users')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null

  return {
    id:       data.id,
    eventId:  data.event_id,
    email:    data.email,
    role:     data.role as UserRole,
    fullName: data.full_name,
  }
}

export function getNavItemsByRole(role: UserRole, eventId: string) {
  const base = `/admin/events/${eventId}`

  const superadminItems = [
    { label: 'Paramètres',    slug: 'settings' },
    { label: 'Invités',       slug: 'guests' },
    { label: 'Tables',        slug: 'tables' },
    { label: 'Boissons',      slug: 'drinks' },
    { label: "Livre d'or",    slug: 'guestbook' },
    { label: 'Réactions',     slug: 'reactions' },
    { label: 'WhatsApp',      slug: 'whatsapp' },
    { label: 'Scanner QR',    slug: 'scan' },
    { label: 'Check-in',      slug: 'checkin' },
    { label: 'Plan de salle', slug: 'seating' },
  ]

  const coupleItems = [
    { label: 'Invités',       slug: 'guests' },
    { label: 'Tables',        slug: 'tables' },
    { label: 'Boissons',      slug: 'drinks' },
    { label: "Livre d'or",    slug: 'guestbook' },
    { label: 'Réactions',     slug: 'reactions' },
    { label: 'Check-in',      slug: 'checkin' },
    { label: 'Plan de salle', slug: 'seating' },
  ]

  const protocoleItems = [
    { label: 'Scanner QR',    slug: 'scan' },
    { label: 'Check-in',      slug: 'checkin' },
    { label: 'Plan de salle', slug: 'seating' },
  ]

  switch (role) {
    case 'superadmin': return superadminItems
    case 'couple':     return coupleItems
    case 'protocole':  return protocoleItems
    default:           return protocoleItems
  }
}