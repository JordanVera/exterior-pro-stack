import { LandingNavbar } from './navbar';
import { HeroSection } from './hero-section';
import { CapabilitiesSection } from './capabilities-section';
import { PlansSection } from './plans-section';
import { ServicesSection } from './services-section';
import { HowItWorksSection } from './how-it-works-section';
import { WhySection } from './why-section';
import { ProvidersSection } from './providers-section';
import { StatsSection } from './stats-section';
import { FaqSection } from './faq-section';
import { CtaSection } from './cta-section';
import { LandingFooter } from './footer';

export function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <div className="overflow-x-hidden relative min-h-screen bg-background text-foreground">
        <HeroSection />
        <CapabilitiesSection />
        <PlansSection />
        <ServicesSection />
        <HowItWorksSection />
        <WhySection />
        <ProvidersSection />
        <StatsSection />
        <FaqSection />
        <CtaSection />
        <LandingFooter />
      </div>
    </>
  );
}
