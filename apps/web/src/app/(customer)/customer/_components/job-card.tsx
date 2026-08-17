'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Link href={href} className="block group">
      <Card className="shadow-none border-border bg-background/80 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn('h-2 w-2 flex-shrink-0 rounded-full', dot)} />
          <div className="min-w-0 flex-1">
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
            <span className="hidden text-xs font-medium text-cyan-500 sm:inline">
              {actionLabel}
            </span>
          )}
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50 transition-colors group-hover:text-cyan-500" />
        </CardContent>
      </Card>
    </Link>
  );
}
