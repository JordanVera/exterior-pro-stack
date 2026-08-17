'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '../../../../lib/trpc';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, MapPin, Plus, Search, Send, X } from 'lucide-react';
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
  const [categoryId, setCategoryId] = useState<string | null>(null);
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
      if (categoryId && svc.categoryId !== categoryId) return false;
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
      <Card className="shadow-none backdrop-blur-xl border-border bg-background/80 animate-step-enter">
        <CardContent className="py-12 text-center">
          <div className="inline-flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-green-500/10 animate-scale-check">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Job request submitted
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Providers in your area will be notified and can submit bids.
          </p>
          <div className="flex gap-3 justify-center items-center">
            <Button
              variant="outline"
              onClick={resetService}
              className="rounded-full"
            >
              Request another
            </Button>
            <Button
              onClick={() => router.push(`/customer/jobs/${successJobId}`)}
              className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
            >
              View this job
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confirmPanel = selectedService ? (
    <Card className="overflow-hidden shadow-none backdrop-blur-xl border-border bg-background/80 lg:sticky lg:top-28">
      <CardContent className="p-5 space-y-4">
        <div className="flex gap-3 justify-between items-start">
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
            className="px-2 h-7 text-xs text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="mr-1 w-3 h-3" />
            Back
          </Button>
        </div>

        <div className="flex gap-3 items-start">
          <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-cyan-500/10">
            {(() => {
              const Icon = getCategoryIcon(selectedService.categoryName);
              return <Icon className="w-4 h-4 text-cyan-400" />;
            })()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-muted-foreground">Service</div>
            <div className="text-sm font-medium text-foreground">
              {selectedService.name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {selectedService.categoryName} ·{' '}
              {formatPrice(selectedService.basePrice, selectedService.unit)}
            </div>
          </div>
          <button
            type="button"
            onClick={resetService}
            className="hidden ml-auto transition-colors text-muted-foreground hover:text-foreground lg:block"
            aria-label="Change service"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Separator />

        {properties.length === 0 ? (
          <div className="px-4 py-6 text-center rounded-xl border border-dashed border-border">
            <MapPin className="mx-auto mb-2 w-6 h-6 text-muted-foreground" />
            <p className="mb-3 text-sm text-muted-foreground">
              Add a property to continue.
            </p>
            <Button
              onClick={() => router.push('/customer/settings')}
              className="text-black bg-cyan-500 rounded-full hover:bg-cyan-400"
              size="sm"
            >
              <Plus className="mr-1 w-4 h-4" />
              Add property
            </Button>
          </div>
        ) : properties.length === 1 && selectedProperty ? (
          <div className="flex gap-3 items-start">
            <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-muted">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Property</div>
              <div className="text-sm font-medium text-foreground">
                {selectedProperty.address}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {selectedProperty.city}, {selectedProperty.state}{' '}
                {selectedProperty.zip}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Property
            </div>
            <div className="grid gap-2">
              {properties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedProperty(prop)}
                    className={cn(
                      'px-3 py-3 text-left rounded-xl border transition-all',
                      isSelected
                        ? 'border-cyan-500 ring-1 bg-cyan-500/5 ring-cyan-500/20'
                        : 'border-border hover:border-cyan-500/50',
                    )}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {prop.address}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {prop.city}, {prop.state} {prop.zip}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Notes for providers (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you need, special requirements, access instructions..."
            rows={3}
            maxLength={2000}
            className="text-sm resize-none"
          />
          <div className="text-right text-[11px] text-muted-foreground">
            {notes.length}/2000
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedProperty}
          className="w-full font-semibold text-black bg-cyan-500 rounded-xl hover:bg-cyan-400"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 animate-spin border-black/30 border-t-black" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit job request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div
      className={cn(
        'grid gap-6',
        selectedService && 'lg:grid-cols-[1fr_360px]',
      )}
    >
      <div className={cn(selectedService && 'hidden lg:block')}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services"
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          <Badge
            variant="secondary"
            onClick={() => setCategoryId(null)}
            className={cn(
              'cursor-pointer select-none rounded-full border-0 px-3.5 py-1.5 text-xs font-medium',
              categoryId === null
                ? 'bg-cyan-500 text-white hover:bg-cyan-500'
                : 'hover:text-foreground',
            )}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant="secondary"
              onClick={() =>
                setCategoryId((current) => (current === cat.id ? null : cat.id))
              }
              className={cn(
                'cursor-pointer select-none rounded-full border-0 px-3.5 py-1.5 text-xs font-medium',
                categoryId === cat.id
                  ? 'bg-cyan-500 text-white hover:bg-cyan-500'
                  : 'hover:text-foreground',
              )}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {filteredServices.length === 0 ? (
          <div className="py-12 text-sm text-center text-muted-foreground">
            {allServices.length === 0
              ? 'No services available yet. Check back soon!'
              : 'No services match that search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredServices.map((svc) => {
              const Icon = getCategoryIcon(svc.categoryName);
              const isSelected = selectedService?.id === svc.id;
              return (
                <Card
                  key={svc.id}
                  className={cn(
                    'cursor-pointer border-border bg-background/80 shadow-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
                    isSelected && 'border-cyan-500 ring-1 ring-cyan-500/20',
                  )}
                  onClick={() => setSelectedService(svc)}
                >
                  <CardContent className="flex gap-3 justify-between items-start p-4">
                    <div className="min-w-0">
                      <div className="flex justify-center items-center mb-2 w-8 h-8 rounded-lg bg-cyan-500/10">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {svc.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {svc.categoryName}
                      </div>
                      {svc.description && (
                        <div className="mt-1 text-xs line-clamp-2 text-muted-foreground">
                          {svc.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-sm font-semibold text-foreground">
                      {formatPrice(svc.basePrice, svc.unit)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {confirmPanel}
    </div>
  );
}
