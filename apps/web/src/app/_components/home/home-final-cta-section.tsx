'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function HomeFinalCtaSection() {
  const router = useRouter();

  return (
    <section className="pb-28 pt-8">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-black/[0.06] bg-white/80 px-8 py-16 text-center shadow-[0_20px_60px_-24px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:px-14">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Subscriptions for set-and-forget care, or one-time jobs with
            competing bids — your call.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="h-12 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Browse plans
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="h-12 rounded-full border-black/15 bg-transparent px-8 text-base dark:border-white/15"
            >
              List your business
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
