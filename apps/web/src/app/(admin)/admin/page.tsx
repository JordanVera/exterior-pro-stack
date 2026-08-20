'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DashboardHero,
  type HeroChip,
} from '@/components/dashboard/dashboard-hero';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CreditCard,
  FileText,
  Layers,
  RefreshCw,
  Users,
  Wallet,
} from 'lucide-react';
import { dollarsWhole } from './_components/utils';

type AdminStats = {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalCrew: number;
  verifiedProviders: number;
  unverifiedProviders: number;
  totalJobs: number;
  openJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalBids: number;
  pendingBids: number;
  totalSubscriptions: number;
  failedPayments: number;
  pendingPayouts: number;
  gmvCents: number;
  payoutsCents: number;
  pendingPayoutsCents: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    trpc.admin.getStats
      .query()
      .then(setStats)
      .catch((err) => toast.error(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const chips: HeroChip[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        id: 'open',
        label: `${stats.openJobs} open jobs`,
        tone: 'lime',
        pulse: stats.openJobs > 0,
      },
      {
        id: 'verify',
        label: `${stats.unverifiedProviders} providers to review`,
        tone: stats.unverifiedProviders > 0 ? 'amber' : 'green',
      },
      {
        id: 'failed',
        label: `${stats.failedPayments} failed payments`,
        tone: stats.failedPayments > 0 ? 'red' : 'muted',
      },
    ];
  }, [stats]);

  const tiles: StatTile[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        id: 'users',
        label: 'Users',
        value: stats.totalUsers,
        caption: `${stats.totalCustomers} customers · ${stats.totalProviders} providers`,
        icon: Users,
        href: '/admin/users',
        tone: 'lime',
      },
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
        caption: `${stats.activeJobs} in progress · ${stats.openJobs} open`,
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

  const syncPlans = async () => {
    setSyncing(true);
    try {
      await trpc.admin.syncStripePlans.mutate();
      toast.success('Stripe products and prices synced.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-40 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Platform"
        title="Overview"
        subtitle="Users, jobs, and money across Exterior Pro."
        chips={chips}
        action={
          <Button variant="outline" onClick={syncPlans} disabled={syncing}>
            <RefreshCw className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync plans to Stripe'}
          </Button>
        }
      />

      <StatTiles tiles={tiles} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Needs attention">
          {stats &&
          (stats.unverifiedProviders > 0 ||
            stats.failedPayments > 0 ||
            stats.pendingPayouts > 0 ||
            stats.pendingBids > 0) ? (
            <ul className="space-y-3 text-sm">
              {stats.unverifiedProviders > 0 ? (
                <li className="flex gap-3 items-start">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                  <span>
                    {stats.unverifiedProviders} provider
                    {stats.unverifiedProviders === 1 ? '' : 's'} waiting for
                    verification.
                  </span>
                </li>
              ) : null}
              {stats.failedPayments > 0 ? (
                <li className="flex gap-3 items-start">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
                  <span>
                    {stats.failedPayments} failed payment
                    {stats.failedPayments === 1 ? '' : 's'} to review.
                  </span>
                </li>
              ) : null}
              {stats.pendingPayouts > 0 ? (
                <li className="flex gap-3 items-start">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                  <span>
                    {stats.pendingPayouts} pending payout
                    {stats.pendingPayouts === 1 ? '' : 's'} totaling{' '}
                    {dollarsWhole(stats.pendingPayoutsCents)}.
                  </span>
                </li>
              ) : null}
              {stats.pendingBids > 0 ? (
                <li className="flex gap-3 items-start text-muted-foreground">
                  <Briefcase className="mt-0.5 h-4 w-4" />
                  <span>
                    {stats.pendingBids} bids awaiting a customer decision.
                  </span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing needs review right now.
            </p>
          )}
        </SectionPanel>

        <SectionPanel title="Jump to">
          <QuickActions
            orientation="list"
            actions={[
              {
                id: 'users',
                label: 'Manage users',
                description: 'Search, verify, and suspend accounts',
                href: '/admin/users',
                icon: Users,
              },
              {
                id: 'providers',
                label: 'Review providers',
                description: 'Approve businesses and check Connect',
                href: '/admin/providers',
                icon: Building2,
              },
              {
                id: 'catalog',
                label: 'Edit catalog',
                description: 'Categories, prices, and units',
                href: '/admin/services',
                icon: Layers,
              },
              {
                id: 'payments',
                label: 'Payments & payouts',
                description: 'Receipts, fees, and transfers',
                href: '/admin/payments',
                icon: Wallet,
              },
              {
                id: 'plan',
                label: 'Business plan',
                description: 'Operating plan, unit economics, and targets',
                href: '/admin/business-plan',
                icon: FileText,
              },
            ]}
          />
        </SectionPanel>
      </div>
    </div>
  );
}
