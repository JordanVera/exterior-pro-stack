'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { PropertyAddressForm } from '@/components/property-address-form';

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-brand-navy/70">
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

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}

export default function PropertyOnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    trpc.auth.me
      .query()
      .then(async (user) => {
        if (user.role !== 'CUSTOMER') {
          router.push(user.role === 'PROVIDER' ? '/provider' : '/');
          return;
        }
        if (!user.hasProfile) {
          router.push('/onboarding/profile');
          return;
        }
        const properties = await trpc.property.list.query();
        if (properties.length > 0) {
          router.push('/customer');
          return;
        }
        setReady(true);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (!ready) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-lime/20 border-t-brand-lime" />
          <p className="text-sm text-muted-foreground">Loading</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <Card className="relative rounded-2xl border border-border bg-background/80 p-8 shadow-lg backdrop-blur-xl">
          <CardHeader className="mb-6 space-y-3 p-0 text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
              <span className="h-px w-6 bg-brand-lime" />
              Last step
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Add your property
            </h1>
            <CardDescription>
              Jobs are requested for a home. Add one address to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <PropertyAddressForm
              submitLabel="Continue"
              onSuccess={() => router.push('/customer')}
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full text-xs text-muted-foreground"
              onClick={() => router.push('/customer')}
            >
              Skip for now
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
