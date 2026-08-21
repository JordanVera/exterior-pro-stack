'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BadgeCheck, Building2, FileQuestion } from 'lucide-react';
import { trpc } from '../../../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { RatingSummary } from '@/components/star-rating';
import { ReviewList, type PublicReview } from '@/components/review-list';

type ProviderProfile = {
  id: string;
  businessName: string;
  description: string | null;
  logoUrl: string | null;
  verified: boolean;
  serviceAreaZips: string | null;
  rating: { average: number | null; count: number };
  reviews: PublicReview[];
  services: {
    id: string;
    service: { name: string; category: { name: string } };
  }[];
};

export default function CustomerProviderProfilePage() {
  const params = useParams();
  const providerId = String(params.id ?? '');
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!providerId) return;
    trpc.provider.getById
      .query({ id: providerId })
      .then((result) => setProvider(result as unknown as ProviderProfile))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (notFound || !provider) {
    return (
      <div className="rounded-2xl border backdrop-blur-xl border-border bg-background/70">
        <EmptyState
          icon={FileQuestion}
          title="Provider not found"
          description="This profile may have been removed."
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

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Provider"
        size="md"
        title={
          <span className="inline-flex items-center gap-2">
            {provider.businessName}
            {provider.verified ? (
              <BadgeCheck className="h-6 w-6 text-brand-lime" />
            ) : null}
          </span>
        }
        subtitle={provider.description ?? 'Verified Exterior Pro provider'}
        backHref={{ href: '/customer/jobs', label: 'Back to jobs' }}
        chips={[
          {
            id: 'rating',
            label:
              provider.rating.count > 0 && provider.rating.average != null
                ? `${provider.rating.average.toFixed(1)} · ${provider.rating.count} review${provider.rating.count === 1 ? '' : 's'}`
                : 'No reviews yet',
            tone: provider.rating.count > 0 ? 'lime' : 'muted',
          },
        ]}
      />

      <SectionPanel title="Rating" bodyClassName="p-5">
        <div className="flex items-center gap-4">
          {provider.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.logoUrl}
              alt=""
              className="h-14 w-14 rounded-xl object-cover border border-border"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </span>
          )}
          <div>
            <RatingSummary
              average={provider.rating.average}
              count={provider.rating.count}
              size="md"
              emptyLabel="No ratings yet"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              From completed jobs on Exterior Pro
            </p>
          </div>
        </div>
      </SectionPanel>

      {provider.services.length > 0 ? (
        <SectionPanel title="Services" bodyClassName="p-5">
          <div className="flex flex-wrap gap-2">
            {provider.services.map((item) => (
              <span
                key={item.id}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {item.service.name}
              </span>
            ))}
          </div>
        </SectionPanel>
      ) : null}

      <SectionPanel
        title="Reviews"
        count={provider.reviews.length}
        bodyClassName="p-5"
      >
        <ReviewList reviews={provider.reviews} />
      </SectionPanel>
    </div>
  );
}
