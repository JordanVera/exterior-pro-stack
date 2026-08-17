'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Home, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginPath } from '@/lib/auth-intent';

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,245,66,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid overflow-hidden rounded-3xl border border-border md:grid-cols-2">
          <div className="flex flex-col justify-between bg-background p-8 sm:p-12">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
                <Home className="h-3.5 w-3.5" />
                Homeowners
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to stop chasing the yard?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pick a subscription for hands-off recurring care, or post a
                one-time job and let verified providers compete.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-8 h-12 w-fit rounded-full bg-brand-lime px-8 font-semibold text-brand-ink hover:bg-brand-lime/90"
              onClick={() => router.push(loginPath('customer'))}
            >
              Get my property handled
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col justify-between bg-brand-navy p-8 sm:p-12">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-lime">
                <Wrench className="h-3.5 w-3.5" />
                Providers
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to fill the calendar?
              </h2>
              <p className="mt-4 text-white/70">
                Bid on jobs, dispatch crews, and keep subscription customers
                without re-bidding every visit.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-8 h-12 w-fit rounded-full bg-brand-lime px-8 font-semibold text-brand-ink hover:bg-brand-lime/90"
              onClick={() => router.push(loginPath('provider'))}
            >
              List your business
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
