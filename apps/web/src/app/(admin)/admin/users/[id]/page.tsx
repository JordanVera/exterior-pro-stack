'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '../../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Briefcase, CreditCard, Home, Repeat } from 'lucide-react';
import { StatusBadge } from '../../_components/status-badge';
import { displayName, dollars, formatDate } from '../../_components/utils';

type UserDetail = {
  id: string;
  email: string;
  phone: string | null;
  role: string | null;
  verified: boolean;
  createdAt: string | Date;
  customerProfile: {
    firstName: string;
    lastName: string;
    properties: { id: string; address: string; city: string; state: string; zip: string }[];
    subscriptions: {
      id: string;
      status: string;
      billingFrequency: string;
      plan: { name: string };
      property: { address: string };
    }[];
    payments: {
      id: string;
      status: string;
      kind: string;
      amountCents: number;
      createdAt: string | Date;
      receiptUrl: string | null;
    }[];
  } | null;
  providerProfile: { id: string; businessName: string; verified: boolean } | null;
  crewMemberships: { id: string; name: string; crew: { name: string } }[];
  jobs: {
    id: string;
    status: string;
    createdAt: string | Date;
    service: { name: string };
    property: { address: string };
  }[];
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!params.id) return;
    setLoading(true);
    trpc.admin.getUser
      .query({ userId: params.id })
      .then((data) => setUser(data as unknown as UserDetail))
      .catch((err) => toast.error(err.message || 'Failed to load user'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleToggle = async () => {
    if (!user) return;
    try {
      await trpc.admin.toggleUserVerification.mutate({
        userId: user.id,
        verified: !user.verified,
      });
      toast.success(user.verified ? 'User suspended' : 'User verified');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <EmptyState icon={Briefcase} title="User not found" />;
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="User"
        title={displayName(user)}
        subtitle={user.email}
        size="md"
        backHref={{ href: '/admin/users', label: 'All users' }}
        chips={[
          { id: 'role', label: user.role ?? 'No role', tone: 'lime' },
          {
            id: 'verified',
            label: user.verified ? 'Verified' : 'Unverified',
            tone: user.verified ? 'green' : 'red',
          },
        ]}
        action={
          <div className="flex gap-2">
            {user.providerProfile ? (
              <Button variant="outline" asChild>
                <Link href={`/admin/providers/${user.id}`}>Provider profile</Link>
              </Button>
            ) : null}
            <Button
              variant={user.verified ? 'destructive' : 'default'}
              onClick={handleToggle}
            >
              {user.verified ? 'Suspend' : 'Verify'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <Info label="Phone" value={user.phone || '—'} />
        <Info label="Joined" value={formatDate(user.createdAt)} />
        <Info
          label="Properties"
          value={String(user.customerProfile?.properties.length ?? 0)}
        />
        <Info
          label="Crew memberships"
          value={String(user.crewMemberships.length)}
        />
      </div>

      {user.customerProfile?.properties.length ? (
        <SectionPanel title="Properties" count={user.customerProfile.properties.length}>
          <ul className="space-y-2 text-sm">
            {user.customerProfile.properties.map((property) => (
              <li key={property.id} className="flex items-start gap-2">
                <Home className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>
                  {property.address}, {property.city}, {property.state} {property.zip}
                </span>
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}

      <SectionPanel title="Recent jobs" count={user.jobs.length} bare>
        {user.jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs" />
        ) : (
          <JobTable jobs={user.jobs} />
        )}
      </SectionPanel>

      {user.customerProfile?.subscriptions.length ? (
        <SectionPanel title="Subscriptions" count={user.customerProfile.subscriptions.length}>
          <ul className="space-y-3 text-sm">
            {user.customerProfile.subscriptions.map((sub) => (
              <li key={sub.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  {sub.plan.name} · {sub.property.address}
                </span>
                <StatusBadge value={sub.status} />
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}

      {user.customerProfile?.payments.length ? (
        <SectionPanel title="Payments" count={user.customerProfile.payments.length}>
          <ul className="space-y-3 text-sm">
            {user.customerProfile.payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {dollars(payment.amountCents)} · {formatDate(payment.createdAt)}
                </span>
                <StatusBadge value={payment.status} kind="payment" />
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

function JobTable({
  jobs,
}: {
  jobs: UserDetail['jobs'];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-background/70 backdrop-blur-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="px-4 py-3 font-medium">{job.service.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{job.property.address}</td>
              <td className="px-4 py-3">
                <StatusBadge value={job.status} kind="job" />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(job.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
