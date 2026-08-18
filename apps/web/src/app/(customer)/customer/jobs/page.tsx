'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus } from 'lucide-react';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { EmptyState } from '@/components/dashboard/empty-state';
import { FilterPills } from '@/components/dashboard/filter-pills';
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
      <div className="space-y-8">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="w-full max-w-lg h-9 rounded-full" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Jobs"
        size="md"
        title="Your jobs"
        subtitle="Track requests, review bids, and follow scheduled work."
        action={
          <Button
            asChild
            className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            <Link href="/customer/jobs/new">
              <Plus className="w-4 h-4" />
              Request a service
            </Link>
          </Button>
        }
      />

      <FilterPills
        options={FILTERS.map((item) => ({
          ...item,
          count: counts[item.value],
        }))}
        value={filter}
        onChange={setFilter}
      />

      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border backdrop-blur-xl border-border bg-background/70">
          <EmptyState
            icon={ClipboardList}
            title={filter === 'all' ? 'No jobs yet' : 'No matching jobs'}
            description={
              filter === 'all'
                ? 'Request a service to get bids from local providers.'
                : 'Try a different filter to see more of your history.'
            }
            className="py-16"
            action={
              filter === 'all' ? (
                <Button
                  asChild
                  className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                >
                  <Link href="/customer/jobs/new">
                    <Plus className="w-4 h-4" />
                    Request a service
                  </Link>
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
