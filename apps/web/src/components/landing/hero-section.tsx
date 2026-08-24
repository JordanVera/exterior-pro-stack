'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
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
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { FlipWords } from '@/components/ui/flip-words';
import { SegmentedTabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { loginPath } from '@/lib/auth-intent';
import { useAudience, type Audience } from './audience-context';

// 4 images × 8 s each = 32 s per full cycle (matches keyframes in globals.css)
const KB_DURATION = 32;
const KB_IMAGES = [
  { src: '/services/lawn-maintenance.jpg', animName: 'hero-kb-a', delay: 0 },
  { src: '/services/landscaping.webp', animName: 'hero-kb-b', delay: 8 },
  { src: '/services/pressure-washing.png', animName: 'hero-kb-a', delay: 16 },
  { src: '/services/gutter-cleaning.jpg', animName: 'hero-kb-b', delay: 24 },
] as const;

function KenBurnsBackground() {
  return (
    <div className="overflow-hidden absolute inset-0" aria-hidden>
      {KB_IMAGES.map(({ src, animName, delay }) => (
        <div
          key={src}
          className="absolute inset-0 will-change-transform"
          style={{
            opacity: 0,
            animationName: animName,
            animationDuration: `${KB_DURATION}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${delay}s`,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={delay === 0}
            sizes="100vw"
            className="object-cover"
            draggable={false}
          />
        </div>
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
      <KenBurnsBackground />

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

      <div className="mb-4 rounded-2xl border border-brand-lime/30 bg-brand-lime/10 dark:border-brand-lime/25 dark:bg-brand-lime/10">
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
