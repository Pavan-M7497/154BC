'use client'

import Link from 'next/link'
import { Instagram, Facebook, Mail } from 'lucide-react'
import { useLocation } from '@/components/location-context'

export function Footer() {
  const { selectedLocation } = useLocation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-coffee text-cream/90">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-3xl text-cream">154</span>
              <span className="block text-caramel text-sm tracking-wide">Breakfast Club</span>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
              Crafting unforgettable brunch experiences in Bangalore since 2019. Premium coffee, 
              artisan food, and warm hospitality.
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
              <a
                href="https://instagram.com/154breakfastclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/154breakfastclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@154breakfastclub.in"
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-caramel transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-cream/70 text-sm">
              hello@154breakfastclub.in
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            &copy; {currentYear} 154 Breakfast Club. All rights reserved.
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
