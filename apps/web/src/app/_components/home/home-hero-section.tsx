'use client';

import { useRouter } from 'next/navigation';
import { Check, CalendarCheck, Repeat, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HomeHeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 object-cover w-full h-full"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/90 via-white/85 to-green-50/90 dark:from-cyan-950/60 dark:via-black/75 dark:to-green-950/60" />
      <div className="relative px-6 pt-20 pb-20 mx-auto max-w-7xl sm:pt-28">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="gap-2 mb-2 border-0 bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-950/50">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Subscription Plans &amp; On-Demand Services
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Your Property&apos;s Exterior
            <br />
            <span className="text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-green-600 bg-clip-text">
              On Autopilot
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Subscribe to recurring lawn care, landscaping, gutter cleaning, and
            more. Need a one-time job? Post a request and let verified local
            pros compete with their best bids.
          </p>
          <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="text-lg text-black bg-cyan-500 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-600/25 rounded-xl"
            >
              Browse Plans
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="text-lg rounded-xl"
            >
              Join as a Provider
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground sm:gap-8">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-cyan-500" />
              Recurring plans
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-500" />
              Verified providers
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-green-500" />
              Real-time tracking
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" />
              Competitive bidding
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
