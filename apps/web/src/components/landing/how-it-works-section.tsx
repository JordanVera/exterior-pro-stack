'use client';

import { useState } from 'react';
import { Timeline } from '@/components/ui/timeline';
import { HOW_IT_WORKS_CUSTOMER, HOW_IT_WORKS_PROVIDER } from './data';
import { SectionEyebrow } from './section-eyebrow';
import { cn } from '@/lib/utils';

type Audience = 'customer' | 'provider';

export function HowItWorksSection() {
  const [audience, setAudience] = useState<Audience>('customer');
  const steps =
    audience === 'customer' ? HOW_IT_WORKS_CUSTOMER : HOW_IT_WORKS_PROVIDER;

  const timeline = steps.map((step) => ({
    title: step.title,
    content: (
      <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
        <h4 className="text-xl font-semibold text-foreground">{step.heading}</h4>
        <p className="mt-3 text-muted-foreground">{step.body}</p>
      </div>
    ),
  }));

  return (
    <section id="how-it-works" className="scroll-mt-24 py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex flex-col items-center gap-5 md:mb-0 md:items-start">
          <SectionEyebrow>Simple process</SectionEyebrow>
          <div className="inline-flex rounded-full border border-border bg-background/80 p-1">
            <AudienceTab
              active={audience === 'customer'}
              onClick={() => setAudience('customer')}
            >
              Homeowners
            </AudienceTab>
            <AudienceTab
              active={audience === 'provider'}
              onClick={() => setAudience('provider')}
            >
              Providers
            </AudienceTab>
          </div>
        </div>
      </div>
      <Timeline
        key={audience}
        data={timeline}
        title={
          audience === 'customer'
            ? 'Booked in minutes, done right'
            : 'Win work. Run the crew. Keep the book.'
        }
        description={
          audience === 'customer'
            ? 'Whether you subscribe to a plan or post a one-time job, getting work done is fast and transparent.'
            : 'Exterior Pro is an operations platform — bidding, dispatch, and recurring customers in one place.'
        }
      />
    </section>
  );
}

function AudienceTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-lime text-brand-ink'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
