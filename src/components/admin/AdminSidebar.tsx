'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Table2,
  Wine, BookOpen, Heart, LogOut,
  ChevronLeft, QrCode, CheckSquare, Map,
} from 'lucide-react'

const eventNavItems = [
  { icon: Users,       label: 'Invités',       slug: 'guests' },
  { icon: Table2,      label: 'Tables',        slug: 'tables' },
  { icon: Wine,        label: 'Boissons',      slug: 'drinks' },
  { icon: BookOpen,    label: "Livre d'or",    slug: 'guestbook' },
  { icon: Heart,       label: 'Réactions',     slug: 'reactions' },
  { icon: QrCode,      label: 'Scanner QR',    slug: 'scan' },
  { icon: CheckSquare, label: 'Check-in',      slug: 'checkin' },
  { icon: Map,         label: 'Plan de salle', slug: 'seating' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const match   = pathname.match(/\/admin\/events\/([^/]+)/)
  const eventId = match?.[1]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: active ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
    background: active ? 'rgba(201,169,110,0.1)' : 'transparent',
    border: active ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  })

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(201,169,110,0.1)',
      padding: '32px 16px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '0 8px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' }}>
        <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--gold)' }}>
          AlmightyService
        </p>
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
          Admin
        </p>
      </div>

      {/* Nav principal */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link href="/admin/events" style={linkStyle(pathname === '/admin/events')}>
          <LayoutDashboard size={16} />
          Mes mariages
        </Link>
      </nav>

      {/* Nav événement */}
      {eventId && (
        <div style={{ marginTop: '32px' }}>
          <Link
            href="/admin/events"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', textDecoration: 'none', marginBottom: '16px', padding: '0 8px' }}
          >
            <ChevronLeft size={12} />
            Tous les mariages
          </Link>

          {/* Gestion */}
          <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', padding: '0 8px', marginBottom: '6px' }}>
            Gestion
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
            {eventNavItems.slice(0, 5).map(item => {
              const href   = '/admin/events/' + eventId + '/' + item.slug
              const active = pathname === href
              return (
                <Link key={item.slug} href={href} style={linkStyle(active)}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Jour J */}
          <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', padding: '0 8px', marginBottom: '6px' }}>
            Jour J
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {eventNavItems.slice(5).map(item => {
              const href   = '/admin/events/' + eventId + '/' + item.slug
              const active = pathname === href
              return (
                <Link key={item.slug} href={href} style={linkStyle(active)}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <button
        onClick={handleLogout}
        style={{ ...linkStyle(false), border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </aside>
  )
}