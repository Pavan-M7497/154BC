'use client'

import Link from 'next/link'
import { Instagram, Facebook, Mail } from 'lucide-react'
import { useLocation } from '@/components/location-context'
import { useSettings } from '@/components/settings-context'

export function Footer() {
  const { selectedLocation } = useLocation()
  const { settings } = useSettings()
  const currentYear = new Date().getFullYear()

  // Format the logo dynamically
  const nameParts = (settings.cafeName || '154').split(' ')
  const logoFirstWord = nameParts[0]
  const logoRest = nameParts.slice(1).join(' ')

  return (
    <footer className="bg-coffee text-cream/90">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-3xl text-cream">{logoFirstWord}</span>
              {logoRest && (
                <span className="block text-caramel text-sm tracking-wide">{logoRest}</span>
              )}
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
              {settings.brandDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-cream mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-cream/70 hover:text-caramel transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-cream/70 hover:text-caramel transition-colors text-sm">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-cream/70 hover:text-caramel transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-cream/70 hover:text-caramel transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Current Location */}
          <div>
            <h4 className="font-medium text-cream mb-4">Your Location</h4>
            {selectedLocation ? (
              <div className="text-sm">
                <p className="text-caramel font-medium mb-1">{selectedLocation.name}</p>
                <p className="text-cream/70 mb-1">{selectedLocation.address}</p>
                <p className="text-cream/70 mb-3">{selectedLocation.city}</p>
                <p className="text-cream/70">
                  <span className="text-cream/50">Weekdays:</span> {selectedLocation.hours.weekday}
                </p>
                <p className="text-cream/70">
                  <span className="text-cream/50">Weekends:</span> {selectedLocation.hours.weekend}
                </p>
              </div>
            ) : (
              <p className="text-cream/70 text-sm">Select a location to see details</p>
            )}
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-medium text-cream mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
            {settings.contactEmail && (
              <p className="text-cream/70 text-sm">
                {settings.contactEmail}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            &copy; {currentYear} {settings.cafeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-cream/50 hover:text-cream/70 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-cream/50 hover:text-cream/70 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
