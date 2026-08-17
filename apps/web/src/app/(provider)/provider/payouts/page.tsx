'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadConnectAndInitialize, type StripeConnectInstance } from '@stripe/connect-js/pure';
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
  ConnectNotificationBanner,
  ConnectAccountManagement,
  ConnectPayouts,
  ConnectPayments,
} from '@stripe/react-connect-js';
import { toast } from 'sonner';
import Link from 'next/link';
import { trpc } from '../../../../lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ProviderPayoutsPage() {
  const [status, setStatus] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null);

  const loadStatus = useCallback(() => {
    return trpc.connect.getStatus.query().then((s) => {
      setStatus(s);
      if (s.email) setEmail(s.email);
      return s;
    });
  }, []);

  useEffect(() => {
    loadStatus()
      .catch((err) => toast.error(err.message || 'Failed to load payouts'))
      .finally(() => setLoading(false));
  }, [loadStatus]);

  const initConnect = useCallback(async (publishableKey: string) => {
    const instance = loadConnectAndInitialize({
      publishableKey,
      fetchClientSecret: async () => {
        const result = await trpc.connect.createAccountSession.mutate();
        return result.clientSecret;
      },
    });
    setConnectInstance(instance);
  }, []);

  const handleStart = async () => {
    if (!agreed) {
      toast.error('Please agree to the contractor terms');
      return;
    }
    setStarting(true);
    try {
      const result = await trpc.connect.startOnboarding.mutate({
        email,
        agreeToContractorTerms: true,
      });
      const fresh = await loadStatus();
      if (fresh.publishableKey) {
        const instance = loadConnectAndInitialize({
          publishableKey: fresh.publishableKey,
          fetchClientSecret: async () => result.clientSecret,
        });
        setConnectInstance(instance);
      }
      toast.success('Payout onboarding started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start onboarding');
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (status?.stripeAccountId && status.publishableKey && !connectInstance) {
      void initConnect(status.publishableKey);
    }
  }, [status, connectInstance, initConnect]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your bank account to receive payouts after completed jobs.
        </p>
      </div>

      <Card className="border-border bg-background/80 shadow-none">
        <CardContent className="flex items-center justify-between p-5">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge
            variant="secondary"
            className={cn(
              'rounded-full border-0 text-[10px] uppercase tracking-wide',
              status?.payoutsEnabled
                ? 'bg-green-500/10 text-green-500'
                : 'bg-amber-500/10 text-amber-500',
            )}
          >
            {status?.payoutsEnabled ? 'Payouts enabled' : 'Onboarding required'}
          </Badge>
        </CardContent>
      </Card>

      {!status?.stripeAccountId && (
        <Card className="border-border bg-background/80 shadow-none">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="email">Business email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1 accent-brand-lime"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link
                  href="/contractor-agreement"
                  className="text-brand-navy underline dark:text-brand-lime"
                >
                  Independent Contractor Agreement
                </Link>
                .
              </span>
            </label>
            <Button
              onClick={handleStart}
              disabled={starting || !email || !agreed}
              className="rounded-full bg-brand-lime font-semibold text-brand-ink hover:bg-brand-lime/90"
            >
              {starting ? 'Starting...' : 'Set up payouts'}
            </Button>
          </CardContent>
        </Card>
      )}

      {connectInstance && (
        <ConnectComponentsProvider connectInstance={connectInstance}>
          <div className="space-y-6">
            <ConnectNotificationBanner />
            {!status?.payoutsEnabled && (
              <ConnectAccountOnboarding
                onExit={() => {
                  void loadStatus();
                  toast.success('Onboarding updated');
                }}
              />
            )}
            <ConnectAccountManagement />
            <ConnectPayouts />
            <ConnectPayments />
          </div>
        </ConnectComponentsProvider>
      )}
    </div>
  );
}
