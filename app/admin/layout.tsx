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

    if (!user) {
      if (!isLoginPage) router.replace('/admin/login')
      return
    }

    if (isLoginPage) {
      if (canAccessDashboard && role) {
        router.replace(getPostAuthRedirect(role))
      }
      return
    }

    if (!canAccessDashboard) {
      router.replace('/profile')
    }
  }, [user, role, canAccessDashboard, loading, router, pathname, isLoginPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center">
        <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#8B7355] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!user || !canAccessDashboard) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#0F0908]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
