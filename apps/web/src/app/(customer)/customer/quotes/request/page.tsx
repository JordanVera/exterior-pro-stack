'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../../../../../lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RequestQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get('serviceId');

  const [services, setServices] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [serviceId, setServiceId] = useState(preSelectedServiceId || '');
  const [propertyId, setPropertyId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([trpc.service.list.query(), trpc.property.list.query()])
      .then(([s, p]) => {
        setServices(s);
        setProperties(p);
        if (p.length > 0) setPropertyId(p[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (serviceId) {
      trpc.provider.list
        .query({ serviceId })
        .then((p) => {
          setProviders(p);
          setProviderId(p.length > 0 ? p[0].id : '');
        })
        .catch(console.error);
    } else {
      setProviders([]);
      setProviderId('');
    }
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !propertyId || !providerId) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await trpc.quote.request.mutate({
        serviceId,
        propertyId,
        providerId,
        customerNotes: notes || undefined,
      });
      router.push('/customer/quotes');
    } catch (err: any) {
      setError(err.message || 'Failed to request quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Request a Quote
        </h2>
        <p className="text-muted-foreground mt-1">
          Select a service, property, and provider to get started
        </p>
      </div>

      {properties.length === 0 && (
        <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
          <AlertDescription>
            You need to add a property first.{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-yellow-800 dark:text-yellow-400 underline"
              onClick={() => router.push('/customer/properties')}
            >
              Add Property
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <div className="space-y-2">
              <Label>Service *</Label>
              <Select
                value={serviceId}
                onValueChange={setServiceId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.category.name} — {s.name} (${Number(s.basePrice).toFixed(2)}/
                      {s.unit === 'SQFT'
                        ? 'sq ft'
                        : s.unit === 'HOUR'
                          ? 'hr'
                          : 'flat'}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property *</Label>
              <Select
                value={propertyId}
                onValueChange={setPropertyId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.address}, {p.city}, {p.state} {p.zip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Provider *</Label>
              <Select
                value={providerId}
                onValueChange={setProviderId}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      serviceId
                        ? providers.length === 0
                          ? 'No providers for this service'
                          : 'Select a provider...'
                        : 'Select a service first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.businessName}
                      {p.serviceArea ? ` (${p.serviceArea})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes for provider</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe what you need, special requirements, etc."
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting || properties.length === 0}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {submitting ? 'Requesting...' : 'Request Quote'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
