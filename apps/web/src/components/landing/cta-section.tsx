'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';

export function CtaSection() {
  const router = useRouter();
  const goLogin = () => router.push('/login');

  return (
    <section className="overflow-hidden relative py-24">
      <Spotlight
        className="-top-40 left-1/2 h-[80%] w-[80%] -translate-x-1/2"
        fill="#02ddf5"
      />
      <div className="relative px-6 mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground sm:text-5xl">
          Ready to transform your property?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Pick a subscription plan for hands-off recurring care, or post a
          one-time job and let providers compete for your business.
        </p>
        <div className="flex flex-col gap-4 justify-center items-center mt-10 sm:flex-row">
          <MovingBorderButton
            borderRadius="0.85rem"
            duration={2500}
            type="button"
            containerClassName="h-14 w-64"
            className="text-sm font-semibold text-white border-slate-800/60 bg-slate-950/80"
            onClick={goLogin}
          >
            Browse subscription plans
          </MovingBorderButton>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-14 rounded-xl"
            onClick={goLogin}
          >
            List your business
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
