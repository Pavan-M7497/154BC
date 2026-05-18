'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { AdminSidebar } from '@/components/admin/sidebar'
import { getPostAuthRedirect } from '@/lib/auth/roles'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, canAccessDashboard, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (loading) return

    // Not logged in → send to admin login (unless already there)
    if (!user) {
      if (!isLoginPage) router.replace('/admin/login')
      return
    }

    // On login page + already authenticated
    if (isLoginPage) {
      if (canAccessDashboard && role) {
        // Admin/manager → go to dashboard
        router.replace(getPostAuthRedirect(role))
      } else if (role) {
        // Customer → go to profile (NOT /admin!)
        router.replace('/profile')
      }
      // If role is still null, wait for next render cycle
      return
    }

    // On any admin page but not staff → redirect to profile
    if (!canAccessDashboard) {
      router.replace('/profile')
    }
  }, [user, role, canAccessDashboard, loading, router, pathname, isLoginPage])

  // Loading state — uses semantic dark tokens
  if (loading) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Login page renders without sidebar
  if (isLoginPage) {
    return <div className="dark">{children}</div>
  }

  // Not authorized — blank while redirect fires
  if (!user || !canAccessDashboard) {
    return null
  }

  // Authorized admin/manager layout
  return (
    <div className="dark">
      <div className="flex min-h-screen bg-admin-deep">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
