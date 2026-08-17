'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  CalendarCheck,
  Check,
  Repeat,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FlipWords } from '@/components/ui/flip-words';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

const METEORS = [
  { left: '8%', delay: '0.1s', duration: '5s' },
  { left: '18%', delay: '0.8s', duration: '6s' },
  { left: '28%', delay: '0.3s', duration: '4.5s' },
  { left: '41%', delay: '1.4s', duration: '7s' },
  { left: '53%', delay: '0.6s', duration: '5.5s' },
  { left: '64%', delay: '1.9s', duration: '4s' },
  { left: '76%', delay: '0.4s', duration: '6.5s' },
  { left: '88%', delay: '1.1s', duration: '5s' },
  { left: '12%', delay: '2.2s', duration: '8s' },
  { left: '47%', delay: '2.6s', duration: '4.8s' },
  { left: '71%', delay: '1.7s', duration: '7.2s' },
  { left: '93%', delay: '0.9s', duration: '5.8s' },
];

const BIDS = [
  { name: 'Summit Lawn Co.', amount: '$118', rating: '4.9', highlight: true },
  { name: 'Apex Exteriors', amount: '$142', rating: '4.8', highlight: false },
  { name: 'Greenline Pros', amount: '$165', rating: '5.0', highlight: false },
];

export function HeroSection() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  return (
    <section className="relative min-h-[100vh] overflow-hidden pt-24">
      <Spotlight
        className="left-0 -top-40 md:-top-20 md:left-60"
        fill="#02ddf5"
      />
      <Spotlight
        className="-top-10 left-full h-[80%] w-[50%] opacity-40"
        fill="#02ddf5"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(2,221,245,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        {METEORS.map((meteor, index) => (
          <span
            key={index}
            className="absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-cyan-400 shadow-[0_0_0_1px_#ffffff10]"
            style={{
              left: meteor.left,
              animationDelay: meteor.delay,
              animationDuration: meteor.duration,
            }}
          >
            <span className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-transparent" />
          </span>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
        <div className="text-center lg:text-left">
          <Badge className="gap-2 mb-6 text-cyan-700 border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/10 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Subscriptions and on-demand services
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            Your property&apos;s exterior
            <br />
            <span className="relative inline-block min-h-[1.15em]">
              <FlipWords
                words={['on autopilot.', 'on schedule.', 'handled.']}
                className="px-0 text-cyan-500 dark:text-cyan-400"
              />
            </span>
          </h1>

          <TextGenerateEffect
            words="Subscribe to recurring lawn care, landscaping, gutter cleaning, and more. Need a one-time job? Post a request and let verified local pros compete with their best bids."
            className="mx-auto mt-6 max-w-xl text-base font-normal sm:text-lg lg:mx-0"
            duration={0.35}
          />

          <div className="flex flex-col gap-4 items-center mt-10 sm:flex-row lg:justify-start">
            <HoverBorderGradient
              as="button"
              containerClassName="rounded-full"
              className="flex items-center px-7 py-3 text-sm font-semibold dark:bg-black"
              onClick={goLogin}
            >
              Browse plans
            </HoverBorderGradient>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 rounded-full"
              onClick={goLogin}
            >
              Join as a provider
            </Button>
          </div>

          <div className="flex flex-wrap gap-y-3 gap-x-6 justify-center items-center mt-10 text-sm text-muted-foreground lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-cyan-500" /> Recurring plans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" /> Verified providers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-emerald-500" /> Real-time
              tracking
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Competitive bidding
            </span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
      <motion.div
        className="hidden absolute -right-4 -top-6 z-20 sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl border-cyan-500/30 bg-background/90 shadow-cyan-500/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
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
        <div className="overflow-hidden relative p-5 rounded-3xl border shadow-2xl backdrop-blur-xl border-white/10 bg-background/70 shadow-black/20 dark:bg-black/50">
          <GlowingEffect
            disabled={false}
            glow
            proximity={64}
            spread={32}
            borderWidth={2}
          />

          <div className="flex relative justify-between items-center mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
                Live marketplace
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                Gutter cleaning
              </p>
            </div>
            <Badge className="text-emerald-600 border-0 bg-emerald-500/15 hover:bg-emerald-500/15 dark:text-emerald-400">
              3 bids
            </Badge>
          </div>

          <div className="relative p-4 mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex gap-3 justify-between items-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Active plan
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Standard Exterior
                </p>
              </div>
              <p className="text-lg font-bold text-cyan-500">$179</p>
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
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : 'border-border bg-background/60',
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {bid.name}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {bid.rating} · verified
                  </p>
                </div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    bid.highlight ? 'text-cyan-500' : 'text-foreground',
                  )}
                >
                  {bid.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
