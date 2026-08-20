'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { trpc } from '../../../../lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { SegmentedTabs } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { SectionPanel } from '@/components/dashboard/section-panel';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Check, Crown, Leaf, MapPin, Sparkles, Zap } from 'lucide-react';

type Billing = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Bi-annually',
};

const PERIOD_LABELS: Record<Billing, string> = {
  MONTHLY: '/month',
  QUARTERLY: '/quarter',
  ANNUALLY: '/year',
};

const PLAN_ICONS = [Leaf, Zap, Crown];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600 dark:text-green-400',
  PAUSED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PAST_DUE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  CANCELLED: 'bg-muted text-muted-foreground',
};

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [billingFrequency, setBillingFrequency] = useState<Billing>('MONTHLY');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    Promise.all([
      trpc.subscription.listPlans.query(),
      trpc.property.list.query(),
      trpc.subscription.listForCustomer.query(),
    ])
      .then(([p, props, subs]) => {
        setPlans(p);
        setProperties(props);
        setSubscriptions(subs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPrice = (plan: any) => {
    switch (billingFrequency) {
      case 'QUARTERLY':
        return plan.quarterlyPriceCents
          ? `$${(plan.quarterlyPriceCents / 100).toFixed(0)}`
          : null;
      case 'ANNUALLY':
        return plan.annualPriceCents
          ? `$${(plan.annualPriceCents / 100).toFixed(0)}`
          : null;
      default:
        return `$${(plan.monthlyPriceCents / 100).toFixed(0)}`;
    }
  };

  const activeSubs = useMemo(
    () =>
      subscriptions.filter(
        (s) => s.status === 'ACTIVE' || s.status === 'PAUSED',
      ),
    [subscriptions],
  );

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedProperty) {
      toast.error('Please select a plan and property');
      return;
    }

    const existingSub = activeSubs.find(
      (s) => s.propertyId === selectedProperty,
    );
    if (existingSub) {
      toast.error('This property already has an active subscription');
      return;
    }

    setSubscribing(true);
    try {
      const result = await trpc.subscription.subscribe.mutate({
        planId: selectedPlan,
        propertyId: selectedProperty,
        billingFrequency,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      toast.success('Subscription created successfully!');
      router.push('/customer/subscriptions');
    } catch (err: any) {
      toast.error(err.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="mx-auto w-80 h-11 rounded-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        eyebrow="Plans"
        size="md"
        title="Put your property on autopilot"
        subtitle="Pick a plan and the same verified crew keeps showing up on schedule. Pause or cancel anytime."
        action={
          activeSubs.length > 0 ? (
            <Button
              variant="outline"
              onClick={() => router.push('/customer/subscriptions')}
              className="rounded-full"
            >
              Manage subscriptions
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 items-center">
        <SegmentedTabs
          size="sm"
          layoutId="plans-billing"
          value={billingFrequency}
          onChange={(value) => setBillingFrequency(value as Billing)}
          options={[
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'QUARTERLY', label: 'Quarterly' },
            { value: 'ANNUALLY', label: 'Annually' },
          ]}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {billingFrequency === 'ANNUALLY' ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-brand-lime" />
              Paying yearly saves about 17%.
            </>
          ) : (
            'Switch to annual billing to save about 17%.'
          )}
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed backdrop-blur-xl border-border bg-background/50">
          <EmptyState
            icon={Leaf}
            title="No plans available yet"
            description="Recurring plans are not published for your area right now. You can still request one-time jobs."
            className="py-16"
            action={
              <Button
                onClick={() => router.push('/customer/jobs/new')}
                className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
              >
                Request a service
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, i) => {
            const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
            const price = getPrice(plan);
            const isSelected = selectedPlan === plan.id;
            const isFeatured = i === 1;

            return (
              <motion.button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                aria-pressed={isSelected}
                className={cn(
                  'flex overflow-hidden relative flex-col p-5 h-full text-left rounded-2xl border backdrop-blur-xl transition-all bg-background/70',
                  isSelected
                    ? 'ring-2 border-brand-lime ring-brand-lime/25'
                    : 'border-border hover:border-brand-lime/50',
                )}
              >
                <GlowingEffect
                  disabled={false}
                  glow
                  proximity={80}
                  spread={30}
                  borderWidth={2}
                />

                {isFeatured ? (
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-navy to-brand-lime" />
                ) : null}

                <div className="flex relative flex-col flex-1">
                  <div className="flex gap-3 items-center">
                    <span
                      className={cn(
                        'flex justify-center items-center w-10 h-10 rounded-xl border transition-colors shrink-0',
                        isSelected
                          ? 'border-brand-lime bg-brand-lime text-brand-ink'
                          : 'border-brand-lime/25 bg-brand-lime/10 text-brand-lime',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate text-foreground">
                        {plan.name}
                      </h3>
                      {isFeatured ? (
                        <span className="mt-0.5 inline-block rounded-full bg-brand-lime/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-navy dark:text-brand-lime">
                          Most popular
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {price ? (
                    <p className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-foreground">
                        {price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {PERIOD_LABELS[billingFrequency]}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Not offered on this billing cycle.
                    </p>
                  )}

                  <p className="mt-3 text-xs leading-relaxed line-clamp-2 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="pt-4 mt-4 border-t border-border">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Included services
                    </p>
                    <ul className="mt-2 space-y-2">
                      {plan.services?.map((ps: any) => (
                        <li key={ps.id} className="flex gap-2 items-center">
                          <Check className="h-3.5 w-3.5 shrink-0 text-brand-lime" />
                          <span className="text-xs truncate text-foreground">
                            {ps.service.name}
                          </span>
                          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                            {FREQUENCY_LABELS[ps.frequency] || ps.frequency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center items-center pt-5 mt-auto">
                    <span
                      className={cn(
                        'px-4 py-2 w-full text-xs font-semibold text-center rounded-full transition-colors',
                        isSelected
                          ? 'bg-brand-lime text-brand-ink'
                          : 'border border-border text-muted-foreground',
                      )}
                    >
                      {isSelected ? 'Selected' : 'Choose this plan'}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <SectionPanel title="Complete your subscription" bodyClassName="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Property
              </label>
              {properties.length === 0 ? (
                <p className="p-3 mt-2 text-xs rounded-xl border border-dashed border-border text-muted-foreground">
                  Add a property in settings before subscribing.
                </p>
              ) : (
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex gap-2 items-center">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {p.address}, {p.city}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={subscribing || !selectedProperty}
              className="font-semibold rounded-full bg-brand-lime text-brand-ink hover:bg-brand-lime/90 sm:w-auto"
            >
              {subscribing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 animate-spin border-brand-ink/30 border-t-brand-ink" />
                  Processing…
                </>
              ) : (
                'Subscribe securely'
              )}
            </Button>
          </div>
        </SectionPanel>
      )}

      {subscriptions.length > 0 && (
        <SectionPanel
          title="Your subscriptions"
          count={subscriptions.length}
          viewAll={{ href: '/customer/subscriptions', label: 'Manage' }}
          bare
        >
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex gap-3 justify-between items-center p-4 rounded-2xl border backdrop-blur-xl border-border bg-background/70"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {sub.plan.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {sub.property.address}, {sub.property.city}
                    {sub.provider
                      ? ` · ${sub.provider.businessName}`
                      : ' · Provider being assigned'}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                    STATUS_STYLES[sub.status] ??
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}
    </div>
  );
}
