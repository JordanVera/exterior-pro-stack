'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HomeFinalCtaSection() {
  const router = useRouter();

  return (
    <section className="py-24">
      <div className="max-w-4xl px-6 mx-auto text-center">
        <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Ready to Transform Your Property?
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
          Pick a subscription plan for hands-off recurring care, or post a
          one-time job and let providers compete for your business.
        </p>
        <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="text-lg text-black bg-cyan-500 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-600/25 rounded-xl"
          >
            Browse Subscription Plans
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/login')}
            className="text-lg rounded-xl"
          >
            List Your Business
          </Button>
        </div>
      </div>
    </section>
  );
}
