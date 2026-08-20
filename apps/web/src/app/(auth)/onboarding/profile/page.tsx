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
  CardTitle,
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
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-black/70">
          <Link href="/" className="flex items-center gap-2 pl-1">
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

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
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
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-lime/20 border-t-brand-lime" />
          <p className="text-sm text-muted-foreground">Loading</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
          <span className="h-px w-6 bg-brand-lime" />
          Almost there
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Complete your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === 'CUSTOMER'
            ? 'Tell us a bit about yourself'
            : 'Tell us about your business, the work you do, and where you serve.'}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {role === 'CUSTOMER' ? (
        <Card className="max-w-xl border-border bg-background/80 shadow-none">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                className="rounded-xl bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
              >
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {role === 'PROVIDER' ? (
        <form onSubmit={handleProviderSubmit} className="space-y-6">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card className="border-border bg-background/80 shadow-none">
              <CardHeader className="p-5 pb-0">
                <CardTitle className="text-base">Business information</CardTitle>
                <CardDescription>
                  Logo, name, and how customers will reach you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
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
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border bg-background/80 shadow-none">
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Services you offer</CardTitle>
                  <CardDescription>
                    Choose at least one. Custom prices can be set later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <ProviderServicePicker
                    categories={categories}
                    value={serviceIds}
                    onChange={setServiceIds}
                    disabled={loading}
                  />
                </CardContent>
              </Card>

              <Card className="border-border bg-background/80 shadow-none">
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="text-base">Service ZIP codes</CardTitle>
                  <CardDescription>
                    Select Greater Houston ZIPs you serve. Add any others one at
                    a time at the bottom.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <ZipCodeInput
                    id="serviceAreaZips"
                    value={serviceAreaZips}
                    onChange={setServiceAreaZips}
                    disabled={loading}
                    placeholder="77008"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
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
              className="rounded-xl bg-brand-lime px-8 font-semibold text-brand-ink hover:bg-brand-lime/90"
            >
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      ) : null}
    </AuthShell>
  );
}
