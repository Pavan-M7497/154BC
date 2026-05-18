'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { hasPermission, type Permission } from '@/lib/auth/roles'

interface RoleGuardProps {
  permission: Permission
  children: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ permission, children, redirectTo = '/admin' }: RoleGuardProps) {
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
        <div className="w-8 h-8 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
