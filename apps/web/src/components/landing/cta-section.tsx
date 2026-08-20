'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Home, Wrench } from 'lucide-react';
import { loginPath } from '@/lib/auth-intent';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6">
      {/* Lamp glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          initial={{ opacity: 0, width: '8rem' }}
          whileInView={{ opacity: 1, width: '36rem' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-px bg-gradient-to-r from-transparent via-brand-lime to-transparent"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-[38rem] max-w-full rounded-full bg-brand-lime/20 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Your property is not going to
          <span className="block text-brand-navy dark:text-brand-lime">
            take care of itself.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Two minutes to sign up. No contract, no sales call, no credit card
          until you accept a price you picked.
        </p>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <Link
            href={loginPath('customer')}
            className="group relative overflow-hidden rounded-3xl border border-brand-lime/40 bg-brand-lime p-7 text-brand-ink transition hover:shadow-xl hover:shadow-brand-lime/20"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
              <Home className="h-3.5 w-3.5" />
              Homeowners
            </span>
            <p className="mt-3 text-2xl font-bold leading-snug">
              Get my property handled
            </p>
            <p className="mt-2 text-sm text-brand-ink/70">
              Start a plan or post a job and compare real bids today.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
              Get started free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href={loginPath('provider')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-navy p-7 text-white transition hover:border-brand-lime/50"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-lime/20 blur-3xl" />
            <span className="relative inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
              <Wrench className="h-3.5 w-3.5" />
              Providers
            </span>
            <p className="relative mt-3 text-2xl font-bold leading-snug">
              Fill my crew&apos;s calendar
            </p>
            <p className="relative mt-2 text-sm text-white/70">
              Bid on open jobs, dispatch crews, and hold recurring customers.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-lime">
              Join as a provider
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
