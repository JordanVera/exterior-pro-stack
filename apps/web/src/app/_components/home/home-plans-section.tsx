'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <section id="plans" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Subscription plans
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Set it. Forget it.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Choose a plan that fits your property. Recurring services run on
            schedule — your provider shows up so you don&apos;t have to think
            about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`group relative cursor-pointer overflow-hidden rounded-[1.75rem] border transition-all duration-300 hover:-translate-y-0.5 ${
                plan.highlight
                  ? "border-blue-400/40 bg-white shadow-[0_24px_64px_-24px_rgba(37,99,235,0.35)] dark:border-blue-500/30 dark:bg-white/[0.05] dark:shadow-[0_24px_64px_-24px_rgba(0,0,0,0.6)] md:scale-[1.02]"
                  : "border-black/[0.06] bg-white/80 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03] hover:border-blue-300/30 hover:shadow-lg dark:hover:border-blue-500/20"
              }`}
              onClick={() => router.push("/login")}
            >
              <CardContent className="p-8">
                {plan.highlight && (
                  <Badge className="absolute right-5 top-5 rounded-full border-0 bg-blue-500/15 text-xs font-medium text-blue-700 dark:text-blue-300">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.desc}
                </p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-10 w-full rounded-full ${
                    plan.highlight
                      ? "bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      : "border-black/10 dark:border-white/15"
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
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
