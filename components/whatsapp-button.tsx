'use client'

import { motion } from 'framer-motion'
import { useLocation } from '@/components/location-context'
import { useSettings } from '@/components/settings-context'
import { MessageCircle } from 'lucide-react'

export function WhatsAppButton() {
  const { selectedLocation } = useLocation()
  const { settings } = useSettings()
  
  const whatsappNumber = selectedLocation?.whatsapp || settings.whatsappNumber || '+918045670154'
  const brandName = settings.cafeName || '154 Breakfast Club'
  const message = encodeURIComponent(`Hi! I'd like to know more about ${brandName}${selectedLocation ? ` - ${selectedLocation.shortName}` : ''}.`)
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', bounce: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-whatsapp rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  )
}
