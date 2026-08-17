'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus } from 'lucide-react';
import { JobCard } from '../_components/job-card';
import { getPendingBids, type CustomerJob } from '../_components/job-status';

type FilterValue = 'all' | 'review' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'review', label: 'Needs review' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'Active' },
  { value: 'COMPLETED', label: 'Done' },
];

function matchesFilter(job: CustomerJob, filter: FilterValue) {
  if (filter === 'all') return true;
  if (filter === 'review') {
    return job.status === 'OPEN' && getPendingBids(job).length > 0;
  }
  return job.status === filter;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast.success(
        'Payment received. The provider can now schedule your job.',
      );
    }

    trpc.job.listForCustomer
      .query()
      .then((result) => setJobs(result as unknown as CustomerJob[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      all: jobs.length,
      review: jobs.filter(
        (job) => job.status === 'OPEN' && getPendingBids(job).length > 0,
      ).length,
      SCHEDULED: jobs.filter((job) => job.status === 'SCHEDULED').length,
      IN_PROGRESS: jobs.filter((job) => job.status === 'IN_PROGRESS').length,
      COMPLETED: jobs.filter((job) => job.status === 'COMPLETED').length,
    }),
    [jobs],
  );

  const filteredJobs = useMemo(
    () => jobs.filter((job) => matchesFilter(job, filter)),
    [jobs, filter],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-40 h-10 rounded-full" />
        </div>
        <Skeleton className="w-full h-10 rounded-full" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track requests, review bids, and follow scheduled work.
          </p>
        </div>
        <Button
          asChild
          className="font-semibold text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
        >
          <Link href="/customer/jobs/new">
            <Plus className="w-4 h-4" />
            Request a service
          </Link>
        </Button>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => (
          <Badge
            key={item.value}
            variant="secondary"
            onClick={() => setFilter(item.value)}
            className={cn(
              'cursor-pointer select-none rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-all',
              filter === item.value
                ? 'bg-cyan-500 text-white hover:bg-cyan-500'
                : 'hover:text-foreground',
            )}
          >
            {item.label}
            <span
              className={cn(
                'ml-1.5 tabular-nums',
                filter === item.value
                  ? 'text-white/80'
                  : 'text-muted-foreground',
              )}
            >
              {counts[item.value]}
            </span>
          </Badge>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-14 h-14 rounded-full bg-muted">
            <ClipboardList className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">
            {filter === 'all' ? 'No jobs yet' : 'No matching jobs'}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {filter === 'all'
              ? 'Request a service to get bids from local providers.'
              : 'Try a different filter.'}
          </p>
          {filter === 'all' && (
            <Button
              asChild
              className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
            >
              <Link href="/customer/jobs/new">
                <Plus className="w-4 h-4" />
                Request a service
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
