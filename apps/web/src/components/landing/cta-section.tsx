'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Home, Wrench } from 'lucide-react';
import { loginPath } from '@/lib/auth-intent';

export function CtaSection() {
  return (
    <section className="overflow-hidden relative px-4 py-24 sm:px-6">
      {/* Photo + navy wash in dark mode; cream surface in light mode */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <Image
          src="/services/lawn-maintenance.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-0 dark:opacity-100"
        />
        <div className="absolute inset-0 bg-background dark:bg-brand-navy/85" />
        <div className="absolute inset-x-0 -top-20 mx-auto h-72 w-[42rem] max-w-full rounded-full bg-brand-lime/15 blur-[100px]" />
      </div>

      {/* Animated top line */}
      <div className="flex absolute inset-x-0 top-0 justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, width: '8rem' }}
          whileInView={{ opacity: 1, width: '36rem' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-px bg-gradient-to-r from-transparent to-transparent via-brand-lime"
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground dark:text-white sm:text-5xl">
          Your property is not going to
          <span className="block mt-2 text-brand-lime">
            take care of itself.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground dark:text-white/70">
          Two minutes to sign up. No contract, no sales call, no credit card
          until you accept a price you picked.
        </p>

        <div className="grid gap-4 mt-12 text-left sm:grid-cols-2">
          <Link
            href={loginPath('customer')}
            className="overflow-hidden relative p-7 rounded-3xl border transition group border-brand-lime/40 bg-brand-lime text-brand-ink hover:shadow-xl hover:shadow-brand-lime/25"
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
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href={loginPath('provider')}
            className="overflow-hidden relative p-7 rounded-3xl border backdrop-blur-sm transition group border-border bg-card text-foreground hover:border-brand-lime/40 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-brand-lime/40 dark:hover:bg-white/15"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-brand-lime/15" />
            <span className="relative inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
              <Wrench className="h-3.5 w-3.5" />
              Providers
            </span>
            <p className="relative mt-3 text-2xl font-bold leading-snug">
              Fill my crew&apos;s calendar
            </p>
            <p className="relative mt-2 text-sm text-muted-foreground dark:text-white/65">
              Bid on open jobs, dispatch crews, and hold recurring customers.
            </p>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-lime">
              Join as a provider
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
