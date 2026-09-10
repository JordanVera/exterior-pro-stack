'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { FlipWords } from '@/components/ui/flip-words';
import { SegmentedTabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { loginPath } from '@/lib/auth-intent';
import { useAudience, type Audience } from './audience-context';
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Home,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
} from 'lucide-react';

const HERO_POSTER = '/hero/exterior-broll.jpg';
// Clip sources (all live video, commercially usable):
// gutter — Mixkit 2716, Stock Video Free License (rain off a roof/eave)
// lights — Coverr “House decorated with Christmas lights”, free commercial
// weeds  — Wikimedia “Weed whacker - kanagawa” by Nesnad, CC BY 4.0
// wash   — Pexels 4451962, free to use
const HERO_CLIPS = [
  '/hero/clips/water.mp4',
  '/hero/clips/leaves.mp4',
  '/hero/clips/hedge.mp4',
  '/hero/clips/lawn.mp4',
  '/hero/clips/gutter.mp4',
  '/hero/clips/weeds.mp4',
  // '/hero/clips/lights.mp4',
  // '/hero/clips/wash.mp4',
] as const;
const CLIP_HOLD_MS = 2800;

function HeroVideoBackground() {
  const [index, setIndex] = useState(0);
  const nodes = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_CLIPS.length);
    }, CLIP_HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    nodes.current.forEach((el, i) => {
      if (!el) return;
      if (i === index) {
        el.currentTime = 0;
        void el.play();
      } else {
        el.pause();
      }
    });
  }, [index]);

  return (
    <div className="overflow-hidden absolute inset-0" aria-hidden>
      <Image
        src={HERO_POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        draggable={false}
      />
      {HERO_CLIPS.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          className={cn(
            'absolute inset-0 h-full w-full object-cover motion-reduce:hidden transition-opacity duration-500',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
          src={src}
          muted
          loop
          playsInline
          autoPlay={i === 0}
          preload={i < 2 ? 'auto' : 'metadata'}
          poster={i === 0 ? HERO_POSTER : undefined}
        />
      ))}

      {/* Left-heavy gradient so copy is always legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      {/* Top and bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-b via-transparent from-black/40 to-black/55" />
    </div>
  );
}

const HERO_COPY = {
  homeowner: {
    badge: 'For homeowners and property managers',
    lead: 'Never think about',
    words: [
      'lawn care',
      'gutter cleaning',
      'pressure washing',
      'weed control',
      'holiday lights',
    ],
    trail: 'again.',
    sub: 'Subscribe to a recurring exterior plan and the same verified crew shows up on schedule. Or post a one-time job and let local pros compete for it.',
    primary: { label: 'Get my property handled', href: loginPath('customer') },
    secondary: { label: 'See plans and pricing', href: '#pricing' },
    trust: [
      { icon: ShieldCheck, text: 'Verified providers' },
      { icon: CalendarCheck, text: 'Pause or cancel anytime' },
      { icon: CreditCard, text: 'Secure payments via Stripe' },
    ],
  },
  provider: {
    badge: 'For exterior service businesses',
    lead: 'Fill your calendar with',
    words: [
      'lawn routes',
      'gutter jobs',
      'wash jobs',
      'paint work',
      'recurring plans',
    ],
    trail: 'you actually want.',
    sub: 'Bid on real jobs in your service area, hold a book of recurring subscription customers, and run your crews from one calendar and a field app.',
    primary: { label: 'Join as a provider', href: loginPath('provider') },
    secondary: { label: 'See what you get', href: '#providers' },
    trust: [
      { icon: Truck, text: 'No shared leads' },
      { icon: CalendarCheck, text: 'Recurring, sticky customers' },
      { icon: CreditCard, text: 'Payouts on completion' },
    ],
  },
} as const;

export function HeroSection() {
  const { audience, setAudience } = useAudience();
  const copy = HERO_COPY[audience];

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28 sm:pt-32">
      <HeroVideoBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ── Copy ── */}
        <div>
          <SegmentedTabs
            options={[
              {
                value: 'homeowner',
                label: "I'm a homeowner",
                icon: <Home className="h-3.5 w-3.5" />,
              },
              {
                value: 'provider',
                label: "I'm a provider",
                icon: <Wrench className="h-3.5 w-3.5" />,
              },
            ]}
            value={audience}
            onChange={(value) => setAudience(value as Audience)}
            layoutId="hero-audience"
            className="mb-8"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping bg-brand-lime" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-lime" />
                </span>
                {copy.badge}
              </p>

              <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]">
                {copy.lead}
                <br />
                <span className="relative inline-flex min-h-[1.15em] items-baseline">
                  <FlipWords
                    words={[...copy.words]}
                    className="px-2 rounded-xl bg-brand-lime/90 text-brand-ink"
                  />
                </span>
                <br className="hidden sm:block" />
                <span className="text-white/90"> {copy.trail}</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {copy.sub}
              </p>

              <div className="flex flex-col gap-3 mt-9 sm:flex-row sm:items-center">
                <Link
                  href={copy.primary.href}
                  className="inline-flex gap-2 justify-center items-center px-7 py-4 text-base font-semibold rounded-full shadow-lg transition group bg-brand-lime text-brand-ink shadow-brand-lime/25 hover:bg-brand-lime/90 hover:shadow-xl hover:shadow-brand-lime/30"
                >
                  {copy.primary.label}
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href={copy.secondary.href}
                  className="inline-flex justify-center items-center px-7 py-4 text-base font-semibold text-white rounded-full border backdrop-blur-sm transition border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50"
                >
                  {copy.secondary.label}
                </Link>
              </div>

              <p className="mt-4 text-sm text-white/60">
                {audience === 'homeowner'
                  ? 'Free to join. No contracts. Cancel in two taps.'
                  : 'Free to join and free to bid. You only pay when you get paid.'}
              </p>

              <div className="flex flex-wrap gap-y-3 gap-x-6 items-center mt-8 text-sm text-white/70">
                {copy.trust.map((item) => (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-1.5"
                  >
                    <item.icon className="w-4 h-4 text-brand-lime" />
                    {item.text}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Preview card (desktop only) ── */}
        <HeroPreview audience={audience} />
      </div>
    </section>
  );
}

const BIDS = [
  { name: 'Summit Lawn Co.', amount: '$118', rating: '4.9', highlight: true },
  { name: 'Apex Exteriors', amount: '$142', rating: '4.8', highlight: false },
  { name: 'Greenline Pros', amount: '$165', rating: '5.0', highlight: false },
];

const ROUTE = [
  { time: '8:00', job: 'Gutter clean · 412 Aspen Ct', status: 'Done' },
  { time: '10:30', job: 'Weekly mow · 88 Rosewood Dr', status: 'In progress' },
  { time: '1:00', job: 'Driveway wash · 5 Kettle Ln', status: 'Scheduled' },
];

function HeroPreview({ audience }: { audience: Audience }) {
  return (
    <div className="hidden relative mx-auto w-full max-w-lg lg:mx-0 lg:block lg:max-w-none">
      <motion.div
        className="hidden absolute -right-2 -top-6 z-20 sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="px-4 py-3 rounded-2xl border shadow-xl bg-card border-brand-lime/30 dark:border-brand-lime/25 dark:bg-brand-navy/95 dark:backdrop-blur-xl">
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-navy dark:text-brand-lime">
            {audience === 'homeowner' ? 'New bid' : 'New job in your area'}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-brand-navy dark:text-white">
            {audience === 'homeowner'
              ? 'Summit Lawn Co. · $118'
              : 'Gutter clean · 2.1 mi away'}
          </p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="overflow-hidden relative p-5 rounded-3xl border shadow-2xl backdrop-blur-xl bg-card border-border dark:border-white/10 dark:bg-brand-navy/90">
          <GlowingEffect
            disabled={false}
            glow
            proximity={64}
            spread={32}
            borderWidth={2}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="relative"
            >
              {audience === 'homeowner' ? (
                <HomeownerPreview />
              ) : (
                <ProviderPreview />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function HomeownerPreview() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy dark:text-brand-lime">
            Live marketplace
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-ink dark:text-white">
            Gutter cleaning
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-lime/20 text-brand-navy dark:text-brand-lime">
          3 bids
        </span>
      </div>

      <div className="p-3 mb-4 rounded-2xl border border-brand-lime/30 bg-brand-lime/10 dark:border-brand-lime/25 dark:bg-brand-lime/10">
        <div className="flex gap-3 justify-between items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-navy/60 dark:text-white/50">
              Active plan
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-ink dark:text-white">
              Standard Exterior
            </p>
          </div>
          <p className="text-lg font-bold text-brand-navy dark:text-brand-lime">
            $179
          </p>
        </div>
        <p className="mt-2 text-xs text-brand-navy/60 dark:text-white/50">
          Next visit Tuesday · Lawn, weeds, gutters
        </p>
      </div>

      <div className="space-y-2">
        {BIDS.map((bid, index) => (
          <motion.div
            key={bid.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.08 }}
            className={cn(
              'flex items-center justify-between rounded-xl border px-3.5 py-3',
              bid.highlight
                ? 'border-brand-lime/40 bg-brand-lime/10'
                : 'border-border bg-muted/70 dark:border-white/10 dark:bg-white/5',
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-brand-ink dark:text-white">
                {bid.name}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-navy/50 dark:text-white/45">
                <Star className="w-3 h-3 fill-brand-lime text-brand-lime" />
                {bid.rating} · verified
              </p>
            </div>
            <p
              className={cn(
                'text-sm font-semibold',
                bid.highlight
                  ? 'text-brand-navy dark:text-brand-lime'
                  : 'text-brand-ink/70 dark:text-white/80',
              )}
            >
              {bid.amount}
            </p>
          </motion.div>
        ))}
      </div>

      <Link
        href={loginPath('customer')}
        className="flex justify-center items-center px-4 py-3 mt-4 w-full text-sm font-semibold rounded-xl transition bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
      >
        See it on your property
      </Link>
    </>
  );
}

function ProviderPreview() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy dark:text-brand-lime">
            Today · Crew A
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-ink dark:text-white">
            3 jobs · 11.4 miles
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-lime/20 text-brand-navy dark:text-brand-lime">
          On track
        </span>
      </div>

      <div className="p-3 mb-4 rounded-2xl border border-brand-lime/30 bg-brand-lime/10 dark:border-brand-lime/25 dark:bg-brand-lime/10">
        <div className="flex gap-3 justify-between items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-navy/60 dark:text-white/50">
              Recurring book
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-ink dark:text-white">
              22 subscription properties
            </p>
          </div>
          <p className="text-lg font-bold text-brand-navy dark:text-brand-lime">
            $4,180
          </p>
        </div>
        <p className="mt-2 text-xs text-brand-navy/60 dark:text-white/50">
          Expected this month · no re-bidding
        </p>
      </div>

      <div className="space-y-2">
        {ROUTE.map((item, index) => (
          <motion.div
            key={item.job}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.08 }}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3',
              item.status === 'In progress'
                ? 'border-brand-lime/40 bg-brand-lime/10'
                : 'border-border bg-muted/70 dark:border-white/10 dark:bg-white/5',
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-brand-ink dark:text-white">
                {item.job}
              </p>
              <p className="mt-0.5 text-xs text-brand-navy/50 dark:text-white/45">
                {item.time}
              </p>
            </div>
            <p className="text-xs font-semibold shrink-0 text-brand-navy/60 dark:text-white/50">
              {item.status}
            </p>
          </motion.div>
        ))}
      </div>

      <Link
        href={loginPath('provider')}
        className="flex justify-center items-center px-4 py-3 mt-4 w-full text-sm font-semibold rounded-xl transition bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
      >
        Start winning jobs
      </Link>
    </>
  );
}
