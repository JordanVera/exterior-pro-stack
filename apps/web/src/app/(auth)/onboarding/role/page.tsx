'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BackgroundBeams className="opacity-40" delay={0} />

      <header className="relative z-20 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-background/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl dark:bg-brand-navy/70">
          <Link href="/" className="flex items-center gap-2 pl-1">
            <Image
              src="/logos/logo-stacked.png"
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
        <div className="w-full max-w-lg">
          <Card className="relative rounded-2xl border border-border bg-background/80 p-8 shadow-lg backdrop-blur-xl">
            <CardHeader className="mb-6 space-y-3 p-0 text-center">
              <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-navy dark:text-brand-lime">
                <span className="h-px w-6 bg-brand-lime" />
                Get started
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome
              </h1>
              <CardDescription>
                How would you like to use Exterior Pro?
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 p-0">
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
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                      intent === 'customer'
                        ? 'bg-brand-lime/20 text-brand-navy dark:text-brand-lime'
                        : 'bg-brand-lime/10 text-brand-navy group-hover:bg-brand-lime/20 dark:text-brand-lime',
                    )}
                  >
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      I need services
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Book pressure washing, lawn care, painting, and more for
                      your property.
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                      intent === 'provider'
                        ? 'bg-brand-lime/20 text-brand-navy dark:text-brand-lime'
                        : 'bg-brand-lime/10 text-brand-navy group-hover:bg-brand-lime/20 dark:text-brand-lime',
                    )}
                  >
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      I provide services
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your crew, respond to quotes, and grow your
                      exterior service business.
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>

              {loading ? (
                <p className="text-center text-sm text-muted-foreground">
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
