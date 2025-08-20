import React from 'react'
import { HeroSection } from '../components/HeroSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { PopularRoutesSection } from '../components/PopularRoutesSection'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { CTASection } from '../components/CTASection'

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PopularRoutesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
