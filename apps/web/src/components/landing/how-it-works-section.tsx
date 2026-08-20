'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Home, Wrench } from 'lucide-react';
import { StickyScrollHorizontal } from '@/components/ui/sticky-scroll-horizontal';
import { SegmentedTabs } from '@/components/ui/tabs';
import { loginPath } from '@/lib/auth-intent';
import { SectionEyebrow } from './section-eyebrow';
import { useAudience, type Audience } from './audience-context';
import { HOW_IT_WORKS_CUSTOMER, HOW_IT_WORKS_PROVIDER } from './data';

type Step = {
  step: string;
  heading: string;
  body: string;
  detail: string;
};

export function HowItWorksSection() {
  const { audience, setAudience, intent } = useAudience();
  const steps: readonly Step[] =
    audience === 'provider' ? HOW_IT_WORKS_PROVIDER : HOW_IT_WORKS_CUSTOMER;

  const header = (
    <div className="px-6 mx-auto mb-10 w-full max-w-6xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {audience === 'provider'
              ? 'From signup to steady routes.'
              : 'From "I should really deal with that" to done.'}
          </h2>
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
          className="self-start md:self-auto"
        />
      </div>
    </div>
  );

  return (
    <section id="how-it-works" className="relative py-24 scroll-mt-20 md:py-0">
      <StickyScrollHorizontal header={header}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex gap-5 shrink-0 md:gap-6"
          >
            {steps.map((step) => (
              <StepPanel key={step.step} step={step} />
            ))}
            <ClosingPanel intent={intent} audience={audience} />
          </motion.div>
        </AnimatePresence>
      </StickyScrollHorizontal>
    </section>
  );
}

function StepPanel({ step }: { step: Step }) {
  return (
    <article className="group relative flex w-[82vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border border-border bg-background/70 p-7 backdrop-blur-xl transition-colors hover:border-brand-lime/40 sm:w-[62vw] md:w-[26rem] md:p-8 lg:w-[30rem]">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none bg-brand-lime/10 group-hover:opacity-100 md:opacity-0" />

      <div className="relative">
        <div className="flex gap-3 items-center">
          <span className="text-5xl font-bold leading-none text-brand-lime/25 md:text-6xl">
            {step.step}
          </span>
          <span className="flex-1 h-px bg-gradient-to-r to-transparent from-brand-lime/40" />
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {step.heading}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {step.body}
        </p>
      </div>

      <p className="relative px-4 py-3 mt-8 text-sm font-medium rounded-xl border border-brand-lime/20 bg-brand-lime/5 text-brand-navy dark:text-brand-lime">
        {step.detail}
      </p>
    </article>
  );
}

function ClosingPanel({
  intent,
  audience,
}: {
  intent: 'customer' | 'provider';
  audience: Audience;
}) {
  return (
    <article className="relative flex w-[82vw] shrink-0 snap-start flex-col justify-center overflow-hidden rounded-3xl border border-brand-lime/30 bg-brand-navy p-7 text-white sm:w-[62vw] md:w-[26rem] md:p-8 lg:w-[30rem]">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none bg-brand-lime/20" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-brand-lime">
        That&apos;s the whole thing
      </p>
      <h3 className="relative mt-4 text-2xl font-bold leading-tight md:text-3xl">
        {audience === 'provider'
          ? 'Set up today, bid on a job tonight.'
          : 'Most jobs get their first bid in about four hours.'}
      </h3>
      <p className="relative mt-4 text-base leading-relaxed text-white/70">
        {audience === 'provider'
          ? 'No monthly software fee, no lead purchases, no long onboarding. Build the profile and start bidding.'
          : 'Sign up with your email, add your property, and pick a plan or post a job. No sales call, ever.'}
      </p>
      <Link
        href={loginPath(intent)}
        className="group relative mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand-lime px-6 py-3.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-lime/90"
      >
        {audience === 'provider' ? 'Join as a provider' : 'Get started free'}
        <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
