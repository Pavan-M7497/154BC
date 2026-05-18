'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useLocation } from '@/components/location-context'
import { isOpenNow } from '@/lib/data'
import { OrderButtons } from '@/components/order-buttons'
import { ChevronDown, MapPin, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ReservationModal } from '@/components/reservation-modal'
import { getHomepageCMS } from '@/lib/firestore'

export function Hero() {
  const { selectedLocation, openLocationModal } = useLocation()
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const [cmsData, setCmsData] = useState({
    heroTitle: 'The Art of\nSlow Coffee',
    heroSubtitle: 'Bangalore\'s premium brunch destination. Where every cup is crafted with intention, every plate tells a story, and every moment becomes a memory worth savoring.'
  })

  useEffect(() => {
    const loadCMS = async () => {
      try {
        const data = await getHomepageCMS()
        if (data?.heroTitle) {
          setCmsData({
            heroTitle: data.heroTitle,
            heroSubtitle: data.heroSubtitle || cmsData.heroSubtitle
          })
        }
      } catch (error) {
        console.error('Error loading hero CMS:', error)
      }
    }
    loadCMS()
  }, [])

  const isOpen = selectedLocation ? isOpenNow(selectedLocation) : false

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80"
            alt="Coffee preparation"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-coffee/40 via-coffee/20 to-coffee/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-cream/10 backdrop-blur-sm border border-cream/20 rounded-full px-4 py-2 mb-8"
          >
            <span className="text-cream/90 text-sm tracking-wide">Est. 2019</span>
            <span className="w-1 h-1 rounded-full bg-caramel" />
            <span className="text-cream/90 text-sm tracking-wide">Bangalore&apos;s Finest</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream mb-6 leading-[0.95] tracking-tight"
          >
            {cmsData.heroTitle.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx === 0 && <br />}
              </span>
            ))}
            {!cmsData.heroTitle.includes('Slow Coffee') && <span className="text-caramel">Slow Coffee</span>}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {cmsData.heroSubtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Link
              href="/menu"
              className="group bg-cream text-coffee px-8 py-4 rounded-lg font-medium hover:bg-caramel hover:text-cream transition-all duration-300 flex items-center gap-2"
            >
              Explore Menu
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <button
              onClick={() => setIsReservationOpen(true)}
              className="bg-cream/10 backdrop-blur-sm border border-cream/30 text-cream px-8 py-4 rounded-lg font-medium hover:bg-cream/20 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserve a Table
            </button>
          </motion.div>

          {/* Order Online */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <OrderButtons className="justify-center" />
          </motion.div>

          {/* Location Indicator */}
          {selectedLocation && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onClick={openLocationModal}
              className="inline-flex items-center gap-3 text-cream/70 hover:text-cream transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{selectedLocation.name}</span>
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-cream/40'}`} />
              <span className="text-sm text-cream/50">{isOpen ? 'Open Now' : 'Closed'}</span>
            </motion.button>
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-cream/50"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} />
    </>
  )
}
