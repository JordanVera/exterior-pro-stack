'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { SectionEyebrow } from '@/components/landing/section-eyebrow';
import { cn } from '@/lib/utils';

export type HeroChip = {
  id: string;
  label: string;
  tone?: 'lime' | 'amber' | 'blue' | 'green' | 'red' | 'muted';
  /** Adds the pinging dot used on the landing hero badge. */
  pulse?: boolean;
};

const CHIP_TONES: Record<NonNullable<HeroChip['tone']>, string> = {
  lime: 'border-brand-lime/25 bg-brand-lime/10 text-brand-navy dark:text-brand-lime',
  amber:
    'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  blue: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green:
    'border-green-500/25 bg-green-500/10 text-green-600 dark:text-green-400',
  red: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  muted: 'border-border bg-muted/60 text-muted-foreground',
};

const CHIP_DOTS: Record<NonNullable<HeroChip['tone']>, string> = {
  lime: 'bg-brand-lime',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  muted: 'bg-muted-foreground',
};

/**
 * Header band shared by the customer and provider dashboards. Borrows the
 * landing hero's lime wash and grid, but everything here is static — this
 * surface gets opened many times a day, so nothing loops.
 */
export function DashboardHero({
  eyebrow,
  title,
  subtitle,
  chips,
  action,
  backHref,
  size = 'lg',
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  chips?: HeroChip[];
  action?: ReactNode;
  /** Adds a back link above the eyebrow, for pages nested under a list. */
  backHref?: { href: string; label: string };
  /** "md" is the lighter band used on sub-pages. */
  size?: 'lg' | 'md';
  /** Rendered below the header row, inside the same band. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'overflow-hidden relative rounded-3xl border backdrop-blur-xl border-border bg-background/70',
        size === 'lg' ? 'p-6 sm:p-9' : 'p-5 sm:p-7',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,245,66,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-lime/10 blur-[110px] dark:bg-brand-navy/40" />
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />

      <div className="relative">
        {backHref ? (
          <Link
            href={backHref.href}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backHref.label}
          </Link>
        ) : null}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <h1
              className={cn(
                'font-bold tracking-tight text-foreground',
                size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}

            {chips && chips.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-5">
                {chips.map((chip) => (
                  <span
                    key={chip.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                      CHIP_TONES[chip.tone ?? 'muted'],
                    )}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      {chip.pulse ? (
                        <span
                          className={cn(
                            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                            CHIP_DOTS[chip.tone ?? 'muted'],
                          )}
                        />
                      ) : null}
                      <span
                        className={cn(
                          'relative inline-flex h-1.5 w-1.5 rounded-full',
                          CHIP_DOTS[chip.tone ?? 'muted'],
                        )}
                      />
                    </span>
                    {chip.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </motion.section>
  );
}
