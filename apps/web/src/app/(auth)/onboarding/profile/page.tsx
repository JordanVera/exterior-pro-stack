'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { ZipCodeInput } from '@/components/zip-code-input';
import {
  ProviderLogoUpload,
  type ProviderLogoValue,
} from '@/components/provider-logo-upload';
import {
  ProviderServicePicker,
  type CatalogCategory,
} from '@/components/provider-service-picker';

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex overflow-hidden relative flex-col min-h-screen bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-black/70">
          <Link href="/" className="flex gap-2 items-center pl-1">
            <Image
              src="/logos/logo-stacked-lime.png"
              alt="Exterior Pro"
              width={84}
              height={32}
              priority
            />
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex relative z-10 flex-1 justify-center items-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceAreaZips, setServiceAreaZips] = useState('');
  const [logo, setLogo] = useState<ProviderLogoValue | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);

  useEffect(() => {
    trpc.auth.me
      .query()
      .then((user) => {
        setRole(user.role);
        if (user.email) setEmail(user.email);
        if (user.hasProfile) {
          if (user.role === 'CUSTOMER') router.push('/onboarding/property');
          else if (user.role === 'PROVIDER') router.push('/provider');
        }
      })
      .catch(() => router.push('/login'));

    trpc.service.listCategories
      .query()
      .then((data) => setCategories(data as CatalogCategory[]))
      .catch(() => undefined);
  }, [router]);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await trpc.auth.completeCustomerOnboarding.mutate({
        firstName,
        lastName,
        email: email || undefined,
      });
      router.push('/onboarding/property');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await trpc.auth.completeProviderOnboarding.mutate({
        businessName,
        description: description || undefined,
        serviceAreaZips,
        email: email || undefined,
        logoUrl: logo?.url,
        logoPathname: logo?.pathname,
        serviceIds,
      });
      router.push('/provider');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <AuthShell>
        <div className="flex flex-col gap-3 items-center">
          <div className="w-8 h-8 rounded-full border-2 animate-spin border-brand-lime/20 border-t-brand-lime" />
          <p className="text-sm text-muted-foreground">Loading</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="w-full max-w-lg">
        <Card className="relative p-8 rounded-2xl border shadow-lg backdrop-blur-xl border-border bg-background/80">
          <CardHeader className="p-0 mb-6 space-y-3 text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
              <span className="w-6 h-px bg-brand-lime" />
              Almost there
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Complete your profile
            </h1>
            <CardDescription>
              {role === 'CUSTOMER'
                ? 'Tell us a bit about yourself'
                : 'Tell us about your business'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {role === 'CUSTOMER' ? (
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="focus-visible:ring-brand-lime"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="focus-visible:ring-brand-lime"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-brand-lime"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !firstName || !lastName}
                  size="lg"
                  className="mt-2 w-full font-semibold rounded-xl bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </form>
            ) : null}

            {role === 'PROVIDER' ? (
              <form onSubmit={handleProviderSubmit} className="space-y-4">
                <ProviderLogoUpload
                  value={logo}
                  onChange={setLogo}
                  disabled={loading}
                  onBusyChange={setLogoBusy}
                />
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="focus-visible:ring-brand-lime"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="resize-none focus-visible:ring-brand-lime"
                    placeholder="Tell customers about your services..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-brand-lime"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Services you offer</Label>
                  <ProviderServicePicker
                    categories={categories}
                    value={serviceIds}
                    onChange={setServiceIds}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose at least one. You can set custom prices later in your
                    profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceAreaZips">Service ZIP codes</Label>
                  <ZipCodeInput
                    id="serviceAreaZips"
                    value={serviceAreaZips}
                    onChange={setServiceAreaZips}
                    disabled={loading}
                    placeholder="77008"
                  />
                  <p className="text-xs text-muted-foreground">
                    Select Greater Houston ZIPs you serve. Add any others one at
                    a time at the bottom.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    logoBusy ||
                    !businessName ||
                    !serviceAreaZips ||
                    serviceIds.length === 0
                  }
                  size="lg"
                  className="mt-2 w-full font-semibold rounded-xl bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
