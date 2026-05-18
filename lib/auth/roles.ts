export type UserRole = 'customer' | 'manager' | 'admin'

export const USER_ROLES: readonly UserRole[] = ['customer', 'manager', 'admin'] as const

export const DEFAULT_ROLE: UserRole = 'customer'

export type Permission =
  | 'dashboard'
  | 'menu'
  | 'gallery'
  | 'homepage'
  | 'reviews'
  | 'locations'
  | 'settings'
  | 'manage_users'

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  customer: [],
  manager: ['dashboard', 'menu', 'gallery', 'homepage', 'reviews'],
  admin: [
    'dashboard',
    'menu',
    'gallery',
    'homepage',
    'reviews',
    'locations',
    'settings',
    'manage_users',
  ],
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole)
}

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canAccessDashboard(role: UserRole | null | undefined): boolean {
  return hasPermission(role, 'dashboard')
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin'
}

export function isManagerRole(role: UserRole | null | undefined): boolean {
  return role === 'manager'
}

export function getPostAuthRedirect(role: UserRole): string {
  if (canAccessDashboard(role)) return '/admin'
  return '/profile'
}
