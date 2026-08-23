'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { ArrowRight, Home, Wrench } from 'lucide-react';
import { trpc } from '../../../../lib/trpc';
import { setToken } from '../../../../lib/auth';
import { isAuthIntent } from '@/lib/auth-intent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { cn } from '@/lib/utils';

export default function RoleSelectionPage() {
  return (
    <Suspense>
      <RoleSelectionContent />
    </Suspense>
  );
}

function RoleSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get('intent');
  const intent = isAuthIntent(intentParam) ? intentParam : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = async (role: 'CUSTOMER' | 'PROVIDER') => {
    setLoading(true);
    setError('');
    try {
      const result = await trpc.auth.selectRole.mutate({ role });
      await setToken(result.token);
      router.push('/onboarding/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden relative flex-col min-h-screen bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-brand-navy/70">
          <Link href="/" className="flex gap-2 items-center pl-1">
            <BrandLogo width={84} height={32} priority />
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex relative z-10 flex-1 justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg">
          <Card className="relative p-8 rounded-2xl border shadow-lg backdrop-blur-xl border-border bg-background/80">
            <CardHeader className="p-0 mb-6 space-y-3 text-center">
              <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
                <span className="w-6 h-px bg-brand-lime" />
                Get started
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome
              </h1>
              <CardDescription>
                How would you like to use Exterior Pro?
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <button
                type="button"
                onClick={() => handleSelectRole('CUSTOMER')}
                disabled={loading}
                className={cn(
                  'group w-full rounded-xl border p-6 text-left transition-all',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  intent === 'customer'
                    ? 'border-brand-lime/70 bg-brand-lime/10'
                    : 'border-border bg-background/60 hover:border-brand-lime/60 hover:bg-brand-lime/5',
                )}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                      intent === 'customer'
                        ? 'bg-brand-lime/20 text-brand-navy dark:text-brand-lime'
                        : 'bg-brand-lime/10 text-brand-navy group-hover:bg-brand-lime/20 dark:text-brand-lime',
                    )}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      I need services
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Book pressure washing, lawn care, painting, and more for
                      your property.
                    </p>
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 opacity-0 transition-opacity shrink-0 text-muted-foreground group-hover:opacity-100" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('PROVIDER')}
                disabled={loading}
                className={cn(
                  'group w-full rounded-xl border p-6 text-left transition-all',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  intent === 'provider'
                    ? 'border-brand-lime/70 bg-brand-lime/10'
                    : 'border-border bg-background/60 hover:border-brand-lime/60 hover:bg-brand-lime/5',
                )}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                      intent === 'provider'
                        ? 'bg-brand-lime/20 text-brand-navy dark:text-brand-lime'
                        : 'bg-brand-lime/10 text-brand-navy group-hover:bg-brand-lime/20 dark:text-brand-lime',
                    )}
                  >
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      I provide services
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your crew, respond to quotes, and grow your
                      exterior service business.
                    </p>
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 opacity-0 transition-opacity shrink-0 text-muted-foreground group-hover:opacity-100" />
                </div>
              </button>

              {loading ? (
                <p className="text-sm text-center text-muted-foreground">
                  Setting up your account...
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
