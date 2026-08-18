'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  STATUS_BADGE,
  STATUS_DOT,
  getJobCta,
  getJobNextAction,
  type CustomerJob,
} from './job-status';

interface JobCardProps {
  job: CustomerJob;
  href?: string;
  cta?: string;
  showCta?: boolean;
}

export function JobCard({
  job,
  href = `/customer/jobs/${job.id}`,
  cta,
  showCta = true,
}: JobCardProps) {
  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
  const dot = STATUS_DOT[job.status] || STATUS_DOT.PENDING;
  const nextAction = getJobNextAction(job);
  const actionLabel = cta ?? getJobCta(job);

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

        <span
          className={cn('relative h-2 w-2 flex-shrink-0 rounded-full', dot)}
        />

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {job.service.name}
            </span>
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
            {job.type === 'SUBSCRIPTION' && (
              <Badge
                variant="secondary"
                className="rounded-full border-0 bg-purple-500/10 text-[10px] text-purple-500"
              >
                Sub
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {job.property.address}, {job.property.city}
            {nextAction ? ` · ${nextAction}` : ''}
          </p>
        </div>

        {showCta && (
          <span className="relative hidden text-xs font-semibold text-brand-navy sm:inline dark:text-brand-lime">
            {actionLabel}
          </span>
        )}
        <ChevronRight className="relative h-4 w-4 flex-shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-brand-lime" />
      </div>
    </Link>
  );
}
