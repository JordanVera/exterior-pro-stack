'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '../../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  Clock,
  MapPin,
  Repeat,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import {
  STATUS_BADGE,
  formatJobDate,
  formatJobDateTime,
  getPendingBids,
  type CustomerJob,
} from '../../_components/job-status';
import { requestJobPath } from '../../_components/utils';

const TIMELINE = [
  { key: 'requested', label: 'Requested' },
  { key: 'bids', label: 'Bids' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
] as const;

function timelineDone(job: CustomerJob, key: (typeof TIMELINE)[number]['key']) {
  const status = job.status;
  const hasBids = (job.bids?.length ?? 0) > 0;
  const accepted = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
    status,
  );

  switch (key) {
    case 'requested':
      return true;
    case 'bids':
      return hasBids || accepted || status === 'CANCELLED';
    case 'accepted':
      return accepted;
    case 'scheduled':
      return ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(status);
    case 'completed':
      return status === 'COMPLETED';
    default:
      return false;
  }
}

function JobTimeline({ job }: { job: CustomerJob }) {
  if (job.status === 'CANCELLED') {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
        This job was cancelled.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {TIMELINE.map((step, i) => {
        const done = timelineDone(job, step.key);
        const current =
          !done &&
          (i === 0 || timelineDone(job, TIMELINE[i - 1].key)) &&
          !timelineDone(job, step.key);
        const active = done || current;

        return (
          <div key={step.key} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
                  done && 'bg-cyan-500 text-white',
                  current && 'bg-cyan-500/20 text-cyan-500',
                  !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground/50',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div
                className={cn(
                  'mx-1 mb-5 h-px flex-1',
                  done ? 'bg-cyan-500/40' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.id ?? '');

  const [job, setJob] = useState<CustomerJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJob = useCallback(() => {
    if (!jobId) return;
    trpc.job.getForCustomer
      .query({ jobId })
      .then((result) => setJob(result as unknown as CustomerJob))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleAcceptBid = async (bidId: string) => {
    setActionLoading(bidId);
    try {
      const result = await trpc.bid.accept.mutate({ bidId, jobId });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      toast.success('Bid accepted! The provider can now schedule your job.');
      fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineBid = async (bidId: string) => {
    setActionLoading(bidId);
    try {
      await trpc.bid.decline.mutate({ bidId, jobId });
      toast.success('Bid declined');
      fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline bid');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-lg font-semibold text-foreground">
          Job not found
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          This job may have been removed or you don&apos;t have access.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/customer/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
  const pendingBids = getPendingBids(job);
  const payment = job.payments?.find((p) => p.status === 'SUCCEEDED');

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/customer/jobs">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to jobs
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.service.name}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full border-0 text-[10px] uppercase tracking-wide',
                  badge.bg,
                  badge.text,
                )}
              >
                {badge.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.property.address}, {job.property.city}, {job.property.state}{' '}
              {job.property.zip}
            </p>
          </div>
          {job.status === 'COMPLETED' && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() =>
                router.push(
                  requestJobPath({
                    serviceId: job.service.id,
                    propertyId: job.property.id,
                  }),
                )
              }
            >
              <RotateCcw className="h-4 w-4" />
              Book again
            </Button>
          )}
        </div>
      </div>

      <JobTimeline job={job} />

      {job.status === 'OPEN' && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Bids</h2>
          {pendingBids.length === 0 ? (
            <Card className="border-border bg-background/80 shadow-none">
              <CardContent className="px-5 py-8 text-center">
                <Building2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Waiting for bids
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Providers in your area have been notified.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {pendingBids
                .slice()
                .sort((a, b) => Number(a.price) - Number(b.price))
                .map((bid) => (
                  <Card
                    key={bid.id}
                    className="border-border bg-background/80 shadow-none"
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">
                                {bid.provider.businessName}
                              </span>
                              {bid.provider.verified && (
                                <BadgeCheck className="h-4 w-4 text-cyan-500" />
                              )}
                            </div>
                            {bid.provider.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {bid.provider.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            ${Number(bid.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {bid.notes && (
                        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                          {bid.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={actionLoading === bid.id}
                          className="h-8 flex-1 rounded-full bg-green-500 text-xs hover:bg-green-400"
                        >
                          <Check className="h-3 w-3" />
                          Pay & accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineBid(bid.id)}
                          disabled={actionLoading === bid.id}
                          className="h-8 flex-1 rounded-full text-xs"
                        >
                          <X className="h-3 w-3" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>
      )}

      <Card className="border-border bg-background/80 shadow-none">
        <CardContent className="space-y-3 p-5">
          <h2 className="text-base font-semibold text-foreground">Details</h2>

          {job.acceptedBid && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>
                {job.acceptedBid.provider.businessName}
                <span className="ml-1 font-medium text-foreground">
                  · ${Number(job.acceptedBid.price).toFixed(2)}
                </span>
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              {job.property.address}, {job.property.city}, {job.property.state}{' '}
              {job.property.zip}
            </span>
          </div>

          {job.scheduledDate && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                {formatJobDateTime(job.scheduledDate, job.scheduledTime)}
              </span>
            </div>
          )}

          {job.completedAt && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Completed {formatJobDate(job.completedAt, { year: true })}
              </span>
            </div>
          )}

          {job.assignments && job.assignments.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Users className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Crew:{' '}
                {job.assignments.map((assignment) => assignment.crew.name).join(', ')}
              </span>
            </div>
          )}

          {job.recurringSchedule?.active && (
            <div className="flex items-start gap-2 text-sm">
              <Repeat className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
              <span className="text-purple-500 dark:text-purple-400">
                {job.recurringSchedule.frequency} · Next:{' '}
                {formatJobDate(job.recurringSchedule.nextDate)}
              </span>
            </div>
          )}

          {payment && (
            <div className="text-sm text-muted-foreground">
              Paid{' '}
              <span className="font-medium text-foreground">
                ${(payment.amountCents / 100).toFixed(2)}
              </span>
            </div>
          )}

          {job.customerNotes && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Your notes: </span>
                {job.customerNotes}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
