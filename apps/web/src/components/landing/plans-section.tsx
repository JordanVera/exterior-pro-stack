'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { MovingBorder } from '@/components/ui/moving-border';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SegmentedTabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { loginPath } from '@/lib/auth-intent';
import { SectionEyebrow } from './section-eyebrow';
import { BILLING_OPTIONS, type BillingOption } from './data';
import type { LandingPlan } from './plan-types';

const TRUST_BADGES = [
  'Verified providers only',
  '12,400+ jobs completed',
  'No contracts or lock-in',
  'Photo proof every visit',
] as const;

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Bi-annually',
};

const PERIOD_LABELS: Record<BillingOption, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  annually: '/yr',
};

const PERIOD_MONTHS: Record<BillingOption, number> = {
  monthly: 1,
  quarterly: 3,
  annually: 12,
};

function priceCentsForBilling(plan: LandingPlan, billing: BillingOption) {
  switch (billing) {
    case 'quarterly':
      return plan.quarterlyPriceCents;
    case 'annually':
      return plan.annualPriceCents;
    default:
      return plan.monthlyPriceCents;
  }
}

function savingsPercent(plan: LandingPlan, billing: BillingOption) {
  const periodCents = priceCentsForBilling(plan, billing);
  const fullPrice = plan.monthlyPriceCents * PERIOD_MONTHS[billing];
  if (billing === 'monthly' || periodCents <= 0 || fullPrice <= 0) return 0;
  return Math.max(0, Math.round((1 - periodCents / fullPrice) * 100));
}

function formatDollars(cents: number) {
  return `$${Math.round(cents / 100)}`;
}

export function PlansSection({ plans }: { plans: LandingPlan[] }) {
  const [billing, setBilling] = useState<BillingOption>('monthly');
  const option =
    BILLING_OPTIONS.find((item) => item.value === billing) ?? BILLING_OPTIONS[0];
  const featuredIndex = plans.length >= 2 ? 1 : -1;
  const savingsPlan = plans[featuredIndex] ?? plans[0];
  const discount = savingsPlan ? savingsPercent(savingsPlan, billing) : 0;

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden py-20">
      {/* Animated beam background — extremely subtle */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <BackgroundBeams variant="lime" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-lime/30 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionEyebrow>Plans</SectionEyebrow>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pick a plan. Stop managing your yard.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Every plan is handled by one verified provider who stays assigned to
            your property. Pause or cancel from your account anytime.
          </p>
        </div>

        {/* Trust badges */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2">
          {TRUST_BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
              <Check className="h-3.5 w-3.5 text-brand-lime" />
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <SegmentedTabs
            options={BILLING_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            value={billing}
            onChange={(value) => setBilling(value as BillingOption)}
            layoutId="billing-toggle"
            size="sm"
          />
          <p className="h-5 text-sm font-medium text-brand-navy dark:text-brand-lime">
            {discount > 0
              ? `Save ${discount}% paying ${option.label.toLowerCase()}`
              : ''}
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-background/60 px-6 py-16 text-center">
            <p className="text-base font-semibold text-foreground">
              Plans are being published
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Recurring plans will show up here once they are available. You can
              still post a one-time job in the meantime.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'mt-10 grid gap-6',
              plans.length >= 3
                ? 'lg:grid-cols-3'
                : plans.length === 2
                  ? 'mx-auto max-w-4xl lg:grid-cols-2'
                  : 'mx-auto max-w-md',
            )}
          >
            {plans.map((plan, index) => {
              const highlight = index === featuredIndex;
              const priceCents = priceCentsForBilling(plan, billing);
              const price =
                priceCents > 0 ? formatDollars(priceCents) : null;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={cn(
                    'relative overflow-hidden rounded-3xl p-[1px]',
                    highlight
                      ? 'lg:-mt-4 lg:mb-4'
                      : 'border border-border bg-background/60',
                  )}
                >
                  {highlight ? (
                    <div className="absolute inset-0 rounded-3xl">
                      <MovingBorder duration={4200} rx="6%" ry="16%">
                        <div className="h-24 w-24 bg-[radial-gradient(#C8F542_40%,transparent_60%)] opacity-80" />
                      </MovingBorder>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      'relative flex h-full flex-col rounded-3xl p-7 sm:p-8',
                      highlight
                        ? 'border border-brand-lime/30 bg-brand-navy text-white'
                        : 'bg-transparent',
                    )}
                  >
                    {highlight ? (
                      <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-lime px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-ink">
                        <Sparkles className="h-3 w-3" />
                        Most popular
                      </span>
                    ) : null}

                    <h3
                      className={cn(
                        'text-xl font-bold',
                        highlight ? 'text-white' : 'text-foreground',
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        'mt-2 min-h-[3rem] text-sm leading-relaxed',
                        highlight ? 'text-white/70' : 'text-muted-foreground',
                      )}
                    >
                      {plan.description}
                    </p>

                    <div className="mt-6 flex items-end gap-1">
                      {price ? (
                        <>
                          <motion.span
                            key={`${plan.id}-${price}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              'text-5xl font-bold tracking-tight',
                              highlight
                                ? 'text-brand-lime'
                                : 'text-brand-navy dark:text-brand-lime',
                            )}
                          >
                            {price}
                          </motion.span>
                          <span
                            className={cn(
                              'pb-2 text-sm',
                              highlight
                                ? 'text-white/60'
                                : 'text-muted-foreground',
                            )}
                          >
                            {PERIOD_LABELS[billing]}
                          </span>
                        </>
                      ) : (
                        <span
                          className={cn(
                            'text-sm',
                            highlight
                              ? 'text-white/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          Not offered on this billing cycle.
                        </span>
                      )}
                    </div>
                    {billing !== 'monthly' && priceCents > 0 ? (
                      <p
                        className={cn(
                          'mt-1 text-xs',
                          highlight
                            ? 'text-white/50'
                            : 'text-muted-foreground',
                        )}
                      >
                        <s>{formatDollars(plan.monthlyPriceCents)}/mo</s> billed{' '}
                        {option.label.toLowerCase()}
                      </p>
                    ) : (
                      <p className="mt-1 h-4" />
                    )}

                    <ul className="mt-7 flex-1 space-y-3">
                      {plan.services.map((service) => (
                        <li key={service.id} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-lime" />
                          <span
                            className={cn(
                              'text-sm leading-relaxed',
                              highlight
                                ? 'text-white/80'
                                : 'text-muted-foreground',
                            )}
                          >
                            {service.name}
                            <span
                              className={cn(
                                'ml-1.5 text-xs',
                                highlight ? 'text-white/50' : 'text-muted-foreground/80',
                              )}
                            >
                              {FREQUENCY_LABELS[service.frequency] ??
                                service.frequency}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={loginPath('customer')}
                      className={cn(
                        'group mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition',
                        highlight
                          ? 'bg-brand-lime text-brand-ink hover:bg-brand-lime/90'
                          : 'border border-brand-lime/40 text-foreground hover:bg-brand-lime/10',
                      )}
                    >
                      Get started
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border bg-background/60 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-base font-semibold text-foreground">
              Not ready for a plan?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Post a single job instead and let verified providers bid on it. You
              only pay the bid you accept.
            </p>
          </div>
          <Link
            href={loginPath('customer')}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-brand-lime/40 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-brand-lime/10"
          >
            Post a one-time job
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
