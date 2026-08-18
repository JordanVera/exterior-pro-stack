'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MousePointer2 } from 'lucide-react';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { SectionEyebrow } from './section-eyebrow';
import { SERVICES } from './data';

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>All services</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Anything outside the walls.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Every service works two ways: fold it into a recurring plan, or post
            it as a one-time job and take bids. Same verified providers either
            way.
          </p>
        </div>
      </div>

      <Carousel
        className="mt-12"
        controlsSlot={
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointer2 className="h-4 w-4 text-brand-lime" />
            Drag or swipe to explore all {SERVICES.length} services
          </p>
        }
      >
        {SERVICES.map((service) => (
          <CarouselItem key={service.title} className="w-[78vw] sm:w-[22rem]">
            <Link
              href={service.link}
              className="group relative flex h-[26rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-brand-navy p-6 shadow-lg transition duration-300 hover:border-brand-lime/40 sm:h-[28rem]"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 640px) 78vw, 22rem"
                className="object-cover transition duration-700 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

              <span className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                {service.tag}
              </span>

              <div className="relative">
                <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
                  {service.title}
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-lime opacity-0 transition duration-300 group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-lime">
                  Get a price
                </span>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  );
}
