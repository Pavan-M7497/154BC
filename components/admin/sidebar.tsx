'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-context'
import { hasPermission, type Permission } from '@/lib/auth/roles'
import {
  LayoutDashboard,
  MapPin,
  UtensilsCrossed,
  Images,
  Star,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Users,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  permission: Permission
}[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, permission: 'dashboard' },
  { href: '/admin/orders', label: 'Orders & Loyalty', icon: ShoppingBag, permission: 'dashboard' },
  { href: '/admin/locations', label: 'Locations', icon: MapPin, permission: 'locations' },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, permission: 'menu' },
  { href: '/admin/gallery', label: 'Gallery', icon: Images, permission: 'gallery' },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, permission: 'reviews' },
  { href: '/admin/homepage', label: 'Homepage CMS', icon: Home, permission: 'homepage' },
  { href: '/admin/users', label: 'Team & Roles', icon: Users, permission: 'manage_users' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings' },
]

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname?.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
        isActive
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-card'
      )}
    >
      <Icon
        className={cn(
          'w-4.5 h-4.5 shrink-0 transition-colors',
          isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
        )}
        size={18}
      />
      <span>{label}</span>
      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-accent" />}
    </Link>
  )
}

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, userProfile, role, signOut } = useAuth()

  const visibleNavItems = navItems.filter((item) => hasPermission(role, item.permission))

  const handleSignOut = async () => {
    await signOut()
  }

  const roleLabel =
    role === 'admin' ? 'Administrator' : role === 'manager' ? 'Manager' : 'Staff'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="font-serif text-base text-accent font-bold">154</span>
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold leading-tight">Admin Panel</p>
            <p className="text-muted-foreground text-xs">Breakfast Club</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-espresso uppercase tracking-wider mb-3">
          Management
        </p>
        {visibleNavItems.map((item) => (
          <NavItem key={item.href} {...item} onClick={() => setIsMobileOpen(false)} />
        ))}
      </nav>

      <div className="px-3 pb-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all group"
        >
          <ExternalLink size={18} className="shrink-0" />
          <span>View Website</span>
        </Link>
      </div>

      <div className="px-3 pb-4 border-t border-border pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent text-sm font-semibold">
              {(userProfile?.name || user?.email || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-xs font-medium truncate">
              {userProfile?.name || 'Staff'}
            </p>
            <p className="text-muted-foreground text-xs truncate">{roleLabel}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-red-400 transition-colors p-1 rounded-lg"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-background border-r border-border">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-card rounded-xl flex items-center justify-center text-foreground shadow-lg"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border z-50 flex flex-col"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
