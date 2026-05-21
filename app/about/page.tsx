'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { LocationSelector } from '@/components/location-selector'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Testimonials } from '@/components/sections/testimonials'
import { Heart, Coffee, Users, Leaf } from 'lucide-react'
import { useSettings } from '@/components/settings-context'

const values = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Passion for Craft',
    description: 'Every cup and plate is prepared with meticulous attention to detail and genuine love for what we do.'
  },
  {
    icon: <Coffee className="w-6 h-6" />,
    title: 'Quality First',
    description: 'We source only the finest ingredients from local farms and artisan roasters across Karnataka.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community Focus',
    description: 'Our cafés are designed as gathering spaces where connections are made and stories are shared.'
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Sustainability',
    description: 'We prioritize eco-friendly practices, from biodegradable packaging to supporting sustainable farms.'
  }
]

const team = [
  {
    name: 'Priya Sharma',
    role: 'Founder & Head Chef',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    bio: 'Former culinary school instructor with a passion for reinventing breakfast classics with Indian flavors.'
  },
  {
    name: 'Arjun Menon',
    role: 'Head Barista & Coffee Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Award-winning barista with expertise in single-origin Coorg beans and traditional filter coffee.'
  },
  {
    name: 'Sneha Reddy',
    role: 'Operations Director',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    bio: 'Hospitality veteran ensuring every guest feels welcomed and cared for across all locations.'
  }
]

export default function AboutPage() {
  const { settings } = useSettings()
  const parallaxRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start']
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  const brandName = settings.cafeName || '154 Breakfast Club'
  const nameParts = brandName.split(' ')
  const logoFirstWord = nameParts[0]

  return (
    <>
      <LocationSelector />
      
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              Our Story
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-5xl md:text-6xl text-coffee mt-4 mb-6">
              More Than Just Coffee
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed">
              {brandName} was founded on the belief that mornings deserve to be extraordinary. 
              We are a team of passionate food lovers, coffee enthusiasts, and hospitality artists based in Bangalore.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Origin Story */}
      <section ref={parallaxRef} className="py-24 md:py-32 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <ScrollReveal className="relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <motion.div style={{ y: imageY }} className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80"
                    alt="Coffee shop origins"
                    fill
                    className="object-cover scale-110"
                  />
                </motion.div>
              </div>
              
              {/* Year Badge */}
              <div className="absolute -bottom-6 -left-6 bg-coffee text-cream p-6 rounded-xl shadow-lg">
                <span className="font-serif text-4xl">2019</span>
                <p className="text-cream/70 text-sm mt-1">Year Founded</p>
              </div>
            </ScrollReveal>

            {/* Content */}
            <div>
              <ScrollReveal>
                <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
                  The Beginning
                </span>
              </ScrollReveal>
              
              <ScrollReveal delay={0.1}>
                <h2 className="font-serif text-4xl text-coffee mt-4 mb-6 leading-tight">
                  From a Dream to Three Locations
                </h2>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <p className="text-mocha text-lg leading-relaxed mb-6">
                  It started with a simple observation: too many people were rushing through their mornings, 
                  missing out on one of life&apos;s simplest pleasures. We wanted to create spaces that 
                  encouraged people to slow down, savor, and connect.
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <p className="text-mocha text-lg leading-relaxed mb-6">
                  Our first café opened in Indiranagar with just twelve seats and a dream. Word spread quickly 
                  about our handcrafted lattes and farm-to-table breakfast plates. Within two years, we 
                  expanded to Koramangala and HSR Layout — each location with its own unique character but united 
                  by our commitment to quality and warmth.
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={0.4}>
                <p className="text-mocha text-lg leading-relaxed">
                  Today, we serve thousands of guests weekly across Bangalore, but our mission remains the same: to make 
                  every morning feel like a celebration.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              What We Stand For
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6">
              Our Values
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-6 h-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-caramel/10 rounded-lg flex items-center justify-center text-caramel mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-serif text-xl text-coffee mb-3">{value.title}</h3>
                  <p className="text-mocha text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
              The Faces Behind {brandName}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6">
              Meet Our Team
            </h2>
            <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed">
              Passionate individuals united by a love for exceptional food, coffee, and hospitality.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <ScrollReveal key={member.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group text-center"
                >
                  <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-serif text-xl text-coffee mb-1 group-hover:text-caramel transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-caramel text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-mocha text-sm leading-relaxed max-w-xs mx-auto">
                    {member.bio}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Closing CTA */}
      <section className="py-24 md:py-32 bg-coffee text-cream text-center">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">
              Come Experience <span className="text-caramel">{logoFirstWord}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-cream/70 text-lg mb-8 leading-relaxed">
              We would love to welcome you to our table. Visit any of our premier locations and 
              discover why our guests keep coming back.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-cream text-coffee px-8 py-4 rounded-lg font-medium hover:bg-caramel hover:text-cream transition-colors"
            >
              Find Your Location
              <span>&rarr;</span>
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
