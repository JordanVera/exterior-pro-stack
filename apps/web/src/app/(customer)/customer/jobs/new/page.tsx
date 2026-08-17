'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '../../../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
        <Skeleton className="w-full h-10 rounded-xl" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return <RequestJobForm categories={categories} properties={properties} />;
}

export default function RequestJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="px-2 mb-2 h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/customer/jobs">
            <ArrowLeft className="mr-1 w-3 h-3" />
            Back to jobs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Request a service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a service, confirm your property, and local providers will send
          bids.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="w-full h-10 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        }
      >
        <RequestJobPageInner />
      </Suspense>
    </div>
  );
}
