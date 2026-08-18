'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

export type ProviderJobCardProps = {
  href: string;
  title: string;
  subtitle: string;
  /** Right-aligned supporting text, such as a schedule or a bid price. */
  meta?: string;
  badge?: { label: string; bg: string; text: string };
  dotClassName?: string;
};

/** One row in the provider work feed. Shared so all three tabs read the same. */
export function ProviderJobCard({
  href,
  title,
  subtitle,
  meta,
  badge,
  dotClassName,
}: ProviderJobCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-lime/50">
        <GlowingEffect
          disabled={false}
          glow
          proximity={64}
          spread={26}
          borderWidth={2}
        />

        {dotClassName ? (
          <span
            className={cn(
              'relative h-2 w-2 flex-shrink-0 rounded-full',
              dotClassName,
            )}
          />
        ) : null}

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {title}
            </span>
            {badge ? (
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full border-0 text-[10px] uppercase tracking-wide',
                  badge.bg,
                  badge.text,
                )}
              >
                {badge.label}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {meta ? (
          <span className="relative hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
            {meta}
          </span>
        ) : null}

        <ChevronRight className="relative h-4 w-4 flex-shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-brand-lime" />
      </div>
    </Link>
  );
}
