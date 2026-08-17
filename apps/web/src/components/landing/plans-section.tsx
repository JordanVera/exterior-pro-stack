'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { PLANS, type Plan } from './data';
import { SectionEyebrow } from './section-eyebrow';
import { loginPath } from '@/lib/auth-intent';

function PlanCard({ plan, onStart }: { plan: Plan; onStart: () => void }) {
  return (
    <div
      className={cn(
        'relative h-full rounded-2xl border bg-background p-2',
        plan.highlight
          ? 'border-brand-lime/50 shadow-lg shadow-brand-lime/10'
          : 'border-border',
      )}
    >
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div className="flex relative flex-col p-6 h-full rounded-xl md:p-8">
        {plan.highlight ? (
          <Badge className="mb-4 border-0 w-fit bg-brand-lime/15 text-brand-navy dark:text-brand-lime">
            Most popular
          </Badge>
        ) : (
          <div className="mb-4 h-6" />
        )}
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <div className="flex gap-1 items-baseline mt-3">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            ${plan.price}
          </span>
          <span className="text-muted-foreground">{plan.period}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{plan.desc}</p>
        <ul className="flex-1 mt-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 items-start text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-lime" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onStart}
          className={cn(
            'mt-8 w-full rounded-xl',
            plan.highlight &&
              'bg-brand-lime text-brand-ink hover:bg-brand-lime/90',
          )}
          variant={plan.highlight ? 'default' : 'outline'}
        >
          Get started
        </Button>
      </div>
    </div>
  );
}

export function PlansSection() {
  const router = useRouter();
  const goCustomer = () => router.push(loginPath('customer'));

  return (
    <section id="plans" className="py-24 scroll-mt-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <SectionEyebrow>For homeowners</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Set it and forget it
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose a plan that fits your property. Recurring services are
            handled automatically — your dedicated provider shows up on schedule
            so you never have to think about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onStart={goCustomer} />
          ))}
        </div>
      </div>
    </section>
  );
}
