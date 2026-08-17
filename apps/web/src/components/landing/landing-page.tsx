import { LandingNavbar } from './navbar';
import { HeroSection } from './hero-section';
import { CapabilitiesSection } from './capabilities-section';
import { TrustStrip } from './stats-section';
import { HowItWorksSection } from './how-it-works-section';
import { PlansSection } from './plans-section';
import { ServicesSection } from './services-section';
import { WhySection } from './why-section';
import { ProvidersSection } from './providers-section';
import { FaqSection } from './faq-section';
import { CtaSection } from './cta-section';
import { LandingFooter } from './footer';

export function LandingPage() {
  return (
    <div className="bg-brand-mist text-foreground dark:bg-brand-night">
      <LandingNavbar />
      <div className="relative min-h-screen overflow-x-hidden">
        <HeroSection />
        <CapabilitiesSection />
        <TrustStrip />
        <HowItWorksSection />
        <PlansSection />
        <ServicesSection />
        <WhySection />
        <ProvidersSection />
        <FaqSection />
        <CtaSection />
        <LandingFooter />
      </div>
    </div>
  );
}
