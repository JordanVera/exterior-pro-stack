'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { trpc } from '../../../../lib/trpc';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, STATUS_BADGE } from '../_components/utils';

export default function AvailableJobsPage() {
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [biddingJobId, setBiddingJobId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(true);

  const fetchData = () => {
    Promise.all([
      trpc.job.listOpen.query(),
      trpc.job.listMyBids.query(),
      trpc.connect.getStatus.query().catch(() => null),
    ])
      .then(([jobs, bids, connect]) => {
        setOpenJobs(jobs);
        setMyBids(bids);
        if (connect) setPayoutsEnabled(connect.payoutsEnabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitBid = async (jobId: string) => {
    if (!price || Number(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setSubmitting(true);
    try {
      await trpc.bid.submit.mutate({
        jobId,
        price: Number(price),
        notes: notes || undefined,
      });
      toast.success('Bid submitted successfully');
      setBiddingJobId(null);
      setPrice('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    try {
      await trpc.bid.withdraw.mutate({ bidId });
      toast.success('Bid withdrawn');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw bid');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const pendingBids = myBids.filter((b) => b.status === 'PENDING');
  const acceptedBids = myBids.filter((b) => b.status === 'ACCEPTED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Available jobs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse open requests in your service area and submit bids.
        </p>
      </div>

      {!payoutsEnabled && (
        <Card className="shadow-none border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-amber-800 dark:text-amber-200">
            Complete payout onboarding before bidding.{' '}
            <Link href="/provider/payouts" className="underline">
              Set up payouts
            </Link>
          </CardContent>
        </Card>
      )}

      {openJobs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Open jobs
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {openJobs.length}
            </span>
          </h2>
          <div className="space-y-3">
            {openJobs.map((job) => {
              const bidCount = job.bids?.length || 0;
              return (
                <Card
                  key={job.id}
                  className="shadow-none backdrop-blur-xl border-border bg-background/80"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex gap-3 justify-between items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                          <h3 className="text-sm font-semibold text-foreground">
                            {job.service.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'rounded-full border-0 text-[10px] uppercase tracking-wide',
                              STATUS_BADGE.OPEN.bg,
                              STATUS_BADGE.OPEN.text,
                            )}
                          >
                            Open
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {job.property.address}, {job.property.city},{' '}
                          {job.property.state} {job.property.zip}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Base price:{' '}
                          {formatPrice(job.service.basePrice, job.service.unit)}
                        </p>
                        {job.customerNotes && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Customer notes: {job.customerNotes}
                          </p>
                        )}
                        {bidCount > 0 && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {bidCount} bid{bidCount > 1 ? 's' : ''} already
                            submitted
                          </p>
                        )}
                      </div>
                    </div>

                    {biddingJobId === job.id ? (
                      <div className="p-4 space-y-3 rounded-xl border border-border bg-muted/40">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-muted-foreground">
                            Your price
                          </label>
                          <div className="flex gap-1 items-center">
                            <span className="text-sm text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-40"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-muted-foreground">
                            Notes (optional)
                          </label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="resize-none"
                            placeholder="Timeline, approach, what's included..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSubmitBid(job.id)}
                            disabled={submitting}
                            className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
                            size="sm"
                          >
                            {submitting ? 'Submitting...' : 'Submit bid'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setBiddingJobId(null);
                              setPrice('');
                              setNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setBiddingJobId(job.id)}
                        className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
                        size="sm"
                      >
                        Submit a bid
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="py-16 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-14 h-14 rounded-full bg-muted">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">
            No open jobs right now
          </h3>
          <p className="text-sm text-muted-foreground">
            Check back soon for requests in your service area.
          </p>
        </div>
      )}

      {pendingBids.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Pending bids
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {pendingBids.length}
            </span>
          </h2>
          <div className="space-y-2">
            {pendingBids.map((bid) => (
              <Card
                key={bid.id}
                className="shadow-none border-border bg-background/80"
              >
                <CardContent className="flex gap-3 justify-between items-center p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {bid.job.service.name}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {bid.job.property.address}, {bid.job.property.city} · $
                      {Number(bid.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant="secondary"
                      className="rounded-full border-0 bg-amber-500/10 text-[10px] uppercase tracking-wide text-amber-500"
                    >
                      Pending
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWithdrawBid(bid.id)}
                      className="h-7 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-500"
                    >
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {acceptedBids.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Won bids
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {acceptedBids.length}
            </span>
          </h2>
          <div className="space-y-2">
            {acceptedBids.map((bid) => (
              <Card
                key={bid.id}
                className="shadow-none border-border bg-background/80"
              >
                <CardContent className="flex gap-3 justify-between items-center p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {bid.job.service.name}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {bid.job.property.address}, {bid.job.property.city} · $
                      {Number(bid.price).toFixed(2)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'rounded-full border-0 text-[10px] uppercase tracking-wide',
                      STATUS_BADGE.COMPLETED.bg,
                      STATUS_BADGE.COMPLETED.text,
                    )}
                  >
                    Accepted
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
