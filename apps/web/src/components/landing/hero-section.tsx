'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CalendarCheck,
  Home,
  Shield,
  Star,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { loginPath } from '@/lib/auth-intent';

const BIDS = [
  { name: 'Summit Lawn Co.', amount: '$118', rating: '4.9', highlight: true },
  { name: 'Apex Exteriors', amount: '$142', rating: '4.8', highlight: false },
  { name: 'Greenline Pros', amount: '$165', rating: '5.0', highlight: false },
];

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[100vh] overflow-hidden pt-24">
      <Spotlight
        className="left-0 -top-40 md:-top-20 md:left-60"
        fill="#C8F542"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,245,66,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-brand-lime/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-brand-navy/40 blur-[120px]" />
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
        <div className="text-center lg:text-left">
          <Badge className="mb-6 gap-2 border border-brand-lime/25 bg-brand-lime/10 text-brand-navy hover:bg-brand-lime/10 dark:text-brand-lime">
            Built for homeowners and crews
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            The operating system
            <br />
            <span className="text-brand-navy dark:text-brand-lime">
              for exterior work.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-normal text-muted-foreground sm:text-lg lg:mx-0">
            Homeowners get recurring plans and competitive bids. Providers get
            jobs, crew tools, and a book of recurring work — built only for
            exterior services.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push(loginPath('customer'))}
              className="group rounded-2xl border border-brand-lime/40 bg-brand-lime p-5 text-left text-brand-ink shadow-lg shadow-brand-lime/10 transition hover:bg-brand-lime/90"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                <Home className="h-3.5 w-3.5" />
                For homeowners
              </span>
              <p className="mt-2 text-lg font-semibold leading-snug">
                Get my property handled
              </p>
              <p className="mt-1 text-sm text-brand-ink/70">
                Subscribe or post a job. Verified pros compete for the work.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Start as a homeowner
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push(loginPath('provider'))}
              className="group rounded-2xl border border-brand-lime/30 bg-brand-navy p-5 text-left text-white shadow-lg transition hover:border-brand-lime/60"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-lime">
                <Wrench className="h-3.5 w-3.5" />
                For providers
              </span>
              <p className="mt-2 text-lg font-semibold leading-snug">
                Grow my crew&apos;s book of work
              </p>
              <p className="mt-1 text-sm text-white/70">
                Win jobs, dispatch crews, and keep recurring customers.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-lime">
                Join as a provider
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand-lime" /> Verified providers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-brand-lime" /> Recurring +
              on-demand
            </span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  const router = useRouter();

  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
      <motion.div
        className="hidden absolute -right-4 -top-6 z-20 sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="rounded-2xl border border-brand-lime/30 bg-background/90 px-4 py-3 shadow-xl shadow-brand-lime/10 backdrop-blur-xl">
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-navy dark:text-brand-lime">
            New bid
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            Summit Lawn Co. · $118
          </p>
        </div>
      </motion.div>

      <motion.div
        className="relative"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl dark:bg-brand-navy/80">
          <GlowingEffect
            disabled={false}
            glow
            proximity={64}
            spread={32}
            borderWidth={2}
          />

          <div className="relative mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy dark:text-brand-lime">
                Live marketplace
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                Gutter cleaning
              </p>
            </div>
            <Badge className="border-0 bg-brand-lime/15 text-brand-navy hover:bg-brand-lime/15 dark:text-brand-lime">
              3 bids
            </Badge>
          </div>

          <div className="relative mb-4 rounded-2xl border border-brand-lime/20 bg-brand-lime/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Active plan
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Standard Exterior
                </p>
              </div>
              <p className="text-lg font-bold text-brand-navy dark:text-brand-lime">
                $179
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Next visit Tuesday · Lawn, weeds, gutters
            </p>
          </div>

          <div className="relative space-y-2">
            {BIDS.map((bid) => (
              <div
                key={bid.name}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-3.5 py-3',
                  bid.highlight
                    ? 'border-brand-lime/40 bg-brand-lime/10'
                    : 'border-border bg-background/60',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {bid.name}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-brand-lime text-brand-lime" />
                    {bid.rating} · verified
                  </p>
                </div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    bid.highlight
                      ? 'text-brand-navy dark:text-brand-lime'
                      : 'text-foreground',
                  )}
                >
                  {bid.amount}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push(loginPath('customer'))}
            className="relative mt-4 w-full rounded-xl bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
          >
            See it on your property
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
