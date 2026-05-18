'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { menuItems, formatPrice, type MenuItem } from '@/lib/data'
import { LocationSelector } from '@/components/location-selector'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { OrderButtons } from '@/components/order-buttons'
import { Coffee, UtensilsCrossed, Cake, Leaf, Wheat, Sparkles } from 'lucide-react'

type Category = 'all' | 'breakfast' | 'coffee' | 'desserts'

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Items', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'breakfast', label: 'Breakfast', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'coffee', label: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: 'desserts', label: 'Desserts', icon: <Cake className="w-4 h-4" /> },
]

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Featured Badge */}
        {item.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-caramel text-cream text-xs font-medium px-3 py-1 rounded-full">
              Signature
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-xl text-coffee group-hover:text-caramel transition-colors">
            {item.name}
          </h3>
          <span className="text-caramel font-semibold text-lg whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>
        
        <p className="text-mocha text-sm leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Dietary Tags */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.dietary.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-espresso bg-oat-milk px-2.5 py-1 rounded-full"
              >
                {tag === 'vegetarian' && <Leaf className="w-3 h-3" />}
                {tag === 'vegan' && <Leaf className="w-3 h-3" />}
                {tag === 'gluten-free' && <Wheat className="w-3 h-3" />}
                <span className="capitalize">{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  
  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  return (
    <>
      <LocationSelector />
      
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              Our Menu
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl text-coffee mt-4 mb-6">
              Crafted with Love
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              From farm-fresh ingredients to artisan coffee beans sourced from Coorg, 
              every item on our menu is thoughtfully crafted to deliver an exceptional experience.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <OrderButtons variant="full" className="justify-center" />
          </ScrollReveal>
        </div>
      </section>

      {/* Menu */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter */}
          <ScrollReveal className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-coffee text-cream shadow-md'
                    : 'bg-white text-espresso hover:bg-oat-milk'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </ScrollReveal>

          {/* Menu Grid */}
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <MenuCard key={item.id} item={item} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-mocha text-lg">No items found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-12 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-xl p-8 md:p-12 text-center shadow-sm">
            <h3 className="font-serif text-2xl text-coffee mb-4">
              Dietary Accommodations
            </h3>
            <p className="text-mocha max-w-2xl mx-auto leading-relaxed mb-6">
              We are happy to accommodate dietary restrictions and allergies. 
              Please inform your server of any special requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="inline-flex items-center gap-2 text-sm text-espresso bg-oat-milk px-4 py-2 rounded-full">
                <Leaf className="w-4 h-4 text-green-600" />
                Vegetarian Options
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-espresso bg-oat-milk px-4 py-2 rounded-full">
                <Leaf className="w-4 h-4 text-green-600" />
                Vegan Options
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-espresso bg-oat-milk px-4 py-2 rounded-full">
                <Wheat className="w-4 h-4 text-amber-600" />
                Gluten-Free Options
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
