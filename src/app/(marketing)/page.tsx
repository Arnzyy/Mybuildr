import Hero from '@/components/marketing/Hero'
import TrustBar from '@/components/marketing/TrustBar'
import ProblemSection from '@/components/marketing/ProblemSection'
import HowItWorks from '@/components/marketing/HowItWorks'
import InteractiveDemo from '@/components/marketing/InteractiveDemo'
import PricingSection from '@/components/marketing/PricingSection'
import TestimonialSection from '@/components/marketing/TestimonialSection'
import FAQSection from '@/components/marketing/FAQSection'
import AboutSection from '@/components/marketing/AboutSection'
import FooterCTA from '@/components/marketing/FooterCTA'

export default function HomePage() {
  return (
    <>
      <TrustBar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <InteractiveDemo />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <AboutSection />
      <FooterCTA />
    </>
  )
}
