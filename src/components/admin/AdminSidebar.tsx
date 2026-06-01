'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Table2, Wine,
  BookOpen, Heart, LogOut, ChevronLeft,
  QrCode, CheckSquare, Map, Menu, X,
  MessageCircle, Settings, Key, Crown,
  Shield, BarChart2,
} from 'lucide-react'

const ALL_NAV_ITEMS = [
  { slug: 'settings',  label: 'Paramètres',    icon: Settings,       roles: ['superadmin'] },
  { slug: 'access',    label: 'Accès',          icon: Key,            roles: ['superadmin'] },
  { slug: 'guests',    label: 'Invités',         icon: Users,          roles: ['superadmin', 'couple'] },
  { slug: 'tables',    label: 'Tables',          icon: Table2,         roles: ['superadmin', 'couple'] },
  { slug: 'drinks',    label: 'Boissons',        icon: Wine,           roles: ['superadmin', 'couple'] },
  { slug: 'guestbook', label: "Livre d'or",      icon: BookOpen,       roles: ['superadmin', 'couple'] },
  { slug: 'reactions', label: 'Réactions',       icon: Heart,          roles: ['superadmin', 'couple'] },
  { slug: 'whatsapp',  label: 'WhatsApp',        icon: MessageCircle,  roles: ['superadmin'] },
  { slug: 'scan',      label: 'Scanner QR',      icon: QrCode,         roles: ['superadmin', 'protocole'] },
  { slug: 'checkin',   label: 'Check-in',        icon: CheckSquare,    roles: ['superadmin', 'couple', 'protocole'] },
  { slug: 'seating',   label: 'Plan de salle',   icon: Map,            roles: ['superadmin', 'couple', 'protocole'] },
]

const SECTION_GESTION = ['settings', 'access', 'guests', 'tables', 'drinks', 'guestbook', 'reactions', 'whatsapp']
const SECTION_JOUR_J  = ['scan', 'checkin', 'seating']

interface Props {
  userEmail: string
}

export default function AdminSidebar({ userEmail }: Props) {
  const pathname        = usePathname()
  const router          = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string>('superadmin')

  const match   = pathname.match(/\/admin\/events\/([^/]+)/)
  const eventId = match?.[1]

  useEffect(() => {
    if (!eventId || !userEmail) return

    const load = async () => {
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('event_users')
        .select('role')
        .eq('email', userEmail)
        .eq('event_id', eventId)
        .single()

      if (data) setRole(data.role)
      else setRole('superadmin')
    }

    load()
  }, [eventId, userEmail])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const visibleItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role))
  const gestionItems = visibleItems.filter(i => SECTION_GESTION.includes(i.slug))
  const jourJItems   = visibleItems.filter(i => SECTION_JOUR_J.includes(i.slug))

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display:        'flex',
    alignItems:     'center',
    gap:            '12px',
    padding:        '10px 16px',
    borderRadius:   '10px',
    textDecoration: 'none',
    color:      active ? 'var(--gold-light)' : 'rgba(255,255,255,0.4)',
    background: active ? 'rgba(201,169,110,0.1)' : 'transparent',
    border:     active ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
    fontSize:       '0.85rem',
    transition:     'all 0.2s ease',
    cursor:         'pointer',
  })

  const roleBadge = () => {
    if (role === 'superadmin') return { label: 'Super Admin', color: '#F5A623', icon: Crown }
    if (role === 'couple')     return { label: 'Mariés',      color: '#9DB4F5', icon: Users }
    return                            { label: 'Protocole',   color: '#7EC89A', icon: Shield }
  }

  const badge = roleBadge()

  const sidebarContent = (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      padding:       '32px 16px',
      overflowY:     'auto',
    }}>

      {/* Logo + badge rôle */}
      <div style={{
        padding:        '0 8px 24px',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
        marginBottom:   '20px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--gold)' }}>
            AlmightyService
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <badge.icon size={11} color={badge.color} />
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: badge.color }}>
              {badge.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="sidebar-close-btn"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav principal — superadmin seulement */}
      {role === 'superadmin' && (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
          <Link
            href="/admin/events"
            style={linkStyle(pathname === '/admin/events')}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={16} />
            Mes mariages
          </Link>
          <Link
            href="/admin/stats"
            style={linkStyle(pathname === '/admin/stats')}
            onClick={() => setOpen(false)}
          >
            <BarChart2 size={16} />
            Statistiques
          </Link>
        </nav>
      )}

      {/* Nav événement courant */}
      {eventId && (
        <div style={{ marginTop: role === 'superadmin' ? '24px' : '0' }}>

          {role === 'superadmin' && (
            <Link
              href="/admin/events"
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '6px',
                color:          'rgba(255,255,255,0.3)',
                fontSize:       '0.72rem',
                textDecoration: 'none',
                marginBottom:   '16px',
                padding:        '0 8px',
              }}
              onClick={() => setOpen(false)}
            >
              <ChevronLeft size={12} />
              Tous les mariages
            </Link>
          )}

          {/* Section Gestion */}
          {gestionItems.length > 0 && (
            <>
              <p style={{
                fontSize:      '0.55rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.15)',
                padding:       '0 8px',
                marginBottom:  '6px',
              }}>
                Gestion
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
                {gestionItems.map(item => {
                  const href   = `/admin/events/${eventId}/${item.slug}`
                  const active = pathname === href
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      style={linkStyle(active)}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {/* Section Jour J */}
          {jourJItems.length > 0 && (
            <>
              <p style={{
                fontSize:      '0.55rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.15)',
                padding:       '0 8px',
                marginBottom:  '6px',
              }}>
                Jour J
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {jourJItems.map(item => {
                  const href   = `/admin/events/${eventId}/${item.slug}`
                  const active = pathname === href
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      style={linkStyle(active)}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Email utilisateur */}
      <p style={{
        color:          'rgba(255,255,255,0.2)',
        fontSize:       '0.72rem',
        padding:        '0 8px',
        marginBottom:   '8px',
        overflow:       'hidden',
        textOverflow:   'ellipsis',
        whiteSpace:     'nowrap',
      }}>
        {userEmail}
      </p>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          ...linkStyle(false),
          border:     'none',
          background: 'none',
          width:      '100%',
          cursor:     'pointer',
          marginTop:  '4px',
        }}
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside
        className="desktop-sidebar"
        style={{
          width:       '240px',
          minHeight:   '100vh',
          background:  'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(201,169,110,0.1)',
          flexShrink:  0,
          display:     'none',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="mobile-menu-btn"
        style={{
          position:     'fixed',
          top:          '16px',
          left:         '16px',
          zIndex:       200,
          background:   'rgba(13,11,9,0.9)',
          border:       '1px solid rgba(201,169,110,0.3)',
          borderRadius: '10px',
          padding:      '10px',
          cursor:       'pointer',
          display:      'none',
          color:        'var(--gold)',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{
            position:   'relative',
            width:      '280px',
            height:     '100vh',
            background: '#0D0B09',
            borderRight:'1px solid rgba(201,169,110,0.15)',
            overflowY:  'auto',
            zIndex:     1,
          }}>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar   { display: block !important; }
          .mobile-menu-btn   { display: none  !important; }
          .sidebar-close-btn { display: none  !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar   { display: none  !important; }
          .mobile-menu-btn   { display: flex  !important; }
          .sidebar-close-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}