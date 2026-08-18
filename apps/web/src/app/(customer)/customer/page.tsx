'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { trpc } from '../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  CalendarPlus,
  Check,
  Clock,
  CreditCard,
  Gavel,
  Home,
  MapPin,
  Plus,
  Repeat,
  Star,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DashboardHero,
  type HeroChip,
} from '@/components/dashboard/dashboard-hero';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import {
  timeAgo,
  groupDataByProperty,
  getGreeting,
  getDateString,
} from './_components/utils';
import { JobFeed } from './_components/job-feed';
import { PropertyCarousel } from './_components/property-carousel';
import { RecentActivitySection } from './_components/recent-activity-section';
import { FirstPropertyPrompt } from './_components/first-property-prompt';
import {
  formatJobDate,
  getPendingBids,
  type CustomerJob,
} from './_components/job-status';

type Subscription = { id: string; status: string };
type Payment = {
  id: string;
  status: string;
  amountCents: number;
  createdAt: string | Date;
};

const QUICK_ACTIONS = [
  {
    id: 'request',
    label: 'Request a service',
    description: 'Post a one-time job for bids',
    href: '/customer/jobs/new',
    icon: CalendarPlus,
  },
  {
    id: 'plans',
    label: 'Browse plans',
    description: 'Put recurring care on autopilot',
    href: '/customer/plans',
    icon: Repeat,
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Receipts and billing history',
    href: '/customer/payments',
    icon: CreditCard,
  },
  {
    id: 'properties',
    label: 'Manage properties',
    description: 'Addresses and access notes',
    href: '/customer/settings',
    icon: MapPin,
  },
];

export default function CustomerHomePage() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.job.listForCustomer.query(),
      trpc.property.list.query(),
      // Stat-only queries degrade to an empty tile rather than blanking the page.
      trpc.subscription.listForCustomer.query().catch(() => []),
      trpc.payment.listForCustomer.query().catch(() => []),
    ])
      .then(([u, j, p, s, pay]) => {
        setUser(u);
        setJobs(j as unknown as CustomerJob[]);
        setProperties(p);
        setSubscriptions(s as unknown as Subscription[]);
        setPayments(pay as unknown as Payment[]);
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

  const completedJobs = useMemo(() => {
    return jobs
      .filter((job) => job.status === 'COMPLETED')
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.createdAt).getTime() -
          new Date(a.completedAt ?? a.createdAt).getTime(),
      );
  }, [jobs]);

  const propertySummaries = useMemo(
    () => groupDataByProperty(properties, jobs),
    [properties, jobs],
  );

  const bidsToReview = useMemo(
    () =>
      attentionJobs.reduce(
        (total, job) => total + getPendingBids(job).length,
        0,
      ),
    [attentionJobs],
  );

  const activePlans = useMemo(
    () => subscriptions.filter((s) => s.status === 'ACTIVE').length,
    [subscriptions],
  );

  const spentThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    const cents = payments
      .filter(
        (p) =>
          p.status === 'SUCCEEDED' &&
          new Date(p.createdAt).getFullYear() === year,
      )
      .reduce((total, p) => total + p.amountCents, 0);
    return cents / 100;
  }, [payments]);

  const nextVisit = useMemo(
    () => upcomingJobs.find((job) => job.scheduledDate) ?? null,
    [upcomingJobs],
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

  if (loading) return <CustomerDashboardSkeleton />;

  const heroTitle = (
    <>
      {getGreeting()},{' '}
      <span className="text-brand-navy dark:text-brand-lime">{firstName}</span>
    </>
  );

  if (properties.length === 0) {
    return (
      <DashboardHero
        eyebrow="Dashboard"
        title={heroTitle}
        subtitle={getDateString()}
      >
        <FirstPropertyPrompt
          onAdded={(property) => setProperties([property])}
        />
      </DashboardHero>
    );
  }

  const chips: HeroChip[] = [];
  if (bidsToReview > 0) {
    chips.push({
      id: 'bids',
      label: `${bidsToReview} bid${bidsToReview === 1 ? '' : 's'} to review`,
      tone: 'lime',
      pulse: true,
    });
  }
  if (nextVisit?.scheduledDate) {
    chips.push({
      id: 'next',
      label: `Next visit ${formatJobDate(nextVisit.scheduledDate, { weekday: true })}`,
      tone: 'blue',
    });
  }
  if (activePlans > 0) {
    chips.push({
      id: 'plans',
      label: `${activePlans} active plan${activePlans === 1 ? '' : 's'}`,
      tone: 'muted',
    });
  }
  if (chips.length === 0) {
    chips.push({
      id: 'idle',
      label: 'Nothing needs you right now',
      tone: 'muted',
    });
  }

  const tiles: StatTile[] = [
    {
      id: 'active',
      label: 'Active jobs',
      value: upcomingJobs.length,
      caption: 'Scheduled or in progress',
      icon: Briefcase,
      tone: 'lime',
      href: '/customer/jobs',
    },
    {
      id: 'bids',
      label: 'Bids to review',
      value: bidsToReview,
      caption: `Across ${attentionJobs.length} open request${attentionJobs.length === 1 ? '' : 's'}`,
      icon: Gavel,
      tone: 'amber',
      href: '/customer/jobs',
    },
    {
      id: 'properties',
      label: 'Properties',
      value: properties.length,
      caption: 'Homes under care',
      icon: Home,
      tone: 'blue',
      href: '/customer/settings',
    },
    {
      id: 'plans',
      label: 'Active plans',
      value: activePlans,
      caption: 'Recurring subscriptions',
      icon: Repeat,
      tone: 'green',
      href: '/customer/subscriptions',
    },
    {
      id: 'spend',
      label: `Spent in ${new Date().getFullYear()}`,
      value: spentThisYear,
      prefix: '$',
      decimals: 0,
      caption: 'Paid across all jobs',
      icon: Wallet,
      tone: 'muted',
      href: '/customer/payments',
    },
  ];

  return (
    <div className="space-y-10">
      <DashboardHero
        eyebrow="Dashboard"
        title={heroTitle}
        subtitle={getDateString()}
        chips={chips}
        action={
          <Button
            asChild
            size="lg"
            className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            <Link href="/customer/jobs/new">
              <Plus className="w-4 h-4" />
              Request a service
            </Link>
          </Button>
        }
      />

      <StatTiles tiles={tiles} />

      {/* The right rail holds a single panel so a customer with one or two jobs
          doesn't leave a tall column of dead space beside it. */}
      {/* minmax(0,…) tracks keep the property carousel's max-content width from
          stretching the column past the viewport. */}
      <div
        className={cn(
          'grid grid-cols-1 gap-8',
          activityItems.length > 0 &&
            'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]',
        )}
      >
        <div className="space-y-8 min-w-0">
          <JobFeed
            attention={attentionJobs}
            upcoming={upcomingJobs}
            completed={completedJobs}
          />

          <PropertyCarousel summaries={propertySummaries} />
        </div>

        {activityItems.length > 0 ? (
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <RecentActivitySection items={activityItems} />
          </div>
        ) : null}
      </div>

      <SectionPanel title="Quick actions" bare>
        <QuickActions orientation="row" actions={QUICK_ACTIONS} />
      </SectionPanel>
    </div>
  );
}

function CustomerDashboardSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-56 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="mb-4 w-64 h-8 rounded-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="mb-4 w-40 h-8 rounded-full" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
