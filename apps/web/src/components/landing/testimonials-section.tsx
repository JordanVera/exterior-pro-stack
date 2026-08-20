'use client';

import { Star } from 'lucide-react';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { SectionEyebrow } from './section-eyebrow';
import { HOMEOWNER_TESTIMONIALS, PROVIDER_TESTIMONIALS } from './data';

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Both sides of the job</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Homeowners get their weekends back. Crews get their calendar full.
          </h2>
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-4 w-4 fill-brand-lime text-brand-lime"
                />
              ))}
            </span>
            4.9 average rating across completed jobs
          </div>
        </div>
      </div>

      <div className="mt-14 space-y-4">
        <div className="flex justify-center">
          <InfiniteMovingCards
            items={[...HOMEOWNER_TESTIMONIALS]}
            direction="left"
            speed="slow"
          />
        </div>
        <div className="flex justify-center">
          <InfiniteMovingCards
            items={[...PROVIDER_TESTIMONIALS]}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
}
