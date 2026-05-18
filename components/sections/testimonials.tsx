'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Star, Quote } from 'lucide-react'
import { getReviews } from '@/lib/firestore'

export function Testimonials() {
  const [displayedReviews, setDisplayedReviews] = useState<any[]>([])

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const allReviews = await getReviews()
        const featured = allReviews.filter(r => r.featured).slice(0, 4)
        setDisplayedReviews(featured.length > 0 ? featured : allReviews.slice(0, 4))
      } catch (error) {
        console.error('Error loading reviews:', error)
      }
    }
    loadReviews()
  }, [])

  return (
    <section className="py-24 md:py-32 bg-oat-milk">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-caramel text-sm font-medium tracking-[0.2em] uppercase">
            Testimonials
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-coffee mt-4 mb-6">
            What Our Guests Say
          </h2>
          <p className="text-mocha text-lg max-w-2xl mx-auto leading-relaxed">
            Real stories from real guests. We are proud to be part of their morning rituals.
          </p>
        </ScrollReveal>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {displayedReviews.map((review, index) => (
            <ScrollReveal key={review.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-caramel/30 mb-4" />

                {/* Review Text */}
                <p className="text-espresso text-lg leading-relaxed mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-oat-milk flex items-center justify-center">
                      <span className="text-coffee font-medium text-lg">
                        {review.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-coffee font-medium">{review.author}</p>
                      <p className="text-mocha text-sm">{review.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-caramel fill-caramel'
                              : 'text-foam'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-mocha">{review.source} Review</span>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Overall Rating */}
        <ScrollReveal className="text-center mt-12">
          <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-4 shadow-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-caramel fill-caramel" />
              ))}
            </div>
            <span className="text-coffee font-medium">
              4.9 Average Rating
            </span>
            <span className="text-mocha text-sm">
              Based on 500+ Reviews
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
