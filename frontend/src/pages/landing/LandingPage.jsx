import { Navbar, Hero } from './HeroSection';
import FeaturesSection from './FeaturesSection';
import AgentsSection from './AgentsSection';
import { HowItWorksSection, TestimonialsSection, CTASection, Footer } from './SupportingSections';

export default function LandingPage() {
  return (
    <div className="bg-bg-primary min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <AgentsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
