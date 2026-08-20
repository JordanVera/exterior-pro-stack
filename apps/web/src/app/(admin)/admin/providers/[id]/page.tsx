'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '../../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatTiles, type StatTile } from '@/components/dashboard/stat-tiles';
import { Briefcase, Building2, Users, Wallet } from 'lucide-react';
import { StatusBadge } from '../../_components/status-badge';
import { dollars, formatDate } from '../../_components/utils';

type ProviderDetail = {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  email: string | null;
  serviceArea: string | null;
  serviceAreaZips: string | null;
  logoUrl: string | null;
  verified: boolean;
  stripeAccountId: string | null;
  stripeTransfersEnabled: boolean;
  contractorAgreedAt: string | Date | null;
  paidOutCents: number;
  pendingPayoutCents: number;
  user: { email: string; verified: boolean };
  services: {
    id: string;
    customPrice: unknown;
    service: {
      name: string;
      basePrice: unknown;
      unit: string;
      category: { name: string };
    };
  }[];
  crews: {
    id: string;
    name: string;
    members: { id: string; name: string }[];
  }[];
  transfers: {
    id: string;
    amountCents: number;
    status: string;
    createdAt: string | Date;
    payment: { job: { service: { name: string } } | null };
  }[];
  jobs: {
    id: string;
    status: string;
    scheduledDate: string | Date | null;
    service: { name: string };
    property: { address: string; city: string };
    acceptedBid: { price: unknown } | null;
  }[];
};

export default function AdminProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!params.id) return;
    setLoading(true);
    trpc.admin.getProvider
      .query({ userId: params.id })
      .then((data) => setProvider(data as unknown as ProviderDetail))
      .catch((err) => toast.error(err.message || 'Failed to load provider'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleVerify = async () => {
    if (!provider) return;
    try {
      await trpc.admin.setProviderVerified.mutate({
        providerId: provider.id,
        verified: !provider.verified,
      });
      toast.success(
        provider.verified ? 'Provider unverified' : 'Provider verified',
      );
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-36 rounded-3xl" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
    );
  }

  if (!provider) {
    return <EmptyState icon={Building2} title="Provider not found" />;
  }

  const tiles: StatTile[] = [
    {
      id: 'paid',
      label: 'Paid out',
      value: provider.paidOutCents / 100,
      prefix: '$',
      decimals: 2,
      icon: Wallet,
      tone: 'green',
    },
    {
      id: 'pending',
      label: 'Pending payouts',
      value: provider.pendingPayoutCents / 100,
      prefix: '$',
      decimals: 2,
      icon: Wallet,
      tone: 'amber',
    },
    {
      id: 'jobs',
      label: 'Recent jobs',
      value: provider.jobs.length,
      icon: Briefcase,
      tone: 'blue',
    },
    {
      id: 'crews',
      label: 'Crews',
      value: provider.crews.length,
      icon: Users,
      tone: 'muted',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Provider"
        title={
          <span className="flex gap-3 items-center">
            {provider.logoUrl ? (
              <img
                src={provider.logoUrl}
                alt=""
                className="object-cover w-10 h-10 rounded-xl border border-border"
              />
            ) : null}
            {provider.businessName}
          </span>
        }
        subtitle={provider.user.email}
        size="md"
        backHref={{ href: '/admin/providers', label: 'All providers' }}
        chips={[
          {
            id: 'verified',
            label: provider.verified ? 'Verified' : 'Unverified',
            tone: provider.verified ? 'green' : 'amber',
          },
          {
            id: 'connect',
            label: provider.stripeTransfersEnabled
              ? 'Payouts enabled'
              : provider.stripeAccountId
                ? 'Connect incomplete'
                : 'Connect not started',
            tone: provider.stripeTransfersEnabled ? 'green' : 'muted',
          },
        ]}
        action={
          <Button
            variant={provider.verified ? 'outline' : 'default'}
            onClick={handleVerify}
          >
            {provider.verified ? 'Unverify' : 'Approve'}
          </Button>
        }
      />

      <StatTiles tiles={tiles} className="lg:grid-cols-4" />

      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <Info
          label="ZIP codes"
          value={
            provider.serviceAreaZips
              ? provider.serviceAreaZips.split(',').join(', ')
              : '—'
          }
        />
        <Info label="Business email" value={provider.email || '—'} />
        <Info
          label="Contractor agreement"
          value={
            provider.contractorAgreedAt
              ? formatDate(provider.contractorAgreedAt)
              : 'Not signed'
          }
        />
      </div>

      {provider.description ? (
        <SectionPanel title="About">
          <p className="text-sm text-muted-foreground">
            {provider.description}
          </p>
        </SectionPanel>
      ) : null}

      <SectionPanel title="Services offered" count={provider.services.length}>
        {provider.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No catalog services selected.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {provider.services.map((item) => (
              <li key={item.id} className="flex gap-3 justify-between">
                <span>
                  {item.service.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.service.category.name}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {item.customPrice != null
                    ? `$${Number(item.customPrice).toFixed(2)} custom`
                    : `$${Number(item.service.basePrice).toFixed(2)} base`}
                  /{item.service.unit.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <SectionPanel title="Crews" count={provider.crews.length}>
        {provider.crews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No crews yet.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {provider.crews.map((crew) => (
              <li key={crew.id}>
                <p className="font-medium">{crew.name}</p>
                <p className="text-muted-foreground">
                  {crew.members.length
                    ? crew.members.map((m) => m.name).join(', ')
                    : 'No members'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <SectionPanel title="Recent jobs" count={provider.jobs.length} bare>
        {provider.jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No awarded jobs yet" />
        ) : (
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
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {provider.jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 font-medium">
                      {job.service.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.property.address}, {job.property.city}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={job.status} kind="job" />
                    </td>
                    <td className="px-4 py-3">
                      {job.acceptedBid
                        ? `$${Number(job.acceptedBid.price).toFixed(2)}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        title="Payout history"
        count={provider.transfers.length}
        bare
      >
        {provider.transfers.length === 0 ? (
          <EmptyState icon={Wallet} title="No transfers yet" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border backdrop-blur-xl border-border bg-background/70">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                    Job
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {provider.transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-4 py-3">
                      {transfer.payment.job?.service.name ?? 'Subscription'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {dollars(transfer.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={transfer.status} kind="transfer" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(transfer.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border backdrop-blur-xl border-border bg-background/70">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
