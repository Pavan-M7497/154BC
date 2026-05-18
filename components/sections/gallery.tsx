'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Instagram } from 'lucide-react'
import { getGallery } from '@/lib/firestore'

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<any[]>([])

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const images = await getGallery()
        setGalleryImages(images.slice(0, 6))
      } catch (error) {
        console.error('Error loading gallery:', error)
      }
    }
    loadGallery()
  }, [])
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
            @154breakfastclub
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6">
            Moments Worth Sharing
          </h2>
          <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed">
            Follow our journey and share yours. Tag us for a chance to be featured.
          </p>
        </ScrollReveal>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
          {galleryImages.length > 0 ? (
            galleryImages.map((image, index) => (
              <ScrollReveal
                key={image.id || index}
                delay={index * 0.05}
                className={`min-h-[180px] md:min-h-[220px]`}
              >
                <motion.div
                  whileHover={{ scale: 0.98 }}
                  className="group relative w-full h-full rounded-xl overflow-hidden cursor-pointer"
                >
                  <Image
                    src={image.imageUrl || image.url}
                    alt={image.caption || 'Gallery image'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-coffee/0 group-hover:bg-coffee/30 transition-colors duration-300 flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              </ScrollReveal>
            ))
          ) : (
            <p className="text-mocha text-center col-span-full">No gallery images yet.</p>
          )}
        </div>

        {/* Instagram CTA */}
        <ScrollReveal className="text-center">
          <a
            href="https://instagram.com/154breakfastclub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-coffee text-cream px-8 py-4 rounded-lg font-medium hover:bg-espresso transition-colors"
          >
            <Instagram className="w-5 h-5" />
            Follow on Instagram
          </a>
        </ScrollReveal>
      </div>
    </section>
  )
}
