import Hero from '@/components/marketing/Hero'
import TrustBar from '@/components/marketing/TrustBar'
import ProblemSection from '@/components/marketing/ProblemSection'
import SolutionSection from '@/components/marketing/SolutionSection'
import WhoWeHelp from '@/components/marketing/WhoWeHelp'
import DemoSection from '@/components/marketing/DemoSection'
import StatsBar from '@/components/marketing/StatsBar'
import Testimonials from '@/components/marketing/Testimonials'
import PricingSection from '@/components/marketing/PricingSection'
import FAQSection from '@/components/marketing/FAQSection'
import FinalCTA from '@/components/marketing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <TrustBar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <WhoWeHelp />
      <DemoSection />
      <StatsBar />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
    </>
  )
}
