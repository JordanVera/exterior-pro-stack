import { AudienceProvider } from './audience-context';
import { LandingNavbar } from './navbar';
import { HeroSection } from './hero-section';
import { ServiceTicker } from './service-ticker';
import { StatsSection } from './stats-section';
import { HowItWorksSection } from './how-it-works-section';
import { ServicesSection } from './services-section';
import { WhySection } from './why-section';
import { PlansSection } from './plans-section';
import { ProvidersSection } from './providers-section';
import { TestimonialsSection } from './testimonials-section';
import { FaqSection } from './faq-section';
import { CtaSection } from './cta-section';
import { LandingFooter } from './footer';
import { getLandingPlans } from './get-plans';

export async function LandingPage() {
  const plans = await getLandingPlans();

  return (
    <AudienceProvider>
      <div className="bg-brand-mist text-foreground dark:bg-brand-night">
        <LandingNavbar />
        <main className="relative min-h-screen overflow-x-clip">
          <HeroSection />
          <ServiceTicker />
          <StatsSection />
          <HowItWorksSection />
          <ServicesSection />
          <WhySection />
          <PlansSection plans={plans} />
          <ProvidersSection />
          <TestimonialsSection />
          <FaqSection />
          <CtaSection />
        </main>
        <LandingFooter />
      </div>
    </AudienceProvider>
  );
}
