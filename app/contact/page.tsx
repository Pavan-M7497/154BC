'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocation } from '@/components/location-context'
import { locations, isOpenNow } from '@/lib/data'
import { LocationSelector } from '@/components/location-selector'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ReservationModal } from '@/components/reservation-modal'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Instagram, 
  ExternalLink,
  Send,
  CheckCircle,
  Calendar
} from 'lucide-react'

export default function ContactPage() {
  const { selectedLocation, setSelectedLocation } = useLocation()
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isReservationOpen, setIsReservationOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormState({ name: '', email: '', message: '' })
    }, 3000)
  }

  return (
    <>
      <LocationSelector />
      
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              Get In Touch
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl text-coffee mt-4 mb-6">
              Visit Us Today
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Choose your preferred location and join us for an unforgettable brunch experience in Bangalore.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <button
              onClick={() => setIsReservationOpen(true)}
              className="inline-flex items-center gap-2 bg-coffee text-cream px-8 py-4 rounded-lg font-medium hover:bg-espresso transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Reserve a Table
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-coffee">
              Our Locations
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {locations.map((location, index) => {
              const isOpen = isOpenNow(location)
              const isSelected = selectedLocation?.id === location.id

              return (
                <ScrollReveal key={location.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedLocation(location)}
                    className={`cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-caramel' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-coffee/40 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          isOpen 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-foam/90 text-espresso'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-white' : 'bg-espresso'}`} />
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-caramel text-cream text-xs font-medium px-3 py-1 rounded-full">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="bg-white p-5">
                      <h3 className="font-serif text-xl text-coffee mb-3">
                        {location.name}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-mocha text-sm">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-caramel" />
                          <span>{location.address}, {location.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-mocha text-sm">
                          <Clock className="w-4 h-4 shrink-0 text-caramel" />
                          <span>{location.hours.weekday}</span>
                        </div>
                        <div className="flex items-center gap-2 text-mocha text-sm">
                          <Phone className="w-4 h-4 shrink-0 text-caramel" />
                          <span>{location.phone}</span>
                        </div>
                      </div>

                      <a
                        href={location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm text-coffee font-medium hover:text-caramel transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Get Directions
                      </a>
                    </div>
                  </motion.div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Selected Location Details + Map */}
      {selectedLocation && (
        <section className="py-16 md:py-24 bg-oat-milk">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Details */}
              <div>
                <ScrollReveal>
                  <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
                    Selected Location
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-coffee mt-2 mb-6">
                    {selectedLocation.name}
                  </h2>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                  <p className="text-mocha text-lg leading-relaxed mb-8">
                    {selectedLocation.vibe}
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                  <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-caramel/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-caramel" />
                      </div>
                      <div>
                        <p className="text-coffee font-medium">Address</p>
                        <p className="text-mocha">{selectedLocation.address}</p>
                        <p className="text-mocha">{selectedLocation.city}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-caramel/10 rounded-lg flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-caramel" />
                      </div>
                      <div>
                        <p className="text-coffee font-medium">Hours</p>
                        <p className="text-mocha">Weekdays: {selectedLocation.hours.weekday}</p>
                        <p className="text-mocha">Weekends: {selectedLocation.hours.weekend}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-caramel/10 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-caramel" />
                      </div>
                      <div>
                        <p className="text-coffee font-medium">Phone</p>
                        <a href={`tel:${selectedLocation.phone}`} className="text-mocha hover:text-caramel transition-colors">
                          {selectedLocation.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-caramel/10 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-caramel" />
                      </div>
                      <div>
                        <p className="text-coffee font-medium">Email</p>
                        <a href={`mailto:${selectedLocation.email}`} className="text-mocha hover:text-caramel transition-colors">
                          {selectedLocation.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-caramel/10 rounded-lg flex items-center justify-center shrink-0">
                        <Instagram className="w-5 h-5 text-caramel" />
                      </div>
                      <div>
                        <p className="text-coffee font-medium">Instagram</p>
                        <a 
                          href={`https://instagram.com/${selectedLocation.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mocha hover:text-caramel transition-colors"
                        >
                          {selectedLocation.instagram}
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.3}>
                  <a
                    href={selectedLocation.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-lg font-medium hover:bg-espresso transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </ScrollReveal>
              </div>

              {/* Map */}
              <ScrollReveal direction="left">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
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
      )}

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              Have a Question?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-coffee mt-2 mb-4">
              Send Us a Message
            </h2>
            <p className="text-mocha">
              We would love to hear from you. Fill out the form below and we will get back to you shortly.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-coffee mb-2">Message Sent!</h3>
                  <p className="text-mocha">Thank you for reaching out. We will respond within 24 hours.</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-coffee font-medium mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formState.name}
                      onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-foam bg-cream/50 text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-coffee font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-foam bg-cream/50 text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-coffee font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formState.message}
                      onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-foam bg-cream/50 text-coffee placeholder:text-mocha/50 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-coffee text-cream py-4 rounded-lg font-medium hover:bg-espresso transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              )}
            </form>
          </ScrollReveal>
        </div>
      </section>

      {/* Reservation Modal */}
      <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} />
    </>
  )
}
