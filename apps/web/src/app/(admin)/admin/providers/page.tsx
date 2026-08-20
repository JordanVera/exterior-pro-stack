'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { Building2 } from 'lucide-react';
import { formatDate } from '../_components/utils';

type Filter = 'all' | 'pending' | 'verified';

type ProviderUser = {
  id: string;
  email: string;
  createdAt: string | Date;
  providerProfile: {
    id: string;
    businessName: string;
    description: string | null;
    serviceArea: string | null;
    verified: boolean;
    stripeAccountId: string | null;
    stripeTransfersEnabled: boolean;
  } | null;
};

export default function AdminProvidersPage() {
  const [items, setItems] = useState<ProviderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchProviders = () => {
    setLoading(true);
    trpc.admin.listUsers
      .query({ role: 'PROVIDER', limit: 50 })
      .then((data) => setItems(data.items as ProviderUser[]))
      .catch((err) => toast.error(err.message || 'Failed to load providers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerify = async (providerId: string, verified: boolean) => {
    try {
      await trpc.admin.setProviderVerified.mutate({ providerId, verified });
      toast.success(verified ? 'Provider verified' : 'Provider unverified');
      fetchProviders();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const visible = items.filter((user) => {
    const profile = user.providerProfile;
    if (!profile) return false;
    if (filter === 'pending') return !profile.verified;
    if (filter === 'verified') return profile.verified;
    return true;
  });

  const pendingCount = items.filter((u) => u.providerProfile && !u.providerProfile.verified).length;

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Marketplace"
        title="Providers"
        subtitle="Review businesses, verification, and Stripe Connect status."
        size="md"
        chips={[
          {
            id: 'pending',
            label: `${pendingCount} pending review`,
            tone: pendingCount > 0 ? 'amber' : 'green',
            pulse: pendingCount > 0,
          },
        ]}
      />

      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending', count: pendingCount },
          { value: 'verified', label: 'Verified' },
        ]}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Building2} title="No providers" description="Nothing matches this filter." />
      ) : (
        <div className="space-y-3">
          {visible.map((user) => {
            const profile = user.providerProfile;
            if (!profile) return null;
            return (
              <SectionPanel key={user.id} title={profile.businessName}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{user.email}</p>
                    {profile.serviceArea ? <p>Area: {profile.serviceArea}</p> : null}
                    {profile.description ? <p>{profile.description}</p> : null}
                    <p className="text-xs">
                      Joined {formatDate(user.createdAt)} · Connect{' '}
                      {profile.stripeTransfersEnabled
                        ? 'payouts enabled'
                        : profile.stripeAccountId
                          ? 'onboarding incomplete'
                          : 'not started'}
                    </p>
                    <p>
                      <span
                        className={
                          profile.verified
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {profile.verified ? 'Verified' : 'Pending verification'}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/providers/${user.id}`}>View</Link>
                    </Button>
                    <Button
                      variant={profile.verified ? 'outline' : 'default'}
                      onClick={() => handleVerify(profile.id, !profile.verified)}
                    >
                      {profile.verified ? 'Unverify' : 'Approve'}
                    </Button>
                  </div>
                </div>
              </SectionPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
