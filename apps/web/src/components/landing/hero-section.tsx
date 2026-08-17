'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarCheck, Check, Repeat, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FlipWords } from '@/components/ui/flip-words';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  return (
    <section className="relative min-h-[100vh] overflow-hidden pt-24">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="object-cover absolute inset-0 w-full h-full"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/75 dark:bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background dark:from-black dark:via-black/40 dark:to-black" />
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="flex relative flex-col items-center px-6 pt-24 pb-24 mx-auto max-w-5xl text-center sm:pt-32">
        <Badge className="gap-2 mb-6 text-cyan-700 border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/10 dark:text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Subscriptions and on-demand services
        </Badge>

        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
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
          className="mx-auto mt-6 max-w-2xl text-base font-normal sm:text-lg"
          duration={0.35}
        />

        <div className="flex flex-col gap-4 justify-center items-center mt-10 sm:flex-row">
          <MovingBorderButton
            borderRadius="0.85rem"
            duration={2500}
            type="button"
            containerClassName="h-14 w-52"
            className="text-sm font-semibold text-white border-slate-800/60 bg-slate-950/80"
            onClick={goLogin}
          >
            Browse plans
          </MovingBorderButton>

          <Button
            size="lg"
            variant="outline"
            className="px-8 h-14 rounded-xl"
            onClick={goLogin}
          >
            Join as a provider
          </Button>
        </div>

        <div className="flex flex-wrap gap-y-3 gap-x-6 justify-center items-center mt-12 text-sm text-muted-foreground">
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
    </section>
  );
}
