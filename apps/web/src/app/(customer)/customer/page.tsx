'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { trpc } from '../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Check, Clock, Star, Briefcase, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timeAgo, groupDataByProperty } from './_components/utils';
import { GreetingSection } from './_components/greeting-section';
import { PropertySection } from './_components/property-section';
import { RecentActivitySection } from './_components/recent-activity-section';
import { NeedsAttentionSection } from './_components/needs-attention-section';
import { UpcomingSection } from './_components/upcoming-section';
import { FirstPropertyPrompt } from './_components/first-property-prompt';
import { getPendingBids, type CustomerJob } from './_components/job-status';

export default function CustomerHomePage() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.job.listForCustomer.query(),
      trpc.property.list.query(),
    ])
      .then(([u, j, p]) => {
        setUser(u);
        setJobs(j as unknown as CustomerJob[]);
        setProperties(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.customerProfile?.firstName || 'there';

  const attentionJobs = useMemo(() => {
    const open = jobs.filter((job) => job.status === 'OPEN');
    return open.sort(
      (a, b) => getPendingBids(b).length - getPendingBids(a).length,
    );
  }, [jobs]);

  const upcomingJobs = useMemo(() => {
    const list = jobs.filter(
      (job) =>
        job.status === 'SCHEDULED' ||
        job.status === 'IN_PROGRESS' ||
        job.status === 'PENDING',
    );
    return list.sort((a, b) => {
      const aTime = a.scheduledDate
        ? new Date(a.scheduledDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduledDate
        ? new Date(b.scheduledDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, [jobs]);

  const propertySummaries = useMemo(
    () => groupDataByProperty(properties, jobs),
    [properties, jobs],
  );

  const activityItems = useMemo(() => {
    const items: {
      id: string;
      jobId: string;
      icon: LucideIcon;
      color: string;
      title: string;
      sub: string;
      time: string;
      date: Date;
      job?: { id: string; service: { id: string }; property: { id: string } };
    }[] = [];

    jobs.forEach((j) => {
      if (j.status === 'OPEN') {
        const bidCount = getPendingBids(j).length;
        items.push({
          id: `j-open-${j.id}`,
          jobId: j.id,
          icon: Briefcase,
          color: 'text-brand-navy dark:text-brand-lime',
          title: `Job requested: ${j.service.name}`,
          sub:
            bidCount > 0
              ? `${bidCount} bid${bidCount > 1 ? 's' : ''} received`
              : 'Waiting for bids',
          time: timeAgo(String(j.createdAt)),
          date: new Date(j.createdAt),
        });
      } else if (j.status === 'PENDING') {
        items.push({
          id: `j-pending-${j.id}`,
          jobId: j.id,
          icon: Check,
          color: 'text-green-400',
          title: `Bid accepted: ${j.service.name}`,
          sub: j.acceptedBid?.provider?.businessName || 'Provider assigned',
          time: timeAgo(String(j.updatedAt || j.createdAt)),
          date: new Date(j.updatedAt || j.createdAt),
        });
      } else if (j.status === 'COMPLETED' && j.completedAt) {
        items.push({
          id: `j-done-${j.id}`,
          jobId: j.id,
          icon: Star,
          color: 'text-amber-400',
          title: `Completed: ${j.service.name}`,
          sub: j.property.address,
          time: timeAgo(String(j.completedAt)),
          date: new Date(j.completedAt),
          job: {
            id: j.id,
            service: { id: j.service.id },
            property: { id: j.property.id },
          },
        });
      } else if (j.status === 'SCHEDULED' && j.scheduledDate) {
        items.push({
          id: `j-sched-${j.id}`,
          jobId: j.id,
          icon: Clock,
          color: 'text-blue-400',
          title: `Scheduled: ${j.service.name}`,
          sub: new Date(j.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          time: timeAgo(String(j.createdAt)),
          date: new Date(j.createdAt),
        });
      }
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6);
  }, [jobs]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-40 h-10 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-8">
        <GreetingSection firstName={firstName} />
        <FirstPropertyPrompt
          onAdded={(property) => setProperties([property])}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <GreetingSection firstName={firstName} />
        <Button
          asChild
          className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
        >
          <Link href="/customer/jobs/new">
            <Plus className="w-4 h-4" />
            Request a service
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <NeedsAttentionSection jobs={attentionJobs} />
        <UpcomingSection jobs={upcomingJobs} />
      </div>

      <PropertySection summaries={propertySummaries} />

      <RecentActivitySection items={activityItems} />
    </div>
  );
}
