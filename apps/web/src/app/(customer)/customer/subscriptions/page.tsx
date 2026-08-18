'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../../lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  Calendar,
  CreditCard,
  MapPin,
  Pause,
  Play,
  Repeat,
  XCircle,
} from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Bi-annually',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600 dark:text-green-400',
  PAUSED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PAST_DUE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  CANCELLED: 'bg-muted text-muted-foreground',
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);

  const fetchSubscriptions = () => {
    trpc.subscription.listForCustomer
      .query()
      .then(setSubscriptions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast.success('Payment received. Your subscription is active.');
    }
    fetchSubscriptions();
  }, []);

  const handlePause = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      await trpc.subscription.pause.mutate({ subscriptionId });
      toast.success('Subscription paused');
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      await trpc.subscription.resume.mutate({ subscriptionId });
      toast.success('Subscription resumed');
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading('portal');
    try {
      const result =
        await trpc.subscription.createBillingPortalSession.mutate();
      window.location.href = result.url;
    } catch (err: any) {
      toast.error(err.message || 'Could not open billing portal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget.id);
    try {
      await trpc.subscription.cancel.mutate({
        subscriptionId: cancelTarget.id,
      });
      toast.success('Subscription cancelled');
      setCancelTarget(null);
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'ACTIVE').length,
    [subscriptions],
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 rounded-3xl" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Plans"
        size="md"
        title="My subscriptions"
        subtitle="Pause, resume, or cancel your recurring exterior care."
        backHref={{ href: '/customer/plans', label: 'Back to plans' }}
        chips={
          subscriptions.length > 0
            ? [
                {
                  id: 'active',
                  label: `${activeCount} active plan${activeCount === 1 ? '' : 's'}`,
                  tone: activeCount > 0 ? 'lime' : 'muted',
                },
              ]
            : undefined
        }
        action={
          <Button
            variant="outline"
            onClick={handleBillingPortal}
            disabled={actionLoading === 'portal'}
            className="rounded-full"
          >
            <CreditCard className="w-4 h-4" />
            Manage billing
          </Button>
        }
      />

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed backdrop-blur-xl border-border bg-background/50">
          <EmptyState
            icon={Calendar}
            title="No subscriptions yet"
            description="Subscribe to a plan and the same verified crew keeps your property up on a schedule."
            className="py-16"
            action={
              <Button
                onClick={() => router.push('/customer/plans')}
                className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
              >
                Browse plans
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="overflow-hidden relative p-5 rounded-2xl border backdrop-blur-xl border-border bg-background/70 sm:p-6"
            >
              <GlowingEffect
                disabled={false}
                glow
                proximity={72}
                spread={28}
                borderWidth={2}
              />

              <div className="relative">
                <div className="flex gap-3 justify-between items-start mb-4">
                  <div className="flex gap-3 items-start min-w-0">
                    <span className="flex justify-center items-center w-10 h-10 rounded-xl border shrink-0 border-brand-lime/25 bg-brand-lime/10">
                      <Repeat className="w-4 h-4 text-brand-lime" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold truncate text-foreground">
                        {sub.plan.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {sub.property.address}, {sub.property.city},{' '}
                        {sub.property.state}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                      STATUS_STYLES[sub.status] ??
                        'bg-muted text-muted-foreground',
                    )}
                  >
                    {sub.status}
                  </span>
                </div>

                <dl className="grid gap-3 p-3 text-xs rounded-xl border border-border bg-muted/40 sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Billing</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {sub.billingFrequency.charAt(0) +
                        sub.billingFrequency.slice(1).toLowerCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Current period</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {new Date(sub.currentPeriodStart).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' },
                      )}
                      {' – '}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' },
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Provider</dt>
                    <dd className="mt-0.5 truncate font-semibold text-foreground">
                      {sub.provider?.businessName ?? 'Being assigned'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Included services
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {sub.plan.services?.map((ps: any) => (
                      <li
                        key={ps.id}
                        className="flex gap-3 justify-between items-center text-xs"
                      >
                        <span className="truncate text-foreground">
                          {ps.service.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-brand-lime/10 px-2 py-0.5 font-medium text-brand-navy dark:text-brand-lime">
                          {FREQUENCY_LABELS[ps.frequency] || ps.frequency}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {sub.status !== 'CANCELLED' && (
                  <div className="flex gap-2 items-center pt-4 mt-5 border-t border-border">
                    {sub.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePause(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="text-xs rounded-full"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </Button>
                    )}
                    {sub.status === 'PAUSED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResume(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="text-xs rounded-full"
                      >
                        <Play className="w-3 h-3" />
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(sub)}
                      disabled={actionLoading === sub.id}
                      className="text-xs text-red-500 rounded-full hover:bg-red-500/10 hover:text-red-400"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this subscription?</DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `${cancelTarget.plan.name} at ${cancelTarget.property.address} will stop renewing. Visits already scheduled in the current period still happen.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              className="rounded-full"
            >
              Keep plan
            </Button>
            <Button
              onClick={handleCancel}
              disabled={actionLoading === cancelTarget?.id}
              className="text-white bg-red-500 rounded-full hover:bg-red-500/90"
            >
              {actionLoading === cancelTarget?.id
                ? 'Cancelling…'
                : 'Cancel subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {subscriptions.length > 0 ? (
        <p className="text-xs text-center text-muted-foreground">
          Looking for something else?{' '}
          <Link
            href="/customer/plans"
            className="font-semibold text-brand-navy hover:underline dark:text-brand-lime"
          >
            Browse all plans
          </Link>
        </p>
      ) : null}
    </div>
  );
}
