'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useLocation } from '@/components/location-context'
import { isOpenNow } from '@/lib/data'
import { MapPin, Clock, X } from 'lucide-react'

export function LocationSelector() {
  const { isLocationModalOpen, setSelectedLocation, closeLocationModal, selectedLocation, locations } = useLocation()

  return (
    <AnimatePresence>
      {isLocationModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-coffee/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-5xl bg-cream rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button - only show if there's a selected location */}
            {selectedLocation && (
              <button
                onClick={closeLocationModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-coffee" />
              </button>
            )}

            {/* Header */}
            <div className="text-center pt-12 pb-8 px-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-caramel text-sm font-medium tracking-[0.2em] uppercase mb-3"
              >
                Welcome to
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-4xl md:text-5xl text-coffee mb-4"
              >
                154 Breakfast Club
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-mocha text-lg max-w-md mx-auto"
              >
                Choose your preferred location in Bangalore to explore our menu and experience
              </motion.p>
            </div>

            {/* Location Cards */}
            <div className="grid md:grid-cols-3 gap-6 p-6 pt-0">
              {locations.map((location, index) => {
                const isOpen = isOpenNow(location)
                return (
                  <motion.button
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedLocation(location)}
                    className="group text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-coffee/40 to-transparent" />
                      
                      {/* Open Status Badge */}
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
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-xl text-coffee mb-2 group-hover:text-caramel transition-colors">
                        {location.name}
                      </h3>
                      
                      <div className="flex items-start gap-2 text-mocha text-sm mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{location.address}, {location.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-mocha text-sm mb-4">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{location.hours.weekday}</span>
                      </div>
                      
                      <p className="text-espresso text-sm leading-relaxed mb-4">
                        {location.vibe}
                      </p>

                      <div className="flex items-center justify-center py-2.5 bg-coffee text-cream rounded-lg font-medium text-sm group-hover:bg-caramel transition-colors">
                        Select Location
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="text-center pb-8 px-6">
              <p className="text-mocha text-sm">
                All locations serve our full menu with Bangalore&apos;s finest coffee and brunch
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
