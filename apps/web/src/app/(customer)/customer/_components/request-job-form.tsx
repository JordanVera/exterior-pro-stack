'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '../../../../lib/trpc';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { FilterPills } from '@/components/dashboard/filter-pills';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  ArrowLeft,
  Check,
  MapPin,
  Plus,
  Search,
  SearchX,
  Send,
  X,
} from 'lucide-react';
import { getCategoryIcon, formatPrice } from './utils';

type ServiceItem = {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number | string;
  unit?: string;
  categoryId: string;
  categoryName: string;
};

type Category = {
  id: string;
  name: string;
  services?: Omit<ServiceItem, 'categoryId' | 'categoryName'>[];
};

type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

interface RequestJobFormProps {
  categories: Category[];
  properties: Property[];
}

export function RequestJobForm({
  categories,
  properties,
}: RequestJobFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillServiceId = searchParams.get('serviceId');
  const prefillPropertyId = searchParams.get('propertyId');

  const allServices = useMemo<ServiceItem[]>(
    () =>
      categories.flatMap((cat) =>
        (cat.services ?? []).map((svc) => ({
          ...svc,
          categoryId: cat.id,
          categoryName: cat.name,
        })),
      ),
    [categories],
  );

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successJobId, setSuccessJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    if (prefillServiceId) {
      const found = allServices.find((svc) => svc.id === prefillServiceId);
      if (found) {
        setSelectedService(found);
        setCategoryId(found.categoryId);
      }
    }

    if (prefillPropertyId) {
      const found = properties.find((prop) => prop.id === prefillPropertyId);
      if (found) setSelectedProperty(found);
    } else if (properties.length === 1) {
      setSelectedProperty(properties[0]);
    }

    setInitialized(true);
  }, [
    initialized,
    prefillServiceId,
    prefillPropertyId,
    allServices,
    properties,
  ]);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allServices.filter((svc) => {
      if (categoryId !== 'all' && svc.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        svc.name.toLowerCase().includes(q) ||
        (svc.description ?? '').toLowerCase().includes(q) ||
        svc.categoryName.toLowerCase().includes(q)
      );
    });
  }, [allServices, categoryId, query]);

  const resetService = () => {
    setSelectedService(null);
    setNotes('');
    setError('');
    setSuccessJobId(null);
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
      setSuccessJobId(newJob.id);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit request';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successJobId) {
    return (
      <div className="animate-step-enter relative overflow-hidden rounded-2xl border border-brand-lime/30 bg-background/70 py-14 text-center backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,245,66,0.14),transparent_60%)]" />

        <div className="relative">
          <span className="animate-scale-check mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-brand-lime/30 bg-brand-lime/10">
            <Check className="h-8 w-8 text-brand-lime" />
          </span>
          <h3 className="text-lg font-semibold text-foreground">
            Job request submitted
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Providers in your area have been notified and can start submitting
            bids.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={resetService}
              className="rounded-full"
            >
              Request another
            </Button>
            <Button
              onClick={() => router.push(`/customer/jobs/${successJobId}`)}
              className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
            >
              View this job
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const confirmPanel = selectedService ? (
    <div className="relative h-fit overflow-hidden rounded-2xl border border-border bg-background/70 p-5 backdrop-blur-xl lg:sticky lg:top-28">
      <GlowingEffect
        disabled={false}
        glow
        proximity={80}
        spread={30}
        borderWidth={2}
      />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Confirm request
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Local providers will bid. You choose the offer.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetService}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-lime/25 bg-brand-lime/10">
            {(() => {
              const Icon = getCategoryIcon(selectedService.categoryName);
              return <Icon className="h-4 w-4 text-brand-lime" />;
            })()}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Service
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {selectedService.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedService.categoryName} ·{' '}
              {formatPrice(selectedService.basePrice, selectedService.unit)}
            </p>
          </div>
          <button
            type="button"
            onClick={resetService}
            className="ml-auto hidden text-muted-foreground transition-colors hover:text-foreground lg:block"
            aria-label="Change service"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Separator />

        {properties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border">
            <EmptyState
              icon={MapPin}
              title="Add a property to continue"
              description="We need an address before providers can bid."
              className="px-4 py-6"
              action={
                <Button
                  onClick={() => router.push('/customer/settings')}
                  size="sm"
                  className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
                >
                  <Plus className="h-4 w-4" />
                  Add property
                </Button>
              }
            />
          </div>
        ) : properties.length === 1 && selectedProperty ? (
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Property
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {selectedProperty.address}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedProperty.city}, {selectedProperty.state}{' '}
                {selectedProperty.zip}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Property
            </p>
            <div className="grid gap-2">
              {properties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedProperty(prop)}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-left transition-all',
                      isSelected
                        ? 'border-brand-lime bg-brand-lime/5 ring-1 ring-brand-lime/20'
                        : 'border-border hover:border-brand-lime/50',
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {prop.address}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {prop.city}, {prop.state} {prop.zip}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Notes for providers (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you need, special requirements, access instructions..."
            rows={3}
            maxLength={2000}
            className="resize-none rounded-xl text-sm"
          />
          <p className="text-right text-[11px] text-muted-foreground">
            {notes.length}/2000
          </p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedProperty}
          className="w-full rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-ink/30 border-t-brand-ink" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit job request
            </>
          )}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={cn('grid gap-6', selectedService && 'lg:grid-cols-[1fr_360px]')}
    >
      <div className={cn(selectedService && 'hidden lg:block')}>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services"
            className="h-11 rounded-full border-border bg-background/70 pl-10 backdrop-blur-xl"
          />
        </div>

        <FilterPills
          className="mb-4"
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: 'all', label: 'All', count: allServices.length },
            ...categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
              count: cat.services?.length ?? 0,
            })),
          ]}
        />

        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/50 backdrop-blur-xl">
            <EmptyState
              icon={SearchX}
              title={
                allServices.length === 0
                  ? 'No services available yet'
                  : 'No services match that search'
              }
              description={
                allServices.length === 0
                  ? 'We are still onboarding providers in your area. Check back soon.'
                  : 'Try a different keyword or clear the category filter.'
              }
              className="py-14"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredServices.map((svc) => {
              const Icon = getCategoryIcon(svc.categoryName);
              const isSelected = selectedService?.id === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc)}
                  aria-pressed={isSelected}
                  className={cn(
                    'relative flex items-start justify-between gap-3 overflow-hidden rounded-2xl border bg-background/70 p-4 text-left backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5',
                    isSelected
                      ? 'border-brand-lime ring-1 ring-brand-lime/20'
                      : 'border-border hover:border-brand-lime/50',
                  )}
                >
                  <GlowingEffect
                    disabled={false}
                    glow
                    proximity={64}
                    spread={26}
                    borderWidth={2}
                  />

                  <span className="relative min-w-0">
                    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-brand-lime/25 bg-brand-lime/10">
                      <Icon className="h-4 w-4 text-brand-lime" />
                    </span>
                    <span className="block text-sm font-medium text-foreground">
                      {svc.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {svc.categoryName}
                    </span>
                    {svc.description && (
                      <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                        {svc.description}
                      </span>
                    )}
                  </span>
                  <span className="relative flex-shrink-0 text-sm font-semibold text-foreground">
                    {formatPrice(svc.basePrice, svc.unit)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {confirmPanel}
    </div>
  );
}
