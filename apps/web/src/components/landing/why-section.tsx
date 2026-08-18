'use client';

import Image from 'next/image';
import { Bell, Camera, Repeat, ShieldCheck, Target, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { SectionEyebrow } from './section-eyebrow';

type Cell = {
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
  className: string;
};

const CELLS: Cell[] = [
  {
    title: 'Exterior work only',
    description:
      'We do not also do dog walking and tax prep. The whole product is built around lawns, gutters, siding, and roofs, so the providers here actually do this for a living.',
    icon: Target,
    image: '/services/lawn-maintenance.jpg',
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    title: 'Verified before they bid',
    description:
      'Every provider is reviewed and payout-verified before they can touch a job.',
    icon: ShieldCheck,
    className: 'md:col-span-1',
  },
  {
    title: 'They compete, you choose',
    description:
      'Real bids with real prices, side by side. No auto-matching to whoever paid the most.',
    icon: Users,
    className: 'md:col-span-1',
  },
  {
    title: 'Set it once, it just runs',
    description:
      'A plan turns seasonal chores into a calendar. Your provider stays assigned instead of restarting the search every visit.',
    icon: Repeat,
    image: '/services/landscaping.webp',
    className: 'md:col-span-2',
  },
  {
    title: 'Photo proof, every visit',
    description:
      'Crews upload before and after shots on site. You see the work whether you were home or not.',
    icon: Camera,
    className: 'md:col-span-1',
  },
  {
    title: 'Updates without asking',
    description:
      'SMS and in-app alerts at every step, from first bid through completion.',
    icon: Bell,
    className: 'md:col-span-1',
  },
];

export function WhySection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-3xl">
          <SectionEyebrow>Why Exterior Pro</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Not another lead-gen site.
            <span className="mt-2 block text-muted-foreground">
              A system for keeping a property up.
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Generic marketplaces sell your phone number to five contractors and
            wish you luck. Exterior Pro combines recurring service plans with a
            competitive bidding marketplace, built for one industry instead of
            two hundred.
          </p>
        </div>

        <div className="grid auto-rows-[13rem] grid-cols-1 gap-4 md:grid-cols-4">
          {CELLS.map((cell, index) => (
            <motion.div
              key={cell.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={cn('relative', cell.className)}
            >
              <div className="group relative flex h-full flex-col justify-end overflow-hidden rounded-3xl border border-border bg-background/70 p-6 backdrop-blur-xl">
                <GlowingEffect
                  disabled={false}
                  glow
                  proximity={72}
                  spread={30}
                  borderWidth={2}
                />

                {cell.image ? (
                  <>
                    <Image
                      src={cell.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/25" />
                  </>
                ) : null}

                <div className="relative">
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-xl border',
                      cell.image
                        ? 'border-white/20 bg-white/10'
                        : 'border-brand-lime/25 bg-brand-lime/10',
                    )}
                  >
                    <cell.icon className="h-4 w-4 text-brand-lime" />
                  </span>
                  <h3
                    className={cn(
                      'mt-4 text-lg font-bold tracking-tight',
                      cell.image ? 'text-white' : 'text-foreground',
                    )}
                  >
                    {cell.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 text-sm leading-relaxed',
                      cell.image ? 'text-white/75' : 'text-muted-foreground',
                    )}
                  >
                    {cell.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
