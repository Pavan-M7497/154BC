'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from '@/components/location-context'
import { useAuth } from '@/components/auth/auth-context'
import { isOpenNow } from '@/lib/data'
import { LoginModal } from '@/components/auth/login-modal'
import { UserMenu } from '@/components/auth/user-menu'
import { ReservationModal } from '@/components/reservation-modal'
import { Menu, X, MapPin, ChevronDown, Calendar } from 'lucide-react'
import { useSettings } from '@/components/settings-context'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const { selectedLocation, openLocationModal } = useLocation()
  const { user, loading } = useAuth()
  const { settings } = useSettings()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isOpen = selectedLocation ? isOpenNow(selectedLocation) : false

  // Dynamic logo parts formatting
  const nameParts = (settings.cafeName || '154').split(' ')
  const logoFirstWord = nameParts[0]
  const logoRest = nameParts.slice(1).join(' ')

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="font-serif text-2xl text-coffee">{logoFirstWord}</span>
            {logoRest && (
              <span className="hidden sm:inline text-mocha text-sm tracking-wide">
                {logoRest}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-espresso hover:text-caramel transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Location Selector, Auth & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {selectedLocation && (
              <button
                onClick={openLocationModal}
                className="flex items-center gap-2 text-sm text-mocha hover:text-coffee transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{selectedLocation.shortName}</span>
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-foam'}`} />
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
            
            {/* Auth Section */}
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-espresso hover:text-caramel transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              )
            )}
            
            <button
              onClick={() => setIsReservationModalOpen(true)}
              className="bg-coffee text-cream px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-espresso transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserve a Table
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-coffee"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-cream/98 backdrop-blur-lg shadow-lg md:hidden"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-coffee text-lg font-medium py-2 border-b border-foam"
                >
                  {link.label}
                </Link>
              ))}
              
              {selectedLocation && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    openLocationModal()
                  }}
                  className="flex items-center gap-2 text-mocha py-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Change Location: {selectedLocation.shortName}</span>
                  <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-foam'}`} />
                </button>
              )}
              
              {/* Mobile Auth */}
              {!loading && !user && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsLoginModalOpen(true)
                  }}
                  className="text-coffee text-lg font-medium py-2 border-b border-foam text-left"
                >
                  Sign In
                </button>
              )}
              
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-coffee text-lg font-medium py-2 border-b border-foam"
                >
                  My Profile
                </Link>
              )}
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsReservationModalOpen(true)
                }}
                className="bg-coffee text-cream text-center py-3 rounded-lg font-medium mt-2 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Reserve a Table
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ReservationModal isOpen={isReservationModalOpen} onClose={() => setIsReservationModalOpen(false)} />
    </>
  )
}
