'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { Briefcase } from 'lucide-react';
import { StatusBadge } from '../_components/status-badge';
import { formatDate } from '../_components/utils';

type StatusFilter =
  | 'all'
  | 'OPEN'
  | 'PENDING'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

type AdminJob = {
  id: string;
  status: string;
  scheduledDate: string | Date | null;
  service: { name: string };
  property: { address: string; city: string };
  acceptedBid: { price: unknown; provider: { businessName: string } } | null;
  bids: unknown[];
};

export default function AdminJobsPage() {
  const [items, setItems] = useState<AdminJob[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');

  const fetchJobs = (cursor?: string) => {
    setLoading(true);
    trpc.admin.listJobs
      .query({
        limit: 20,
        ...(status !== 'all' ? { status } : {}),
        ...(cursor ? { cursor } : {}),
      })
      .then((data) => {
        setItems(
          cursor
            ? [...items, ...(data.items as AdminJob[])]
            : (data.items as AdminJob[]),
        );
        setNextCursor(data.nextCursor);
      })
      .catch((err) => toast.error(err.message || 'Failed to load jobs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Marketplace"
        title="Jobs"
        subtitle="Platform-wide job oversight. Status changes stay with customers and crews."
        size="md"
      />

      <FilterPills
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'All' },
          { value: 'OPEN', label: 'Open' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'IN_PROGRESS', label: 'In progress' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
        ]}
      />

      <SectionPanel title="All jobs" count={items.length} bare>
        <div className="overflow-x-auto rounded-2xl border backdrop-blur-xl border-border bg-background/70">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Service
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Property
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Scheduled
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Bids
                </th>
                <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{job.service.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.property.address}, {job.property.city}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.acceptedBid?.provider?.businessName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={job.status} kind="job" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(job.scheduledDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.bids?.length || 0}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {job.acceptedBid
                      ? `$${Number(job.acceptedBid.price).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : null}
          {!loading && items.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs found" />
          ) : null}
        </div>
      </SectionPanel>

      {nextCursor ? (
        <Button variant="outline" onClick={() => fetchJobs(nextCursor)}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}
