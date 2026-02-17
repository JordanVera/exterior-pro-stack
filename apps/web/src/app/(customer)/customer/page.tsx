'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { trpc } from '../../../lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Clock, Star, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timeAgo, groupDataByProperty } from './_components/utils';
import { GreetingSection } from './_components/greeting-section';
import { StatsSection } from './_components/stats-section';
import { PropertySection } from './_components/property-section';
import { JobRequestSection } from './_components/job-request-section';
import { RecentActivitySection } from './_components/recent-activity-section';
import { ActiveJobsSection } from './_components/active-jobs-section';

export default function CustomerHomePage() {
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      trpc.auth.me.query(),
      trpc.service.listCategories.query(),
      trpc.job.listForCustomer.query(),
      trpc.property.list.query(),
    ])
      .then(([u, cats, j, p]) => {
        setUser(u);
        setCategories(cats);
        setJobs(j);
        setProperties(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openJobs = useMemo(
    () => jobs.filter((j) => j.status === 'OPEN' || j.status === 'PENDING'),
    [jobs],
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

  const propertySummaries = useMemo(
    () => groupDataByProperty(properties, jobs),
    [properties, jobs],
  );

  const activityItems = useMemo(() => {
    const items: {
      id: string;
      icon: LucideIcon;
      color: string;
      title: string;
      sub: string;
      time: string;
      date: Date;
      job?: any;
    }[] = [];

    jobs.forEach((j) => {
      if (j.status === 'OPEN') {
        const bidCount = j.bids?.length || 0;
        items.push({
          id: `j-open-${j.id}`,
          icon: Briefcase,
          color: 'text-cyan-400',
          title: `Job requested: ${j.service.name}`,
          sub: bidCount > 0 ? `${bidCount} bid${bidCount > 1 ? 's' : ''} received` : 'Waiting for bids',
          time: timeAgo(j.createdAt),
          date: new Date(j.createdAt),
        });
      } else if (j.status === 'PENDING') {
        items.push({
          id: `j-pending-${j.id}`,
          icon: Check,
          color: 'text-green-400',
          title: `Bid accepted: ${j.service.name}`,
          sub: j.acceptedBid?.provider?.businessName || 'Provider assigned',
          time: timeAgo(j.updatedAt || j.createdAt),
          date: new Date(j.updatedAt || j.createdAt),
        });
      } else if (j.status === 'COMPLETED' && j.completedAt) {
        items.push({
          id: `j-done-${j.id}`,
          icon: Star,
          color: 'text-amber-400',
          title: `Completed: ${j.service.name}`,
          sub: j.property.address,
          time: timeAgo(j.completedAt),
          date: new Date(j.completedAt),
          job: j,
        });
      } else if (j.status === 'SCHEDULED' && j.scheduledDate) {
        items.push({
          id: `j-sched-${j.id}`,
          icon: Clock,
          color: 'text-blue-400',
          title: `Scheduled: ${j.service.name}`,
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
  }, [jobs]);

  const goToStep = (target: number) => {
    if (target <= 3) setSelectedProperty(null);
    if (target <= 2) {
      setSelectedService(null);
    }
    if (target <= 1) setSelectedCategory(null);
    setNotes('');
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

  const startRequestJobForProperty = (property: any) => {
    setSelectedProperty(property);
    setStep(1);
  };

  const startRebook = (job: any) => {
    const service = job.service;
    const category = service?.category;
    if (category) setSelectedCategory(category);
    if (service) setSelectedService(service);
    if (job.property) setSelectedProperty(job.property);
    setStep(4);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedProperty) return;
    setSubmitting(true);
    setError('');
    try {
      const newJob = await trpc.job.create.mutate({
        serviceId: selectedService.id,
        propertyId: selectedProperty.id,
        customerNotes: notes || undefined,
      });
      toast.success('Job request submitted successfully');
      setSuccess(true);
      // Refetch in background to ensure consistency
      trpc.job.listForCustomer
        .query()
        .then(setJobs)
        .catch(() => {});
    } catch (err: any) {
      const msg = err.message || 'Failed to submit request';
      setError(msg);
      toast.error(msg);
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
        openJobsCount={openJobs.length}
        activeJobsCount={activeJobs.length}
        completedJobsCount={completedJobs.length}
        propertiesCount={properties.length}
      />

      <JobRequestSection
        step={step}
        success={success}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedService={selectedService}
        selectedProperty={selectedProperty}
        properties={properties}
        notes={notes}
        submitting={submitting}
        error={error}
        onStepChange={goToStep}
        onReset={resetBuilder}
        onPickCategory={pickCategory}
        onPickService={pickService}
        onPickProperty={pickProperty}
        onNotesChange={setNotes}
        onSubmit={handleSubmit}
      />

      <PropertySection
        summaries={propertySummaries}
        onRequestJob={startRequestJobForProperty}
        onRebook={startRebook}
      />

      <RecentActivitySection items={activityItems} onRebook={startRebook} />

      <ActiveJobsSection jobs={activeJobs} />
    </div>
  );
}
