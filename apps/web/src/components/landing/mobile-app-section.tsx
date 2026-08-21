'use client';

import { motion } from 'motion/react';
import {
  Apple,
  Bell,
  Briefcase,
  Calendar,
  Camera,
  Home,
  MapPin,
  Navigation,
  PlayCircle,
  Smartphone,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionEyebrow } from './section-eyebrow';

type AudienceCard = {
  icon: React.ElementType;
  label: string;
  headline: string;
  features: { icon: React.ElementType; text: string }[];
  accent: string;
  iconBg: string;
};

const AUDIENCES: AudienceCard[] = [
  {
    icon: Home,
    label: 'Homeowners',
    headline: 'Your property, always in check.',
    features: [
      { icon: Briefcase, text: 'Request a job and get competing bids' },
      { icon: Bell, text: 'Real-time alerts from bid to completion' },
      { icon: Camera, text: 'Before & after photos after every visit' },
      { icon: Wallet, text: 'Review spending and approve payments' },
    ],
    accent: 'border-brand-lime/30 bg-brand-lime/5',
    iconBg: 'border-brand-lime/25 bg-brand-lime/10 text-brand-lime',
  },
  {
    icon: Wrench,
    label: 'Providers',
    headline: 'Run your business from the field.',
    features: [
      { icon: Briefcase, text: 'Bid on open jobs and win new customers' },
      { icon: Calendar, text: 'Schedule jobs and manage the calendar' },
      { icon: Users, text: 'Dispatch crews and track assignments' },
      { icon: Bell, text: 'Message customers directly on each job' },
    ],
    accent: 'border-sky-500/20 bg-sky-500/5',
    iconBg: 'border-sky-400/25 bg-sky-400/10 text-sky-400',
  },
  {
    icon: Users,
    label: 'Crews',
    headline: 'Know exactly where to be and what to do.',
    features: [
      { icon: MapPin, text: "See today's assigned jobs at a glance" },
      { icon: Navigation, text: 'One tap to navigate to the job site' },
      { icon: Camera, text: 'Upload before & after photos on-site' },
      { icon: Briefcase, text: 'Mark jobs in-progress or complete' },
    ],
    accent: 'border-amber-500/20 bg-amber-500/5',
    iconBg: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
  },
];

export function MobileAppSection() {
  return (
    <section className="overflow-hidden relative px-4 py-24 sm:px-6">
      {/* Background glow */}
      <div className="flex absolute inset-x-0 top-0 justify-center pointer-events-none">
        <div className="h-80 w-[40rem] max-w-full rounded-full bg-brand-lime/8 blur-[120px]" />
      </div>

      {/* Animated top rule */}
      <div className="flex absolute inset-x-0 top-0 justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, width: '6rem' }}
          whileInView={{ opacity: 1, width: '32rem' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="h-px bg-gradient-to-r from-transparent to-transparent via-brand-lime/50"
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-3xl"
        >
          <SectionEyebrow>Coming Soon — December 2026</SectionEyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            The Exterior Pro app
            <span className="block mt-2 text-muted-foreground">
              Built for everyone on the job.
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Whether you own the property, run the company, or work the crew —
            the app puts everything you need in your pocket. Launching on iOS
            and Android in December 2026.
          </p>
        </motion.div>

        {/* Audience cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {AUDIENCES.map((audience, i) => (
            <motion.div
              key={audience.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={cn(
                'rounded-3xl border p-6 backdrop-blur-sm',
                audience.accent,
              )}
            >
              {/* Role pill */}
              <div className="mb-5 flex items-center gap-2.5">
                <span
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-xl border',
                    audience.iconBg,
                  )}
                >
                  <audience.icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {audience.label}
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight leading-snug text-foreground">
                {audience.headline}
              </h3>

              <ul className="mt-5 space-y-3">
                {audience.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Store badge row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-6 items-center mt-14 sm:flex-row sm:items-center sm:justify-center"
        >
          <p className="flex gap-2 items-center text-sm text-muted-foreground">
            <Smartphone className="w-4 h-4 text-brand-lime" />
            Available December 2026 on iOS & Android
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <div className="relative cursor-not-allowed group">
              <div className="flex gap-3 items-center px-5 py-3 rounded-2xl border opacity-50 backdrop-blur-sm transition border-border bg-background/80 group-hover:opacity-60">
                <Apple className="w-5 h-5 text-foreground" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Download on the
                  </p>
                  <p className="text-sm font-bold leading-tight text-foreground">
                    App Store
                  </p>
                </div>
              </div>
            </div>

            <div className="relative cursor-not-allowed group">
              <div className="flex gap-3 items-center px-5 py-3 rounded-2xl border opacity-50 backdrop-blur-sm transition border-border bg-background/80 group-hover:opacity-60">
                <PlayCircle className="w-5 h-5 text-foreground" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Get it on
                  </p>
                  <p className="text-sm font-bold leading-tight text-foreground">
                    Google Play
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
