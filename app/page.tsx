import { Hero } from '@/components/sections/hero'
import { FeaturedMenu } from '@/components/sections/featured-menu'
import { BrandStory } from '@/components/sections/brand-story'
import { Gallery } from '@/components/sections/gallery'
import { Testimonials } from '@/components/sections/testimonials'
import { LocationCTA } from '@/components/sections/location-cta'
import { LocationSelector } from '@/components/location-selector'

export default function Home() {
  return (
    <>
      <LocationSelector />
      <Hero />
      <FeaturedMenu />
      <BrandStory />
      <Gallery />
      <Testimonials />
      <LocationCTA />
    </>
  )
}
