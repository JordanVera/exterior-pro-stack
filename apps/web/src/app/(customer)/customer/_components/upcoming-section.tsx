'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from './job-card';
import type { CustomerJob } from './job-status';

interface UpcomingSectionProps {
  jobs: CustomerJob[];
}

export function UpcomingSection({ jobs }: UpcomingSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
        <Button
          variant="link"
          size="sm"
          asChild
          className="h-auto p-0 text-xs text-cyan-500 hover:text-cyan-400"
        >
          <Link href="/customer/jobs">View all</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-border bg-background/80 shadow-none backdrop-blur-xl">
          <CardContent className="px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No upcoming work
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled and in-progress jobs will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
