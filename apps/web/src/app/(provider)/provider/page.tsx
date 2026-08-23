'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Gavel,
  Search,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { trpc } from '../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DashboardHero,
  type HeroChip,
} from '@/components/dashboard/dashboard-hero';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { getGreeting, getDateString, formatJobDate } from './_components/utils';
import { ProviderJobFeed } from './_components/job-feed';
import {
  PayoutSummary,
  type ProviderTransfer,
} from './_components/payout-summary';
import { CrewSummary, type ProviderCrew } from './_components/crew-summary';
import {
  OpenJobsCarousel,
  type OpenJob,
} from './_components/open-jobs-carousel';

type ProviderBid = {
  id: string;
  price: unknown;
  status: string;
  createdAt: string | Date;
  job: {
    id: string;
    service: { name: string };
    property: { address: string; city: string };
  };
};

const QUICK_ACTIONS = [
  {
    id: 'quotes',
    label: 'Find work',
    description: 'Open jobs in your service area',
    href: '/provider/quotes',
    icon: Search,
  },
  {
    id: 'jobs',
    label: 'Dispatch jobs',
    description: 'Schedule crews and close out work',
    href: '/provider/jobs',
    icon: CalendarCheck,
  },
  {
    id: 'crews',
    label: 'Add a crew member',
    description: 'Give your team field access',
    href: '/provider/crews',
    icon: UserPlus,
  },
  {
    id: 'payouts',
    label: 'Payouts',
    description: 'Transfers and Stripe account',
    href: '/provider/payouts',
    icon: Wallet,
  },
];

export default function ProviderDashboard() {
  const [businessName, setBusinessName] = useState('there');
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [bids, setBids] = useState<ProviderBid[]>([]);
  const [crews, setCrews] = useState<ProviderCrew[]>([]);
  const [transfers, setTransfers] = useState<ProviderTransfer[]>([]);
  const [payoutsEnabled, setPayoutsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.job.listForProvider.query({ status: 'PENDING' }),
      trpc.job.getUpcoming.query(),
      // Everything below only drives stats and side panels, so a failure should
      // degrade one card rather than blank the dashboard.
      trpc.job.listOpen.query().catch(() => []),
      trpc.job.listMyBids.query().catch(() => []),
      trpc.crew.list.query().catch(() => []),
      trpc.payment.listForProvider.query().catch(() => []),
      trpc.connect.getStatus.query().catch(() => null),
    ])
      .then(
        ([user, pending, next, open, myBids, crewList, payouts, connect]) => {
          setBusinessName(user.providerProfile?.businessName || 'there');
          setPendingJobs(pending);
          setUpcoming(next);
          setOpenJobs(open as unknown as OpenJob[]);
          setBids(myBids as unknown as ProviderBid[]);
          setCrews(crewList as unknown as ProviderCrew[]);
          setTransfers(payouts as unknown as ProviderTransfer[]);
          if (connect) setPayoutsEnabled(connect.payoutsEnabled);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingBids = useMemo(
    () => bids.filter((bid) => bid.status === 'PENDING'),
    [bids],
  );

  const wonBids = useMemo(
    () => bids.filter((bid) => bid.status === 'ACCEPTED').length,
    [bids],
  );

  const lifetimePaidCents = useMemo(
    () =>
      transfers
        .filter((t) => t.status === 'PAID')
        .reduce((total, t) => total + t.amountCents, 0),
    [transfers],
  );

  const crewMemberCount = useMemo(
    () => crews.reduce((total, crew) => total + crew.members.length, 0),
    [crews],
  );

  const nextJob = useMemo(
    () => upcoming.find((job) => job.scheduledDate) ?? null,
    [upcoming],
  );

  if (loading) return <ProviderDashboardSkeleton />;

  const chips: HeroChip[] = [];
  if (openJobs.length > 0) {
    chips.push({
      id: 'open',
      label: `${openJobs.length} job${openJobs.length === 1 ? '' : 's'} to bid on`,
      tone: 'lime',
      pulse: true,
    });
  }
  if (pendingJobs.length > 0) {
    chips.push({
      id: 'schedule',
      label: `${pendingJobs.length} need${pendingJobs.length === 1 ? 's' : ''} scheduling`,
      tone: 'amber',
    });
  }
  if (nextJob?.scheduledDate) {
    chips.push({
      id: 'next',
      label: `Next job ${formatJobDate(nextJob.scheduledDate, { weekday: true })}`,
      tone: 'blue',
    });
  }
  if (chips.length === 0) {
    chips.push({
      id: 'idle',
      label: 'No open work in your area right now',
      tone: 'muted',
    });
  }

  const tiles: StatTile[] = [
    {
      id: 'open',
      label: 'Open jobs',
      value: openJobs.length,
      caption: 'Matching your services',
      icon: Search,
      tone: 'lime',
      href: '/provider/quotes',
    },
    {
      id: 'bids',
      label: 'Bids out',
      value: pendingBids.length,
      caption: `${wonBids} won all time`,
      icon: Gavel,
      tone: 'amber',
      href: '/provider/quotes',
    },
    {
      id: 'schedule',
      label: 'To schedule',
      value: pendingJobs.length,
      caption: 'Won jobs without a date',
      icon: CalendarClock,
      tone: 'blue',
      href: '/provider/jobs',
    },
    {
      id: 'booked',
      label: 'Booked this week',
      value: upcoming.length,
      caption: 'Next 7 days',
      icon: CalendarCheck,
      tone: 'green',
      href: '/provider/jobs',
    },
    {
      id: 'paid',
      label: 'Paid out',
      value: lifetimePaidCents / 100,
      prefix: '$',
      decimals: 0,
      caption: `${crews.length} crew${crews.length === 1 ? '' : 's'} · ${crewMemberCount} member${crewMemberCount === 1 ? '' : 's'}`,
      icon: Wallet,
      tone: 'muted',
      href: '/provider/payouts',
    },
  ];

  return (
    <div className="space-y-10">
      <DashboardHero
        eyebrow="Dashboard"
        title={
          <>
            {getGreeting()},{' '}
            <span className="text-brand-navy dark:text-brand-lime">
              {businessName}
            </span>
          </>
        }
        subtitle={getDateString()}
        chips={chips}
        action={
          <Button
            asChild
            size="lg"
            className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            <Link href="/provider/quotes">
              <Search className="w-4 h-4" />
              Browse open jobs
            </Link>
          </Button>
        }
      />

      {!payoutsEnabled && (
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-red-500/30 bg-red-500/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Finish payout setup
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Customers can&apos;t accept your bids until payouts are enabled.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="font-semibold rounded-full shrink-0 bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            <Link href="/provider/payouts">Set up payouts</Link>
          </Button>
        </div>
      )}

      <StatTiles tiles={tiles} />

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ProviderJobFeed
          needsScheduling={pendingJobs}
          upcoming={upcoming}
          pendingBids={pendingBids}
        />

        <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <PayoutSummary
            transfers={transfers}
            payoutsEnabled={payoutsEnabled}
          />
          <CrewSummary crews={crews} />
          <SectionPanel title="Quick actions" bodyClassName="p-2">
            <QuickActions actions={QUICK_ACTIONS} />
          </SectionPanel>
        </div>
      </div>

      <OpenJobsCarousel jobs={openJobs} />
    </div>
  );
}

function ProviderDashboardSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-56 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-2">
          <Skeleton className="mb-4 w-64 h-8 rounded-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
