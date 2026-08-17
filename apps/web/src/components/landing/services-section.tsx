import { HoverEffect } from '@/components/ui/card-hover-effect';
import { SERVICES } from './data';
import { SectionEyebrow } from './section-eyebrow';

export function ServicesSection() {
  return (
    <section id="services" className="py-24 scroll-mt-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-4 text-center">
          <SectionEyebrow>All services</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Subscriptions and one-time jobs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Every service is available as part of a subscription plan or as
            a standalone job request. Post what you need and let verified
            providers bid for your business.
          </p>
        </div>
        <HoverEffect items={SERVICES} />
      </div>
    </section>
  );
}
