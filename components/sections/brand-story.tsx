'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { getHomepageCMS } from '@/lib/firestore'

import { useSettings } from '@/components/settings-context'

export function BrandStory() {
  const { settings } = useSettings()
  const sectionRef = useRef<HTMLElement>(null)
  const [cmsData, setCmsData] = useState({
    brandStoryTitle: 'Where Every Cup Tells a Story',
    brandStoryDescription: 'From the single-origin beans we source from Coorg to the locally-grown ingredients on your plate, everything is chosen with intention.',
    brandStoryImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80'
  })

  useEffect(() => {
    const loadCMS = async () => {
      try {
        const data = await getHomepageCMS()
        if (data?.brandStoryTitle) {
          setCmsData({
            brandStoryTitle: data.brandStoryTitle,
            brandStoryDescription: data.brandStoryDescription || cmsData.brandStoryDescription,
            brandStoryImage: data.brandStoryImage || cmsData.brandStoryImage
          })
        }
      } catch (error) {
        console.error('Error loading brand story CMS:', error)
      }
    }
    loadCMS()
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })
  
  const imageY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-oat-milk overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <ScrollReveal direction="right" className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <motion.div style={{ y: imageY }} className="absolute inset-0">
                <Image
                  src={cmsData.brandStoryImage}
                  alt="Coffee beans being roasted"
                  fill
                  className="object-cover scale-110"
                />
              </motion.div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg max-w-[200px]">
              <span className="text-caramel font-serif text-4xl">5+</span>
              <p className="text-mocha text-sm mt-1">Years of crafting exceptional experiences in Bangalore</p>
            </div>
          </ScrollReveal>

          {/* Content */}
          <div className="lg:py-8">
            <ScrollReveal>
              <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
                Our Story
              </span>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6 leading-tight">
                {cmsData.brandStoryTitle}
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <p className="text-mocha text-lg leading-relaxed mb-6">
                {settings.cafeName} was born from a simple belief: that the morning ritual 
                deserves to be extraordinary. Founded in the heart of Bangalore, we set out to 
                create spaces where time slows down and every detail matters.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <p className="text-mocha text-lg leading-relaxed mb-8">
                {cmsData.brandStoryDescription}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="flex flex-wrap gap-8 mb-8">
                <div>
                  <span className="text-caramel font-serif text-3xl">3</span>
                  <p className="text-mocha text-sm mt-1">Locations in Bangalore</p>
                </div>
                <div>
                  <span className="text-caramel font-serif text-3xl">50K+</span>
                  <p className="text-mocha text-sm mt-1">Happy Guests</p>
                </div>
                <div>
                  <span className="text-caramel font-serif text-3xl">15</span>
                  <p className="text-mocha text-sm mt-1">Local Suppliers</p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.5}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-coffee font-medium hover:text-caramel transition-colors group"
              >
                Read Our Full Story
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
