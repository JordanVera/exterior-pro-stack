'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, ChevronRight } from 'lucide-react';
import { trpc } from '../../../../lib/trpc';
import { clearToken } from '../../../../lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ZipCodeInput } from '@/components/zip-code-input';
import {
  ProviderLogoUpload,
  type ProviderLogoValue,
} from '@/components/provider-logo-upload';
import { RatingSummary } from '@/components/star-rating';
import { ReviewList, type PublicReview } from '@/components/review-list';

export default function ProviderProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceAreaZips, setServiceAreaZips] = useState('');
  const [logo, setLogo] = useState<ProviderLogoValue | null>(null);
  const [selectedServices, setSelectedServices] = useState<
    Map<string, number | undefined>
  >(new Map());

  useEffect(() => {
    Promise.all([trpc.provider.getProfile.query(), trpc.service.list.query()])
      .then(([p, s]) => {
        setProfile(p);
        setAllServices(s);
        setBusinessName(p.businessName);
        setDescription(p.description || '');
        setServiceAreaZips(p.serviceAreaZips || '');
        setLogo(
          p.logoUrl && p.logoPathname
            ? { url: p.logoUrl, pathname: p.logoPathname }
            : null,
        );
        const selected = new Map<string, number | undefined>();
        p.services.forEach((ps: any) => {
          selected.set(
            ps.service.id,
            ps.customPrice ? Number(ps.customPrice) : undefined,
          );
        });
        setSelectedServices(selected);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await trpc.provider.updateProfile.mutate({
        businessName,
        description: description || undefined,
        serviceAreaZips: serviceAreaZips || undefined,
      });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      const services = Array.from(selectedServices.entries()).map(
        ([serviceId, customPrice]) => ({ serviceId, customPrice }),
      );
      await trpc.provider.setServices.mutate({ services });
      toast.success('Services updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update services');
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const next = new Map(selectedServices);
    if (next.has(serviceId)) next.delete(serviceId);
    else next.set(serviceId, undefined);
    setSelectedServices(next);
  };

  const handleSignOut = async () => {
    await clearToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Business profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your business information and the services you offer.
          {!profile?.verified && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-full border-0 bg-amber-500/10 text-[10px] uppercase tracking-wide text-amber-500"
            >
              Pending verification
            </Badge>
          )}
        </p>
      </div>

      <Card className="shadow-none border-border bg-background/80">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base">Customer reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <RatingSummary
            average={profile?.rating?.average}
            count={profile?.rating?.count}
            size="md"
            emptyLabel="No ratings yet"
          />
          <ReviewList
            reviews={(profile?.reviews ?? []) as PublicReview[]}
            empty="Reviews from completed jobs will show up here."
          />
        </CardContent>
      </Card>

      <Card className="shadow-none border-border bg-background/80">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base">Business information</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <ProviderLogoUpload
            value={logo}
            onChange={setLogo}
            disabled={saving}
          />
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zips">Service ZIP codes</Label>
            <ZipCodeInput
              id="zips"
              value={serviceAreaZips}
              onChange={setServiceAreaZips}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Select Greater Houston ZIPs you serve. Jobs in those areas show up
              in your available list.
            </p>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving || !businessName || !serviceAreaZips}
            className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-none border-border bg-background/80">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base">Services you offer</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the services you provide. Optional custom prices override the
            base rate.
          </p>
          <div className="space-y-2">
            {allServices.map((service) => {
              const isSelected = selectedServices.has(service.id);
              return (
                <div
                  key={service.id}
                  className={cn(
                    'flex gap-3 items-center p-3 rounded-xl border transition-colors',
                    isSelected
                      ? 'border-brand-lime/40 bg-brand-lime/5'
                      : 'border-border',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleService(service.id)}
                    className="w-4 h-4 accent-brand-lime"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {service.name}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({service.category.name})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Base: ${Number(service.basePrice).toFixed(2)}
                  </span>
                  {isSelected && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Custom $"
                      value={selectedServices.get(service.id) ?? ''}
                      onChange={(e) => {
                        const next = new Map(selectedServices);
                        next.set(
                          service.id,
                          e.target.value ? Number(e.target.value) : undefined,
                        );
                        setSelectedServices(next);
                      }}
                      className="w-24 h-8"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Button
            onClick={handleSaveServices}
            disabled={saving}
            className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
          >
            {saving ? 'Saving...' : 'Save services'}
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={handleSignOut}
        className="justify-between w-full text-red-500 border-border hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
      >
        <div className="flex gap-3 items-center">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
