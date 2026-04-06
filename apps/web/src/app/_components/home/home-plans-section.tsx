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
    <section id="plans" className="py-24 bg-muted/50">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
            Subscription Plans
          </p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Set It &amp; Forget It
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
            Choose a plan that fits your property. Recurring services are
            handled automatically — your dedicated provider shows up on schedule
            so you never have to think about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all cursor-pointer group rounded-2xl ${
                plan.highlight
                  ? 'border-cyan-400 dark:border-cyan-600 shadow-lg shadow-cyan-100 dark:shadow-cyan-950/30 scale-[1.02]'
                  : 'hover:border-cyan-200 dark:hover:border-cyan-900 hover:shadow-lg'
              }`}
              onClick={() => router.push('/login')}
            >
              <CardContent className="p-8">
                {plan.highlight && (
                  <Badge className="absolute border-0 top-4 right-4 bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-500" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-8 rounded-xl ${
                    plan.highlight
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-black'
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
