'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Home, Wrench } from 'lucide-react';
import { Timeline } from '@/components/ui/timeline';
import { SegmentedTabs } from '@/components/ui/tabs';
import { SectionEyebrow } from './section-eyebrow';
import { useAudience, type Audience } from './audience-context';
import { HOW_IT_WORKS_CUSTOMER, HOW_IT_WORKS_PROVIDER } from './data';

type AnyStep =
  | (typeof HOW_IT_WORKS_CUSTOMER)[number]
  | (typeof HOW_IT_WORKS_PROVIDER)[number];

function buildTimelineData(steps: readonly AnyStep[]) {
  return steps.map((step) => ({
    title: step.heading,
    content: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <p className="px-4 py-3 text-sm font-medium rounded-xl border border-brand-lime/40 bg-brand-lime/10 text-brand-navy dark:border-brand-lime/25 dark:text-brand-lime">
          {step.detail}
        </p>
      </div>
    ),
  }));
}

export function HowItWorksSection() {
  const { audience, setAudience } = useAudience();
  const steps =
    audience === 'provider' ? HOW_IT_WORKS_PROVIDER : HOW_IT_WORKS_CUSTOMER;
  const timelineData = buildTimelineData(steps);

  return (
    <section id="how-it-works" className="relative scroll-mt-20">
      {/* Section header */}
      <div className="px-6 pt-16 mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <SectionEyebrow>How it works</SectionEyebrow>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={audience}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl"
              >
                {audience === 'provider'
                  ? 'From signup to steady routes.'
                  : 'From "I should really deal with that" to done.'}
              </motion.h2>
            </AnimatePresence>
          </div>

          <SegmentedTabs
            options={[
              {
                value: 'homeowner',
                label: 'Homeowners',
                icon: <Home className="h-3.5 w-3.5" />,
              },
              {
                value: 'provider',
                label: 'Providers',
                icon: <Wrench className="h-3.5 w-3.5" />,
              },
            ]}
            value={audience}
            onChange={(value) => setAudience(value as Audience)}
            layoutId="how-it-works-audience"
            size="sm"
            className="self-start shrink-0 md:self-auto"
          />
        </div>
      </div>

      {/* Timeline — remounts on audience change so scroll animation resets */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={audience}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Timeline data={timelineData} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
