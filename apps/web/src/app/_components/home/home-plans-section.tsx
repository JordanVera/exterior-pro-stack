'use client';

import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Essential',
    price: 79,
    period: '/mo',
    desc: 'Great for basic upkeep on smaller properties.',
    features: [
      'Biweekly lawn mowing & edging',
      'Quarterly gutter cleaning',
      'Seasonal weed control',
      'Priority job requests',
    ],
    highlight: false,
  },
  {
    name: 'Premium',
    price: 149,
    period: '/mo',
    desc: 'Our most popular plan — full-service care year-round.',
    features: [
      'Weekly lawn mowing & edging',
      'Biannual gutter cleaning',
      'Monthly weed & pest control',
      'Biweekly landscaping touch-ups',
      'Dedicated provider assignment',
      '10% off one-time jobs',
    ],
    highlight: true,
  },
  {
    name: 'Estate',
    price: 299,
    period: '/mo',
    desc: 'Complete property management for larger homes.',
    features: [
      'Everything in Premium',
      'Weekly landscaping service',
      'Quarterly pressure washing',
      'Biannual exterior window cleaning',
      'Dedicated crew assignment',
      '20% off one-time jobs',
    ],
    highlight: false,
  },
] as const;

export function HomePlansSection() {
  const router = useRouter();

  return (
    <section id="plans" className="relative scroll-mt-24 overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 h-[500px] w-[min(100vw,680px)] translate-x-1/4 rounded-full bg-gradient-to-bl from-indigo-500/[0.11] via-blue-500/[0.06] to-transparent blur-[100px] dark:from-indigo-500/[0.18]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[80px] dark:bg-cyan-500/[0.1]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Subscription plans
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Set it.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-400 dark:to-cyan-400">
              Forget it.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Choose a plan that fits your property. Recurring services run on
            schedule — your provider shows up so you don&apos;t have to think
            about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-[1.85rem] border transition-all duration-300 hover:-translate-y-1',
                plan.highlight
                  ? 'border-blue-500/35 bg-white text-card-foreground shadow-[0_28px_70px_-28px_rgba(37,99,235,0.45),0_0_0_1px_rgba(59,130,246,0.12)] dark:border-blue-400/45 dark:bg-neutral-950 dark:text-foreground dark:shadow-[0_28px_70px_-28px_rgba(0,0,0,0.85)] md:scale-[1.03] md:ring-2 md:ring-blue-500/30 dark:md:ring-blue-400/35'
                  : 'border-black/[0.07] bg-white/85 shadow-md backdrop-blur-xl hover:border-blue-400/25 hover:shadow-xl dark:border-white/[0.1] dark:bg-white/[0.04]',
              )}
              onClick={() => router.push('/login')}
            >
              {plan.highlight && (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(59,130,246,0.22),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(96,165,250,0.18),transparent_55%)]"
                  />
                  <div
                    aria-hidden
                    className="absolute -right-16 top-24 h-48 w-48 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-400/20"
                  />
                </>
              )}
              {!plan.highlight && (
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.45] dark:opacity-[0.2]"
                  style={{
                    backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 48%, rgba(59,130,246,0.04) 50%, transparent 52%, transparent 100%)`,
                    backgroundSize: '20px 20px',
                  }}
                />
              )}

              <CardContent className="relative p-8">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {plan.name}
                  </h3>
                  {plan.highlight ? (
                    <Badge className="shrink-0 gap-1 rounded-full border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md shadow-blue-500/20 dark:from-blue-500 dark:to-indigo-500">
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {plan.desc}
                </p>

                <ul className="mt-8 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 rounded-xl border border-black/[0.04] bg-foreground/[0.02] px-3.5 py-2.5 text-sm transition-colors group-hover:border-black/[0.06] dark:border-white/[0.06] dark:bg-white/[0.04] dark:group-hover:border-white/[0.1]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 dark:bg-blue-400/20">
                        <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </span>
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'mt-10 h-12 w-full rounded-full text-base font-medium transition-all',
                    plan.highlight
                      ? 'bg-foreground text-background shadow-lg hover:bg-foreground/90 hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-white/90'
                      : 'border-black/12 dark:border-white/15',
                  )}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
