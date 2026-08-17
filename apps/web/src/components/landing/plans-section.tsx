'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { PLANS, type Plan } from './data';
import { SectionEyebrow } from './section-eyebrow';

function PlanCard({
  plan,
  onStart,
}: {
  plan: Plan;
  onStart: () => void;
}) {
  const inner = (
    <div className="relative p-2 h-full rounded-2xl border border-border bg-background">
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
          <Badge className="mb-4 text-cyan-700 border-0 w-fit bg-cyan-500/15 dark:text-cyan-300">
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
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onStart}
          className={cn(
            'mt-8 w-full rounded-xl',
            plan.highlight && 'bg-cyan-500 text-black hover:bg-cyan-400',
          )}
          variant={plan.highlight ? 'default' : 'outline'}
        >
          Get started
        </Button>
      </div>
    </div>
  );

  if (!plan.highlight) return inner;

  return (
    <BackgroundGradient
      containerClassName="rounded-3xl h-full"
      className="h-full rounded-3xl"
    >
      {inner}
    </BackgroundGradient>
  );
}

export function PlansSection() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  return (
    <section id="plans" className="py-24 scroll-mt-24">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <SectionEyebrow>Subscription plans</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Set it and forget it
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose a plan that fits your property. Recurring services are
            handled automatically — your dedicated provider shows up on
            schedule so you never have to think about it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onStart={goLogin} />
          ))}
        </div>
      </div>
    </section>
  );
}
