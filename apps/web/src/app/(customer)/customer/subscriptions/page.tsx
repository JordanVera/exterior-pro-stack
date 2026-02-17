'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../../lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Pause, Play, XCircle, ArrowLeft } from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Bi-annually',
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscriptions = () => {
    trpc.subscription.listForCustomer
      .query()
      .then(setSubscriptions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
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

  const handleCancel = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    setActionLoading(subscriptionId);
    try {
      await trpc.subscription.cancel.mutate({ subscriptionId });
      toast.success('Subscription cancelled');
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 px-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Subscriptions
          </h1>
          <p className="text-sm text-neutral-500">
            Manage your active service subscriptions
          </p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
            <h3 className="mb-1 text-sm font-medium text-neutral-900 dark:text-white">
              No subscriptions yet
            </h3>
            <p className="mb-4 text-xs text-neutral-500">
              Subscribe to a plan to get regular exterior services.
            </p>
            <Button
              onClick={() => router.push('/customer/plans')}
              className="rounded-full bg-cyan-500 hover:bg-cyan-400"
            >
              Browse Plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                      {sub.plan.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      {sub.property.address}, {sub.property.city},{' '}
                      {sub.property.state}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'rounded-full border-0 text-[10px] uppercase font-semibold',
                      sub.status === 'ACTIVE'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : sub.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : sub.status === 'PAST_DUE'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-neutral-200 text-neutral-500',
                    )}
                  >
                    {sub.status}
                  </Badge>
                </div>

                {sub.provider && (
                  <div className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">
                    Assigned provider:{' '}
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {sub.provider.businessName}
                    </span>
                  </div>
                )}

                <div className="mb-3 text-xs text-neutral-500">
                  <span className="font-medium">Billing:</span>{' '}
                  {sub.billingFrequency.charAt(0) +
                    sub.billingFrequency.slice(1).toLowerCase()}{' '}
                  &middot; Current period:{' '}
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </div>

                <Separator className="mb-3" />

                <div className="mb-4 space-y-1.5">
                  <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Included services
                  </div>
                  {sub.plan.services?.map((ps: any) => (
                    <div
                      key={ps.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {ps.service.name}
                      </span>
                      <span className="text-neutral-400">
                        {FREQUENCY_LABELS[ps.frequency] || ps.frequency}
                      </span>
                    </div>
                  ))}
                </div>

                {sub.status !== 'CANCELLED' && (
                  <div className="flex items-center gap-2">
                    {sub.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePause(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="text-xs rounded-full"
                      >
                        <Pause className="w-3 h-3 mr-1" />
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
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(sub.id)}
                      disabled={actionLoading === sub.id}
                      className="text-xs text-red-500 rounded-full hover:text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
