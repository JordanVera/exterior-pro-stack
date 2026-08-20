'use client';

import { Star } from 'lucide-react';
import { WobbleCard } from '@/components/ui/wobble-card';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { SectionEyebrow } from './section-eyebrow';
import { HOMEOWNER_TESTIMONIALS, PROVIDER_TESTIMONIALS } from './data';

function Stars() {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-brand-lime text-brand-lime" />
      ))}
    </span>
  );
}

export function TestimonialsSection() {
  return (
    <section className="overflow-hidden relative py-20">
      <div className="px-6 mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-12 max-w-2xl">
          <SectionEyebrow>Both sides of the job</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Homeowners get their weekends back.{' '}
            <span className="text-brand-navy dark:text-brand-lime">
              Crews get their calendar full.
            </span>
          </h2>
          <div className="flex gap-2 items-center mt-5 text-sm text-muted-foreground">
            <Stars />
            4.9 average rating across completed jobs
          </div>
        </div>

        {/* Featured WobbleCard grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Big homeowner quote — spans 2 cols */}
          <WobbleCard containerClassName="col-span-1 lg:col-span-2 min-h-[220px]">
            <div className="p-7 lg:p-8">
              <div className="mb-4">
                <Stars />
              </div>
              <blockquote className="text-base font-medium leading-relaxed text-white sm:text-lg">
                &ldquo;{HOMEOWNER_TESTIMONIALS[0].quote}&rdquo;
              </blockquote>
              <div className="flex gap-3 items-center mt-6">
                <span className="flex justify-center items-center w-9 h-9 text-xs font-bold rounded-full shrink-0 bg-brand-lime/20 text-brand-lime">
                  {HOMEOWNER_TESTIMONIALS[0].name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {HOMEOWNER_TESTIMONIALS[0].name}
                  </p>
                  <p className="text-xs text-white/60">
                    {HOMEOWNER_TESTIMONIALS[0].title}
                  </p>
                </div>
              </div>
            </div>
          </WobbleCard>

          {/* Two stat micro-cards stacked on the right */}
          <div className="flex flex-row col-span-1 gap-4 lg:flex-col">
            <WobbleCard containerClassName="flex-1">
              <div className="p-6">
                <p className="text-5xl font-bold tracking-tight text-brand-lime">
                  4.9
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Average rating
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Rated after every completed job
                </p>
              </div>
            </WobbleCard>
            <WobbleCard containerClassName="flex-1">
              <div className="p-6">
                <p className="text-5xl font-bold tracking-tight text-brand-lime">
                  4h
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  To first bid
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Most jobs get 3 bids same day
                </p>
              </div>
            </WobbleCard>
          </div>

          {/* Provider quote — full width */}
          <WobbleCard containerClassName="col-span-1 min-h-[140px] lg:col-span-3">
            <div className="flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div>
                <div className="mb-3">
                  <Stars />
                </div>
                <blockquote className="max-w-2xl text-base font-medium leading-relaxed text-white sm:text-lg">
                  &ldquo;{PROVIDER_TESTIMONIALS[0].quote}&rdquo;
                </blockquote>
              </div>
              <div className="shrink-0">
                <p className="text-sm font-semibold text-white">
                  {PROVIDER_TESTIMONIALS[0].name}
                </p>
                <p className="text-xs text-white/55">
                  {PROVIDER_TESTIMONIALS[0].title}
                </p>
              </div>
            </div>
          </WobbleCard>
        </div>
      </div>

      {/* Infinite-scroll cards */}
      <div className="mt-14 space-y-4">
        <InfiniteMovingCards
          items={[...HOMEOWNER_TESTIMONIALS]}
          direction="left"
          speed="slow"
        />
        <InfiniteMovingCards
          items={[...PROVIDER_TESTIMONIALS]}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  );
}
