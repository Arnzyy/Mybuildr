import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import InteractiveDemo from "@/components/InteractiveDemo";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";
import FAQSection from "@/components/FAQSection";
import AboutSection from "@/components/AboutSection";
import FooterCTA from "@/components/FooterCTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <InteractiveDemo />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <AboutSection />
      <FooterCTA />
    </div>
  );
}
