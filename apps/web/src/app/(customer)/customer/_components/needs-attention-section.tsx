'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from './job-card';
import { getPendingBids, type CustomerJob } from './job-status';

interface NeedsAttentionSectionProps {
  jobs: CustomerJob[];
}

export function NeedsAttentionSection({ jobs }: NeedsAttentionSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Needs attention
        </h2>
        <Button
          variant="link"
          size="sm"
          asChild
          className="h-auto p-0 text-xs text-brand-navy hover:text-brand-navy/70 dark:text-brand-lime dark:hover:text-brand-lime/80"
        >
          <Link href="/customer/jobs">View all</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-border bg-background/80 shadow-none backdrop-blur-xl">
          <CardContent className="px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              You&apos;re all caught up
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Request a service when you&apos;re ready for the next job.
            </p>
            <Button
              asChild
              className="mt-4 rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
              size="sm"
            >
              <Link href="/customer/jobs/new">Request a service</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              cta={
                getPendingBids(job).length > 0 ? 'Review bids' : 'View request'
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
