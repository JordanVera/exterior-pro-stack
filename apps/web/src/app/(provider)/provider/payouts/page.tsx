"use client";

import { useCallback, useEffect, useState } from "react";
import { loadConnectAndInitialize, type StripeConnectInstance } from "@stripe/connect-js/pure";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
  ConnectNotificationBanner,
  ConnectAccountManagement,
  ConnectPayouts,
  ConnectPayments,
} from "@stripe/react-connect-js";
import { trpc } from "../../../../lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ProviderPayoutsPage() {
  const [status, setStatus] = useState<any>(null);
  const [email, setEmail] = useState("");
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
      .catch((err) => toast.error(err.message || "Failed to load payouts"))
      .finally(() => setLoading(false));
  }, [loadStatus]);

  const initConnect = useCallback(
    async (publishableKey: string) => {
      const instance = loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret: async () => {
          const result = await trpc.connect.createAccountSession.mutate();
          return result.clientSecret;
        },
      });
      setConnectInstance(instance);
    },
    []
  );

  const handleStart = async () => {
    if (!agreed) {
      toast.error("Please agree to the contractor terms");
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
      toast.success("Payout onboarding started");
    } catch (err: any) {
      toast.error(err.message || "Failed to start onboarding");
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
    return <div className="text-neutral-500">Loading payouts...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-sm text-neutral-500">
          Connect your bank account to receive payouts after completed jobs.
        </p>
      </div>

      <div className="p-4 text-sm border rounded-xl border-neutral-200 dark:border-neutral-800">
        Status:{" "}
        <span className={status?.payoutsEnabled ? "text-green-600" : "text-amber-600"}>
          {status?.payoutsEnabled ? "Payouts enabled" : "Onboarding required"}
        </span>
      </div>

      {!status?.stripeAccountId && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Business email</Label>
            <Input
              id="email"
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link href="/contractor-agreement" className="text-cyan-600 underline">
                Independent Contractor Agreement
              </Link>
              .
            </span>
          </label>
          <Button
            onClick={handleStart}
            disabled={starting || !email || !agreed}
            className="bg-green-600 hover:bg-green-500"
          >
            {starting ? "Starting..." : "Set up payouts"}
          </Button>
        </div>
      )}

      {connectInstance && (
        <ConnectComponentsProvider connectInstance={connectInstance}>
          <div className="space-y-6">
            <ConnectNotificationBanner />
            {!status?.payoutsEnabled && (
              <ConnectAccountOnboarding
                onExit={() => {
                  void loadStatus();
                  toast.success("Onboarding updated");
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
