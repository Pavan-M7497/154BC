'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-context'
import { User, LogOut, Star, Heart, Calendar, Settings, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, userProfile, signOut, canAccessDashboard } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-espresso hover:text-coffee transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-caramel text-cream flex items-center justify-center font-medium text-sm">
          {initials}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-foam overflow-hidden"
          >
            {/* User Info */}
            <div className="px-4 py-3 bg-oat-milk border-b border-foam">
              <p className="font-medium text-coffee">{userProfile?.name || 'Guest'}</p>
              <p className="text-sm text-mocha truncate">{user.email}</p>
              {userProfile && (
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-caramel" />
                  <span className="text-sm text-espresso font-medium">
                    {userProfile.loyaltyPoints} points
                  </span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-espresso hover:bg-oat-milk transition-colors"
              >
                <User className="w-4 h-4 text-mocha" />
                <span>My Profile</span>
              </Link>
              
              <Link
                href="/profile?tab=reservations"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-espresso hover:bg-oat-milk transition-colors"
              >
                <Calendar className="w-4 h-4 text-mocha" />
                <span>My Reservations</span>
              </Link>
              
              <Link
                href="/profile?tab=favorites"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-espresso hover:bg-oat-milk transition-colors"
              >
                <Heart className="w-4 h-4 text-mocha" />
                <span>Favorites</span>
              </Link>

              {canAccessDashboard && (
                <>
                  <div className="border-t border-foam my-2" />
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-espresso hover:bg-oat-milk transition-colors"
                  >
                    <Settings className="w-4 h-4 text-mocha" />
                    <span>Admin Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Sign Out */}
            <div className="border-t border-foam py-2">
              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-espresso hover:bg-oat-milk transition-colors w-full"
              >
                <LogOut className="w-4 h-4 text-mocha" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
