'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { hasPermission, type Permission } from '@/lib/auth/roles'

interface RoleGuardProps {
  permission: Permission
  children: React.ReactNode
  /** Where to redirect if user lacks permission. Defaults to '/' (home). */
  redirectTo?: string
}

/**
 * Protects admin sub-pages by permission.
 * If the user lacks the required permission, they're redirected.
 *
 * BUG FIX: Default redirect was '/admin' — which caused infinite loops
 * for customers who don't have dashboard access. Changed to '/'.
 */
export function RoleGuard({ permission, children, redirectTo = '/' }: RoleGuardProps) {
  const { role, loading, canAccessDashboard } = useAuth()
  const router = useRouter()

  const allowed = role !== null && hasPermission(role, permission)

  useEffect(() => {
    if (loading) return
    if (!canAccessDashboard || !allowed) {
      router.replace(redirectTo)
    }
  }, [loading, canAccessDashboard, allowed, router, redirectTo])

  if (loading || !allowed) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
