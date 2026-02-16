'use client';

import { useEffect, useState, useMemo } from 'react';
import { trpc } from '../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, FileText, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timeAgo } from './_components/utils';
import { GreetingSection } from './_components/greeting-section';
import { StatsSection } from './_components/stats-section';
import { QuoteBuilderSection } from './_components/quote-builder-section';
import { RecentActivitySection } from './_components/recent-activity-section';
import { ActiveJobsSection } from './_components/active-jobs-section';

export default function CustomerHomePage() {
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.service.listCategories.query(),
      trpc.quote.listForCustomer.query(),
      trpc.job.listForCustomer.query(),
      trpc.property.list.query(),
    ])
      .then(([u, cats, q, j, p]) => {
        setUser(u);
        setCategories(cats);
        setQuotes(q);
        setJobs(j);
        setProperties(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    setLoadingProviders(true);
    trpc.provider.list
      .query({ serviceId: selectedService.id })
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoadingProviders(false));
  }, [selectedService]);

  const pendingQuotes = useMemo(
    () => quotes.filter((q) => q.status === 'SENT'),
    [quotes],
  );
  const activeJobs = useMemo(
    () => jobs.filter((j) => ['SCHEDULED', 'IN_PROGRESS'].includes(j.status)),
    [jobs],
  );
  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'COMPLETED'),
    [jobs],
  );
  const firstName = user?.customerProfile?.firstName || 'there';

  const activityItems = useMemo(() => {
    const items: {
      id: string;
      icon: LucideIcon;
      color: string;
      title: string;
      sub: string;
      time: string;
      date: Date;
    }[] = [];

    quotes.forEach((q) => {
      if (q.status === 'SENT') {
        items.push({
          id: `q-sent-${q.id}`,
          icon: FileText,
          color: 'text-cyan-400',
          title: `Quote received for ${q.service.name}`,
          sub: q.provider.businessName,
          time: timeAgo(q.updatedAt || q.createdAt),
          date: new Date(q.updatedAt || q.createdAt),
        });
      } else if (q.status === 'ACCEPTED') {
        items.push({
          id: `q-acc-${q.id}`,
          icon: Check,
          color: 'text-green-400',
          title: `Accepted quote for ${q.service.name}`,
          sub: q.provider.businessName,
          time: timeAgo(q.updatedAt || q.createdAt),
          date: new Date(q.updatedAt || q.createdAt),
        });
      }
    });

    jobs.forEach((j) => {
      if (j.status === 'COMPLETED' && j.completedAt) {
        items.push({
          id: `j-done-${j.id}`,
          icon: Star,
          color: 'text-amber-400',
          title: `Completed: ${j.quote.service.name}`,
          sub: j.quote.property.address,
          time: timeAgo(j.completedAt),
          date: new Date(j.completedAt),
        });
      } else if (j.status === 'SCHEDULED' && j.scheduledDate) {
        items.push({
          id: `j-sched-${j.id}`,
          icon: Clock,
          color: 'text-blue-400',
          title: `Scheduled: ${j.quote.service.name}`,
          sub: new Date(j.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          time: timeAgo(j.createdAt),
          date: new Date(j.createdAt),
        });
      }
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6);
  }, [quotes, jobs]);

  const goToStep = (target: number) => {
    if (target <= 4) {
      setSelectedProvider(null);
      setNotes('');
    }
    if (target <= 3) setSelectedProperty(null);
    if (target <= 2) {
      setSelectedService(null);
      setProviders([]);
    }
    if (target <= 1) setSelectedCategory(null);
    setError('');
    setStep(target);
  };

  const resetBuilder = () => {
    goToStep(1);
    setSuccess(false);
  };

  const pickCategory = (cat: any) => {
    setSelectedCategory(cat);
    setStep(2);
  };
  const pickService = (svc: any) => {
    setSelectedService(svc);
    setStep(3);
  };
  const pickProperty = (prop: any) => {
    setSelectedProperty(prop);
    setStep(4);
  };
  const pickProvider = (prov: any) => {
    setSelectedProvider(prov);
  };

  const continueToReview = () => {
    if (!selectedProvider) {
      setError('Please select a provider');
      return;
    }
    setError('');
    setStep(5);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedProperty || !selectedProvider) return;
    setSubmitting(true);
    setError('');
    try {
      await trpc.quote.request.mutate({
        serviceId: selectedService.id,
        propertyId: selectedProperty.id,
        providerId: selectedProvider.id,
        customerNotes: notes || undefined,
      });
      setSuccess(true);
      trpc.quote.listForCustomer
        .query()
        .then(setQuotes)
        .catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div>
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <GreetingSection firstName={firstName} />

      <StatsSection
        pendingQuotesCount={pendingQuotes.length}
        activeJobsCount={activeJobs.length}
        completedJobsCount={completedJobs.length}
        propertiesCount={properties.length}
      />

      <QuoteBuilderSection
        step={step}
        success={success}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedService={selectedService}
        selectedProperty={selectedProperty}
        selectedProvider={selectedProvider}
        properties={properties}
        providers={providers}
        loadingProviders={loadingProviders}
        notes={notes}
        submitting={submitting}
        error={error}
        onStepChange={goToStep}
        onReset={resetBuilder}
        onPickCategory={pickCategory}
        onPickService={pickService}
        onPickProperty={pickProperty}
        onPickProvider={pickProvider}
        onNotesChange={setNotes}
        onContinueToReview={continueToReview}
        onSubmit={handleSubmit}
      />

      <RecentActivitySection items={activityItems} />

      <ActiveJobsSection jobs={activeJobs} />
    </div>
  );
}
