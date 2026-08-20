'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { loginPath } from '@/lib/auth-intent';
import { FAQS } from './data';

export function FaqSection() {
  return (
    <section id="faq" className="py-20 scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Sticky dark left panel */}
        <div className="overflow-hidden relative rounded-3xl bg-brand-navy lg:sticky lg:top-28 lg:self-start">
          {/* Photo texture */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/services/lawn-maintenance.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-brand-navy/75" />
          </div>

          {/* Beams — very subtle */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
            <BackgroundBeams variant="lime" />
          </div>

          <div className="relative z-10 p-8">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-lime">
              <span className="w-6 h-px bg-brand-lime" />
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Questions, answered.
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Still not sure? Signing up takes an email address and about two
              minutes, and there is nothing to cancel if you change your mind.
            </p>
            <Link
              href={loginPath('customer')}
              className="inline-flex gap-2 items-center mt-6 text-sm font-semibold transition text-brand-lime group"
            >
              Get started free
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-base text-left hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
