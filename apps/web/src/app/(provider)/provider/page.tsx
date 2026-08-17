'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { trpc } from '../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { SectionEyebrow } from '@/components/landing/section-eyebrow';
import { cn } from '@/lib/utils';
import {
  getGreeting,
  getDateString,
  formatJobDateTime,
  STATUS_BADGE,
} from './_components/utils';

const SHORTCUTS = [
  {
    title: 'Available jobs',
    description: 'Browse open requests in your area and submit bids.',
    link: '/provider/quotes',
    tag: 'Bid',
  },
  {
    title: 'My jobs',
    description: 'Schedule work, assign crews, and mark jobs complete.',
    link: '/provider/jobs',
    tag: 'Dispatch',
  },
  {
    title: 'Crews',
    description: 'Add crews and team members for field work.',
    link: '/provider/crews',
    tag: 'Team',
  },
];

export default function ProviderDashboard() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('there');
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [payoutsEnabled, setPayoutsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.job.listForProvider.query({ status: 'PENDING' }),
      trpc.job.getUpcoming.query(),
      trpc.connect.getStatus.query().catch(() => null),
    ])
      .then(([user, pending, next, connect]) => {
        setBusinessName(user.providerProfile?.businessName || 'there');
        setPendingJobs(pending);
        setUpcoming(next);
        if (connect) setPayoutsEnabled(connect.payoutsEnabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="w-56 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <section>
          <SectionEyebrow>Dashboard</SectionEyebrow>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {getGreeting()}, {businessName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{getDateString()}</p>
        </section>
        <HoverBorderGradient
          as="button"
          containerClassName="rounded-full"
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold dark:bg-black"
          onClick={() => router.push('/provider/quotes')}
        >
          <Search className="w-4 h-4" />
          Browse jobs
        </HoverBorderGradient>
      </div>

      {!payoutsEnabled && (
        <Card className="shadow-none border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Finish payout setup
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Customers can&apos;t accept your bids until payouts are
                  enabled.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
            >
              <Link href="/provider/payouts">Set up payouts</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Needs attention
              {pendingJobs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {pendingJobs.length}
                </span>
              )}
            </h2>
            <Button
              variant="link"
              size="sm"
              asChild
              className="p-0 h-auto text-xs text-cyan-500 hover:text-cyan-400"
            >
              <Link href="/provider/jobs">View all</Link>
            </Button>
          </div>
          {pendingJobs.length === 0 ? (
            <Card className="shadow-none backdrop-blur-xl border-border bg-background/80">
              <CardContent className="px-5 py-8 text-center">
                <Clock className="mx-auto mb-2 w-6 h-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Won jobs that need scheduling will show up here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingJobs.slice(0, 4).map((job) => (
                <Link key={job.id} href="/provider/jobs" className="block">
                  <Card className="border-border bg-background/80 shadow-none backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-500/50">
                    <CardContent className="flex gap-3 justify-between items-center p-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">
                          {job.service.name}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.property.address}, {job.property.city} · Needs
                          schedule
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'rounded-full border-0 text-[10px] uppercase tracking-wide',
                          STATUS_BADGE.PENDING.bg,
                          STATUS_BADGE.PENDING.text,
                        )}
                      >
                        Schedule
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming
              {upcoming.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {upcoming.length}
                </span>
              )}
            </h2>
            <Button
              variant="link"
              size="sm"
              asChild
              className="p-0 h-auto text-xs text-cyan-500 hover:text-cyan-400"
            >
              <Link href="/provider/jobs">View all</Link>
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <Card className="shadow-none backdrop-blur-xl border-border bg-background/80">
              <CardContent className="px-5 py-8 text-center">
                <Calendar className="mx-auto mb-2 w-6 h-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  No upcoming work
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scheduled jobs in the next 7 days will show up here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcoming.map((job) => (
                <Link key={job.id} href="/provider/jobs" className="block">
                  <Card className="border-border bg-background/80 shadow-none backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-500/50">
                    <CardContent className="flex gap-3 justify-between items-center p-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">
                          {job.service.name}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.property.address}, {job.property.city}
                          {job.assignments?.length > 0
                            ? ` · ${job.assignments.map((a: any) => a.crew.name).join(', ')}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-right text-muted-foreground">
                        {job.scheduledDate
                          ? formatJobDateTime(
                              job.scheduledDate,
                              job.scheduledTime,
                            )
                          : 'Not scheduled'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Shortcuts</h2>
        <HoverEffect items={SHORTCUTS} className="py-2" />
      </section>
    </div>
  );
}
