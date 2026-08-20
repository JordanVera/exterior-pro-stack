'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Building2, CreditCard, Layers, Wallet } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { dollarsWhole } from '../../_components/utils';

type AdminStats = {
  totalUsers: number;
  verifiedProviders: number;
  unverifiedProviders: number;
  totalJobs: number;
  openJobs: number;
  totalSubscriptions: number;
  gmvCents: number;
  payoutsCents: number;
  pendingPayouts: number;
  pendingPayoutsCents: number;
};

export function LiveSnapshot() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.admin.getStats
      .query()
      .then(setStats)
      .catch((err) => toast.error(err.message || 'Failed to load live stats'))
      .finally(() => setLoading(false));
  }, []);

  const tiles: StatTile[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        id: 'providers',
        label: 'Verified providers',
        value: stats.verifiedProviders,
        caption: `${stats.unverifiedProviders} pending review`,
        icon: Building2,
        href: '/admin/providers',
        tone: stats.unverifiedProviders > 0 ? 'amber' : 'green',
      },
      {
        id: 'jobs',
        label: 'Jobs',
        value: stats.totalJobs,
        caption: `${stats.openJobs} open`,
        icon: Briefcase,
        href: '/admin/jobs',
        tone: 'blue',
      },
      {
        id: 'gmv',
        label: 'GMV',
        value: stats.gmvCents / 100,
        prefix: '$',
        decimals: 0,
        caption: `${stats.totalSubscriptions} active subscriptions`,
        icon: CreditCard,
        href: '/admin/payments',
        tone: 'green',
      },
      {
        id: 'subs',
        label: 'Subscriptions',
        value: stats.totalSubscriptions,
        caption: `${stats.totalUsers} total users`,
        icon: Layers,
        tone: 'lime',
      },
      {
        id: 'payouts',
        label: 'Payouts',
        value: stats.payoutsCents / 100,
        prefix: '$',
        decimals: 0,
        caption: `${stats.pendingPayouts} pending · ${dollarsWhole(stats.pendingPayoutsCents)}`,
        icon: Wallet,
        href: '/admin/payments',
        tone: 'muted',
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 print:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Live platform — actuals, not the 12-month targets
      </p>
      <StatTiles tiles={tiles} />
    </div>
  );
}
