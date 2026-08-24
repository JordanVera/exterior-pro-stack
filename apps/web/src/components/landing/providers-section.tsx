'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Banknote,
  CalendarRange,
  Camera,
  Gavel,
  Smartphone,
  Users,
} from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { WobbleCard } from '@/components/ui/wobble-card';
import { loginPath } from '@/lib/auth-intent';
import { PROVIDER_FEATURES } from './data';

const ICONS = [Users, CalendarRange, Gavel, Banknote, Smartphone, Camera];

export function ProvidersSection() {
  return (
    <section id="providers" className="px-4 py-16 scroll-mt-24 sm:px-6">
      <WobbleCard containerClassName="mx-auto max-w-6xl">
        <BackgroundBeams className="opacity-40" />

        <div className="relative px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-lime">
                <span className="w-6 h-px bg-brand-lime" />
                For providers
              </p>
              <h2 className="text-3xl font-bold tracking-tight leading-tight text-white sm:text-5xl">
                Stop buying leads.
                <span className="block text-brand-lime">
                  Start booking work.
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
                Exterior Pro is not a lead list. It is the operations layer for
                your business: bidding, scheduling, crew dispatch, a field app
                for the truck, and a book of recurring customers that stays
                yours.
              </p>

              <div className="flex flex-col gap-3 mt-8 sm:flex-row">
                <Link
                  href={loginPath('provider')}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-lime px-7 py-3.5 text-sm font-semibold text-brand-ink transition hover:bg-brand-lime/90"
                >
                  Join as a provider
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contractor-agreement"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-brand-lime/50"
                >
                  Read the terms
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 mt-10 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-brand-lime">$0</p>
                  <p className="mt-1 text-sm text-white/60">
                    To join, build a profile, and bid
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-brand-lime">
                    On completion
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Payouts transfer after the job is marked done
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PROVIDER_FEATURES.map((feature, index) => {
                const Icon = ICONS[index % ICONS.length];
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-brand-lime/40 hover:bg-white/[0.07]"
                  >
                    <span className="inline-flex justify-center items-center w-9 h-9 rounded-xl border border-brand-lime/25 bg-brand-lime/10">
                      <Icon className="w-4 h-4 text-brand-lime" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {feature.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </WobbleCard>
    </section>
  );
}
