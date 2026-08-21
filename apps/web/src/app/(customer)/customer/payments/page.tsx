'use client';

import { useEffect, useMemo, useState } from 'react';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { EmptyState } from '@/components/dashboard/empty-state';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  CalendarDays,
  ExternalLink,
  Heart,
  Receipt,
  Repeat,
  Wallet,
} from 'lucide-react';

type Payment = {
  id: string;
  kind: string;
  status: string;
  amountCents: number;
  receiptUrl?: string | null;
  createdAt: string | Date;
  job?: { service?: { name: string } | null } | null;
  subscription?: { plan?: { name: string } | null } | null;
};

type FilterValue = 'all' | 'JOB' | 'SUBSCRIPTION' | 'TIP';

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: 'bg-green-500/10 text-green-500',
  PENDING: 'bg-amber-500/10 text-amber-500',
  FAILED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-blue-500/10 text-blue-500',
  CANCELED: 'bg-muted text-muted-foreground',
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function paymentLabel(payment: Payment) {
  if (payment.kind === 'TIP') {
    return payment.job?.service?.name
      ? `Tip · ${payment.job.service.name}`
      : 'Tip';
  }
  return (
    payment.job?.service?.name ||
    payment.subscription?.plan?.name ||
    (payment.kind === 'SUBSCRIPTION' ? 'Subscription' : 'Job')
  );
}

function paymentKindLabel(kind: string) {
  if (kind === 'SUBSCRIPTION') return 'Plan';
  if (kind === 'TIP') return 'Tip';
  return 'Job';
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    trpc.payment.listForCustomer
      .query()
      .then((result) => setPayments(result as unknown as Payment[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const succeeded = useMemo(
    () => payments.filter((p) => p.status === 'SUCCEEDED'),
    [payments],
  );

  const totalSpent = useMemo(
    () => succeeded.reduce((total, p) => total + p.amountCents, 0) / 100,
    [succeeded],
  );

  const thisYearSpent = useMemo(() => {
    const year = new Date().getFullYear();
    return (
      succeeded
        .filter((p) => new Date(p.createdAt).getFullYear() === year)
        .reduce((total, p) => total + p.amountCents, 0) / 100
    );
  }, [succeeded]);

  const counts = useMemo(
    () => ({
      all: payments.length,
      JOB: payments.filter((p) => p.kind === 'JOB').length,
      SUBSCRIPTION: payments.filter((p) => p.kind === 'SUBSCRIPTION').length,
      TIP: payments.filter((p) => p.kind === 'TIP').length,
    }),
    [payments],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter((p) => p.kind === filter);
  }, [payments, filter]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tiles: StatTile[] = [
    {
      id: 'total',
      label: 'Total paid',
      value: totalSpent,
      prefix: '$',
      caption: `${succeeded.length} successful payment${succeeded.length === 1 ? '' : 's'}`,
      icon: Wallet,
      tone: 'lime',
    },
    {
      id: 'year',
      label: `Spent in ${new Date().getFullYear()}`,
      value: thisYearSpent,
      prefix: '$',
      caption: 'Across jobs and plans',
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      id: 'jobs',
      label: 'Job payments',
      value: counts.JOB,
      caption: 'One-time work',
      icon: Briefcase,
      tone: 'amber',
    },
    {
      id: 'subs',
      label: 'Plan payments',
      value: counts.SUBSCRIPTION,
      caption: 'Recurring billing',
      icon: Repeat,
      tone: 'green',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Billing"
        size="md"
        title="Payments"
        subtitle="Every receipt for your jobs and subscription plans, in one place."
      />

      {payments.length > 0 ? (
        <StatTiles tiles={tiles} className="lg:grid-cols-4" />
      ) : null}

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed backdrop-blur-xl border-border bg-background/50">
          <EmptyState
            icon={Receipt}
            title="No payments yet"
            description="Once you accept a bid or start a plan, your receipts will show up here."
            className="py-16"
          />
        </div>
      ) : (
        <>
          <FilterPills
            options={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'JOB', label: 'Jobs', count: counts.JOB },
              {
                value: 'SUBSCRIPTION',
                label: 'Plans',
                count: counts.SUBSCRIPTION,
              },
              { value: 'TIP', label: 'Tips', count: counts.TIP },
            ]}
            value={filter}
            onChange={setFilter}
          />

          <div className="space-y-2">
            {filtered.map((payment) => (
              <div
                key={payment.id}
                className="flex overflow-hidden relative gap-3 items-center p-4 rounded-2xl border backdrop-blur-xl transition-colors border-border bg-background/70 hover:border-brand-lime/50"
              >
                <GlowingEffect
                  disabled={false}
                  glow
                  proximity={64}
                  spread={26}
                  borderWidth={2}
                />

                <span className="flex relative justify-center items-center w-9 h-9 rounded-lg border shrink-0 border-brand-lime/25 bg-brand-lime/10">
                  {payment.kind === 'SUBSCRIPTION' ? (
                    <Repeat className="w-4 h-4 text-brand-lime" />
                  ) : payment.kind === 'TIP' ? (
                    <Heart className="w-4 h-4 text-brand-lime" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-brand-lime" />
                  )}
                </span>

                <div className="relative flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {paymentLabel(payment)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    {paymentKindLabel(payment.kind)}
                  </p>
                </div>

                <div className="flex relative gap-3 items-center shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {dollars(payment.amountCents)}
                  </span>
                  <span
                    className={cn(
                      'hidden rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline',
                      STATUS_STYLES[payment.status] ??
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {payment.status}
                  </span>
                  {payment.receiptUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="p-0 w-8 h-8 rounded-full text-muted-foreground hover:text-brand-lime"
                    >
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View receipt"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
