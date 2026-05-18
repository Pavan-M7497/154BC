'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { RoleGuard } from '@/components/auth/role-guard'
import { subscribeUsers, updateUserRole } from '@/lib/auth/users'
import { USER_ROLES, type UserRole } from '@/lib/auth/roles'
import type { UserProfile } from '@/lib/auth/user-profile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-context'

const roleBadgeClass: Record<UserRole, string> = {
  customer: 'bg-[#3D2318] text-[#8B7355] border-[#3D2318]',
  manager: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  admin: 'bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20',
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeUsers(
      (list) => {
        setUsers(list)
        setLoading(false)
      },
      (error) => {
        if (error.code === 'permission-denied') {
          toast.error('Only admins can view and manage team roles.')
        } else {
          toast.error('Unable to load team members')
        }
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const handleRoleChange = async (uid: string, role: UserRole) => {
    if (uid === currentUser?.uid && role !== 'admin') {
      toast.error('You cannot remove your own admin access')
      return
    }

    setUpdatingId(uid)
    try {
      await updateUserRole(uid, role)
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role. Check Firestore rules and permissions.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <RoleGuard permission="manage_users">
      <div className="space-y-6">
        <AdminPageHeader
          title="Team & Roles"
          description="Assign manager or admin access. New sign-ups remain customers by default."
        />

        <div className="rounded-2xl border border-[#2C1810] bg-[#1A0F0A] overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#D4A574] animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2C1810] text-[#8B7355] text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => (
                    <tr key={member.uid} className="border-b border-[#2C1810]/60 last:border-0">
                      <td className="px-4 py-3 text-[#FAF7F2]">{member.name || '—'}</td>
                      <td className="px-4 py-3 text-[#8B7355]">{member.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={roleBadgeClass[member.role]}>{member.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {USER_ROLES.map((role) => (
                            <Button
                              key={role}
                              size="sm"
                              variant={member.role === role ? 'default' : 'outline'}
                              disabled={updatingId === member.uid || member.role === role}
                              onClick={() => handleRoleChange(member.uid, role)}
                              className={
                                member.role === role
                                  ? 'bg-[#D4A574] text-[#2C1810] hover:bg-[#C4955A]'
                                  : 'border-[#3D2318] text-[#8B7355] hover:text-[#FAF7F2]'
                              }
                            >
                              {updatingId === member.uid ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                role
                              )}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[#8B7355] text-xs max-w-2xl">
          Promote trusted staff to manager for menu, gallery, and content access. Admin can manage
          all branches, settings, and team roles. Roles are stored in Firestore and enforced by
          security rules.
        </p>
      </div>
    </RoleGuard>
  )
}
