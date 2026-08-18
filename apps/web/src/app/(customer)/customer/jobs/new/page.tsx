'use client';

import { Suspense, useEffect, useState } from 'react';
import { trpc } from '../../../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { RequestJobForm } from '../../_components/request-job-form';

function RequestJobPageInner() {
  const [categories, setCategories] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      trpc.service.listCategories.query(),
      trpc.property.list.query(),
    ])
      .then(([cats, props]) => {
        setCategories(cats);
        setProperties(props);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-10 rounded-full" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return <RequestJobForm categories={categories} properties={properties} />;
}

export default function RequestJobPage() {
  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="New request"
        size="md"
        title="Request a service"
        subtitle="Pick a service, confirm your property, and local providers will send competing bids."
        backHref={{ href: '/customer/jobs', label: 'Back to jobs' }}
        chips={[
          { id: 'free', label: 'Free to post', tone: 'lime' },
          { id: 'verified', label: 'Verified providers only', tone: 'muted' },
        ]}
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="w-full h-10 rounded-full" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        }
      >
        <RequestJobPageInner />
      </Suspense>
    </div>
  );
}
