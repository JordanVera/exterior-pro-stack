'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../../lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Crown, Zap, Leaf, MapPin } from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Bi-annually',
};

const PLAN_ICONS = [Leaf, Zap, Crown];

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [billingFrequency, setBillingFrequency] = useState<string>('MONTHLY');
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
        return plan.quarterlyPrice
          ? `$${Number(plan.quarterlyPrice).toFixed(0)}`
          : null;
      case 'ANNUALLY':
        return plan.annualPrice
          ? `$${Number(plan.annualPrice).toFixed(0)}`
          : null;
      default:
        return `$${Number(plan.monthlyPrice).toFixed(0)}`;
    }
  };

  const getPeriodLabel = () => {
    switch (billingFrequency) {
      case 'QUARTERLY':
        return '/quarter';
      case 'ANNUALLY':
        return '/year';
      default:
        return '/month';
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedProperty) {
      toast.error('Please select a plan and property');
      return;
    }

    // Check if property already has a subscription
    const existingSub = subscriptions.find(
      (s) =>
        s.propertyId === selectedProperty &&
        (s.status === 'ACTIVE' || s.status === 'PAUSED'),
    );
    if (existingSub) {
      toast.error('This property already has an active subscription');
      return;
    }

    setSubscribing(true);
    try {
      await trpc.subscription.subscribe.mutate({
        planId: selectedPlan,
        propertyId: selectedProperty,
        billingFrequency: billingFrequency as
          | 'MONTHLY'
          | 'QUARTERLY'
          | 'ANNUALLY',
      });
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
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Save with recurring service plans. Choose a plan and we&apos;ll match
          you with a local provider.
        </p>
      </div>

      {/* Billing frequency toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500">Billing:</span>
        <div className="inline-flex p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
          {['MONTHLY', 'QUARTERLY', 'ANNUALLY'].map((freq) => (
            <button
              key={freq}
              onClick={() => setBillingFrequency(freq)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-all',
                billingFrequency === freq
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              )}
            >
              {freq === 'MONTHLY'
                ? 'Monthly'
                : freq === 'QUARTERLY'
                  ? 'Quarterly'
                  : 'Annually'}
            </button>
          ))}
        </div>
        {billingFrequency === 'ANNUALLY' && (
          <Badge className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-0">
            Save ~17%
          </Badge>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, i) => {
          const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
          const price = getPrice(plan);
          const isSelected = selectedPlan === plan.id;
          const isMiddle = i === 1;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden shadow-none transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'hover:border-neutral-300 dark:hover:border-neutral-700',
                isMiddle && !isSelected && 'border-cyan-500/30',
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {isMiddle && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-600" />
              )}
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected
                        ? 'bg-cyan-500 text-white'
                        : 'bg-cyan-500/10 text-cyan-500',
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {isMiddle && (
                      <Badge className="text-[9px] bg-cyan-500/10 text-cyan-500 border-0 mt-0.5">
                        Most popular
                      </Badge>
                    )}
                  </div>
                </div>

                {price && (
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {price}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {getPeriodLabel()}
                    </span>
                  </div>
                )}

                <p className="mb-4 text-xs text-neutral-500 line-clamp-2">
                  {plan.description}
                </p>

                <Separator className="mb-4" />

                <div className="space-y-2">
                  <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Included services
                  </div>
                  {plan.services?.map((ps: any) => (
                    <div key={ps.id} className="flex items-center gap-2">
                      <Check className="flex-shrink-0 w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-xs text-neutral-700 dark:text-neutral-300">
                        {ps.service.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-auto">
                        {FREQUENCY_LABELS[ps.frequency] || ps.frequency}
                      </span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center w-6 h-6 mx-auto rounded-full bg-cyan-500">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscribe section */}
      {selectedPlan && (
        <Card className="shadow-none animate-step-enter">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Complete your subscription
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Select property
                </label>
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          {p.address}, {p.city}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={subscribing || !selectedProperty}
              className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400"
            >
              {subscribing ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active subscriptions */}
      {subscriptions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Your Subscriptions
          </h2>
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {sub.plan.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {sub.property.address}, {sub.property.city}
                      </div>
                      {sub.provider && (
                        <div className="text-xs text-neutral-400 mt-0.5">
                          Provider: {sub.provider.businessName}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'rounded-full border-0 text-[10px] uppercase',
                        sub.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : sub.status === 'PAUSED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-neutral-200 text-neutral-500',
                      )}
                    >
                      {sub.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push('/customer/subscriptions')}
              className="text-xs text-cyan-500 hover:text-cyan-400"
            >
              Manage subscriptions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
