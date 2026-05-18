'use client'

import Link from 'next/link'
import { useLocation } from '@/components/location-context'
import { isOpenNow } from '@/lib/data'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react'

export function LocationCTA() {
  const { selectedLocation, openLocationModal } = useLocation()
  
  if (!selectedLocation) return null
  
  const isOpen = isOpenNow(selectedLocation)

  return (
    <section className="py-24 md:py-32 bg-coffee text-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <ScrollReveal>
              <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
                Visit Us
              </span>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <h2 className="font-serif text-4xl md:text-5xl text-cream mt-4 mb-6 leading-tight">
                Your Table Awaits
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <p className="text-cream/70 text-lg leading-relaxed mb-8">
                Experience the warmth of 154 Breakfast Club. 
                Reserve a table or just walk in — we&apos;re always ready to welcome you.
              </p>
            </ScrollReveal>

            {/* Current Location Info */}
            <ScrollReveal delay={0.3}>
              <div className="bg-cream/10 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-cream">{selectedLocation.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isOpen 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-cream/10 text-cream/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-400' : 'bg-cream/40'}`} />
                    {isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-cream/80">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-caramel" />
                    <span>{selectedLocation.address}, {selectedLocation.city}</span>
                  </div>
                  <div className="flex items-start gap-3 text-cream/80">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0 text-caramel" />
                    <div>
                      <p>Weekdays: {selectedLocation.hours.weekday}</p>
                      <p>Weekends: {selectedLocation.hours.weekend}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-cream/80">
                    <Phone className="w-5 h-5 mt-0.5 shrink-0 text-caramel" />
                    <span>{selectedLocation.phone}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap gap-4">
                <a
                  href={selectedLocation.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-cream text-coffee px-6 py-3 rounded-lg font-medium hover:bg-caramel hover:text-cream transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
                <button
                  onClick={openLocationModal}
                  className="inline-flex items-center gap-2 border border-cream/30 text-cream px-6 py-3 rounded-lg font-medium hover:bg-cream/10 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Change Location
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Map Embed */}
          <ScrollReveal direction="left" className="relative">
            <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-cream/10">
              <iframe
                src={`https://maps.google.com/maps?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${selectedLocation.name} Map`}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
