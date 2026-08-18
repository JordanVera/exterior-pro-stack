'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '../../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { DashboardHero, type HeroChip } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  Clock,
  FileQuestion,
  MapPin,
  Repeat,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  STATUS_BADGE,
  formatJobDate,
  formatJobDateTime,
  getPendingBids,
  type CustomerJob,
} from '../../_components/job-status';
import { requestJobPath } from '../../_components/utils';
import { JobPhotoGallery } from '@/components/job-photo-gallery';

const TIMELINE = [
  { key: 'requested', label: 'Requested' },
  { key: 'bids', label: 'Bids' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
] as const;

const STATUS_TONE: Record<string, NonNullable<HeroChip['tone']>> = {
  OPEN: 'lime',
  PENDING: 'muted',
  SCHEDULED: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

function timelineDone(job: CustomerJob, key: (typeof TIMELINE)[number]['key']) {
  const status = job.status;
  const hasBids = (job.bids?.length ?? 0) > 0;
  const accepted = [
    'PENDING',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
  ].includes(status);

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
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500 dark:text-red-400">
        This job was cancelled.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-background/70 p-5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,245,66,0.1),transparent_60%)]" />

      <div className="relative flex items-center gap-1 overflow-x-auto pb-1">
        {TIMELINE.map((step, i) => {
          const done = timelineDone(job, step.key);
          const current =
            !done && (i === 0 || timelineDone(job, TIMELINE[i - 1].key));
          const active = done || current;

          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors',
                    done && 'border-brand-lime bg-brand-lime text-brand-ink',
                    current &&
                      'border-brand-lime/40 bg-brand-lime/15 text-brand-lime',
                    !active && 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide',
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
                    done ? 'bg-brand-lime/40' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelJob = async () => {
    setCancelling(true);
    try {
      await trpc.job.cancelForCustomer.mutate({ jobId });
      toast.success('Job request cancelled');
      setCancelOpen(false);
      fetchJob();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel job');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-xl">
        <EmptyState
          icon={FileQuestion}
          title="Job not found"
          description="This job may have been removed, or you don't have access to it."
          className="py-20"
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/customer/jobs">Back to jobs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.PENDING;
  const pendingBids = getPendingBids(job);
  const payment = job.payments?.find((p) => p.status === 'SUCCEEDED');

  const chips: HeroChip[] = [
    {
      id: 'status',
      label: badge.label,
      tone: STATUS_TONE[job.status] ?? 'muted',
      pulse: job.status === 'OPEN' || job.status === 'IN_PROGRESS',
    },
  ];
  if (job.type === 'SUBSCRIPTION') {
    chips.push({ id: 'sub', label: 'Part of a plan', tone: 'muted' });
  }
  if (job.status === 'OPEN' && pendingBids.length > 0) {
    chips.push({
      id: 'bids',
      label: `${pendingBids.length} bid${pendingBids.length === 1 ? '' : 's'} to review`,
      tone: 'lime',
    });
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Job"
        size="md"
        title={job.service.name}
        subtitle={`${job.property.address}, ${job.property.city}, ${job.property.state} ${job.property.zip}`}
        backHref={{ href: '/customer/jobs', label: 'Back to jobs' }}
        chips={chips}
        action={
          job.status === 'OPEN' ? (
            <Button
              variant="outline"
              className="rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => setCancelOpen(true)}
            >
              Cancel request
            </Button>
          ) : job.status === 'COMPLETED' ? (
            <Button
              className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
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
          ) : null
        }
      />

      <JobTimeline job={job} />

      {job.status === 'OPEN' && (
        <SectionPanel
          title="Bids"
          count={pendingBids.length}
          bare
          headerSlot={
            pendingBids.length > 1 ? (
              <span className="text-xs text-muted-foreground">
                Sorted by price
              </span>
            ) : null
          }
        >
          {pendingBids.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-xl">
              <EmptyState
                icon={Building2}
                title="Waiting for bids"
                description="Providers in your area have been notified. Most requests get their first bid within a day."
              />
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingBids
                .slice()
                .sort((a, b) => Number(a.price) - Number(b.price))
                .map((bid, index) => (
                  <div
                    key={bid.id}
                    className={cn(
                      'relative space-y-3 overflow-hidden rounded-2xl border bg-background/70 p-4 backdrop-blur-xl transition-colors',
                      index === 0
                        ? 'border-brand-lime/40'
                        : 'border-border hover:border-brand-lime/40',
                    )}
                  >
                    <GlowingEffect
                      disabled={false}
                      glow
                      proximity={72}
                      spread={28}
                      borderWidth={2}
                    />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {bid.provider.businessName}
                            </span>
                            {bid.provider.verified && (
                              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-lime" />
                            )}
                          </span>
                          {bid.provider.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {bid.provider.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold tracking-tight text-foreground">
                          ${Number(bid.price).toFixed(2)}
                        </p>
                        {index === 0 && pendingBids.length > 1 ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-navy dark:text-brand-lime">
                            Lowest bid
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {bid.notes && (
                      <p className="relative rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        {bid.notes}
                      </p>
                    )}

                    <div className="relative flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={actionLoading === bid.id}
                        className="h-9 flex-1 rounded-full bg-brand-lime text-xs font-semibold text-brand-ink hover:bg-brand-lime/90"
                      >
                        <Check className="h-3 w-3" />
                        Pay &amp; accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineBid(bid.id)}
                        disabled={actionLoading === bid.id}
                        className="h-9 flex-1 rounded-full text-xs"
                      >
                        <X className="h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </SectionPanel>
      )}

      <SectionPanel title="Details" bodyClassName="space-y-3 p-5">
        {job.acceptedBid && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              {job.acceptedBid.provider.businessName}
              <span className="ml-1 font-semibold text-foreground">
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
              {job.assignments
                .map((assignment) => assignment.crew.name)
                .join(', ')}
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
            <span className="font-semibold text-foreground">
              ${(payment.amountCents / 100).toFixed(2)}
            </span>
          </div>
        )}

        {job.customerNotes && (
          <>
            <Separator />
            <div className="rounded-xl bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Your notes:{' '}
              </span>
              {job.customerNotes}
            </div>
          </>
        )}
      </SectionPanel>

      {(job.photos?.length ?? 0) > 0 ||
      ['IN_PROGRESS', 'COMPLETED'].includes(job.status) ? (
        <SectionPanel title="Before & after" bodyClassName="p-5">
          <JobPhotoGallery photos={job.photos} />
        </SectionPanel>
      ) : null}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
            <DialogDescription>
              Providers will no longer be able to bid. This can&apos;t be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              className="rounded-full"
            >
              Keep request
            </Button>
            <Button
              onClick={handleCancelJob}
              disabled={cancelling}
              className="rounded-full bg-red-500 text-white hover:bg-red-500/90"
            >
              {cancelling ? 'Cancelling…' : 'Cancel request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
