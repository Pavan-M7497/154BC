'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/data'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Plus } from 'lucide-react'
import { getMenuItems } from '@/lib/firestore'

export function FeaturedMenu() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([])

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getMenuItems()
        const featured = items.filter(item => item.featured).slice(0, 6)
        setFeaturedItems(featured)
      } catch (error) {
        console.error('Error loading menu items:', error)
      }
    }
    loadItems()
  }, [])
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
            Our Specialties
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6">
            Crafted with Intention
          </h2>
          <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed">
            Every dish and drink is thoughtfully prepared using the finest ingredients, 
            sourced from local farms and artisan suppliers across Karnataka.
          </p>
        </ScrollReveal>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coffee/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-cream/90 backdrop-blur-sm text-espresso text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-xl text-coffee group-hover:text-caramel transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-caramel font-medium whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  
                  <p className="text-mocha text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Dietary Tags */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.dietary.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-latte bg-oat-milk px-2 py-1 rounded-full capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal className="text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-coffee text-cream px-8 py-4 rounded-lg font-medium hover:bg-espresso transition-colors"
          >
            <Plus className="w-4 h-4" />
            View Full Menu
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
