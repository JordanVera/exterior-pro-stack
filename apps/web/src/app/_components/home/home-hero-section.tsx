'use client';

import { useRouter } from 'next/navigation';
import { Check, CalendarCheck, Repeat, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HomeHeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-70"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/78 to-[#f5f5f7] dark:from-black/88 dark:via-black/82 dark:to-black" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-400/10 dark:from-blue-600/15 dark:to-cyan-500/10" />
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(80,100,140,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(80,100,140,0.08) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 gap-2 rounded-full border border-black/[0.08] bg-white/80 px-4 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            Subscription plans &amp; on-demand services
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            Your property&apos;s exterior,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-400 dark:to-cyan-400">
              on autopilot.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Subscribe to recurring lawn care, landscaping, gutter cleaning, and
            more. Need a one-time job? Post a request and let verified local pros
            compete with their best bids.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Browse plans
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="h-14 rounded-full border-black/15 bg-white/50 px-8 text-base backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.04]"
            >
              Join as a provider
            </Button>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Repeat, label: "Recurring plans" },
              { icon: Shield, label: "Verified pros" },
              { icon: CalendarCheck, label: "Live tracking" },
              { icon: Check, label: "Smart bidding" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 text-left text-xs font-medium text-foreground shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.04] sm:text-sm"
              >
                <Icon className="mb-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
