import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div style={{
      display:   'flex',
      minHeight: '100vh',
      background: '#0D0B09',
      width:     '100%',
      maxWidth:  '100vw',
      overflowX: 'hidden',
    }}>
      <AdminSidebar userEmail={user.email ?? ''} />
      <main
        className="admin-main"
        style={{
          flex:      1,
          minWidth:  0,
          width:     '100%',
          maxWidth:  '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </main>

      <style>{`
        /* Empêche tout débordement horizontal sur les pages admin */
        .admin-main {
          box-sizing: border-box;
        }
        .admin-main * {
          max-width: 100%;
        }
        /* Les tableaux restent défilables horizontalement dans leur conteneur */
        .admin-main table {
          max-width: none;
        }
        /* Espace pour le bouton hamburger sur mobile */
        @media (max-width: 767px) {
          .admin-main > div:first-child {
            padding-top: 68px !important;
          }
        }
      `}</style>
    </div>
  )
}