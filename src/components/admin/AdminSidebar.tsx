'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Table2,
  Wine, BookOpen, Heart, LogOut,
  ChevronLeft, QrCode, CheckSquare, Map, Menu, X,
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
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(false)

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

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '32px 16px',
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 8px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--gold)' }}>
            AlmightyService
          </p>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
            Admin
          </p>
        </div>
        {/* Bouton fermer sur mobile */}
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'block' }}
          className="lg-hide"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav principal */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link
          href="/admin/events"
          style={linkStyle(pathname === '/admin/events')}
          onClick={() => setOpen(false)}
        >
          <LayoutDashboard size={16} />
          Mes mariages
        </Link>
      </nav>

      {/* Nav événement */}
      {eventId && (
        <div style={{ marginTop: '32px' }}>
          <Link
            href="/admin/events"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.72rem',
              textDecoration: 'none',
              marginBottom: '16px',
              padding: '0 8px',
            }}
            onClick={() => setOpen(false)}
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
                <Link key={item.slug} href={href} style={linkStyle(active)} onClick={() => setOpen(false)}>
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
                <Link key={item.slug} href={href} style={linkStyle(active)} onClick={() => setOpen(false)}>
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
    </div>
  )

  return (
    <>
      {/* ── DESKTOP : sidebar fixe ── */}
      <aside
        style={{
          width: '240px',
          minHeight: '100vh',
          background: 'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(201,169,110,0.1)',
          flexShrink: 0,
          display: 'none',
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* ── MOBILE : bouton hamburger ── */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 200,
          background: 'rgba(13,11,9,0.9)',
          border: '1px solid rgba(201,169,110,0.3)',
          borderRadius: '10px',
          padding: '10px',
          cursor: 'pointer',
          display: 'none',
          color: 'var(--gold)',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* ── MOBILE : drawer overlay ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Overlay sombre */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
          }} />

          {/* Drawer */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '100vh',
            background: '#0D0B09',
            borderRight: '1px solid rgba(201,169,110,0.15)',
            overflowY: 'auto',
            zIndex: 1,
          }}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* CSS responsive */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}