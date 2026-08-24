import { useState, useMemo } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { queryClient } from '@/lib/query';
import { LoadingScreen, Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card, PressableCard } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/lib/theme';
import { usePlanPaymentSheet } from '@/lib/stripe';

type BillingFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [frequency, setFrequency] = useState<BillingFrequency>('MONTHLY');
  const [subscribing, setSubscribing] = useState(false);
  const presentPlanPaymentSheet = usePlanPaymentSheet();

  const planQuery = useQuery({
    queryKey: ['plan', id],
    queryFn: () => trpc.subscription.getPlan.query({ planId: id! }),
    enabled: !!id,
  });

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => trpc.property.list.query(),
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', 'customer'],
    queryFn: () => trpc.subscription.listForCustomer.query(),
    retry: false,
  });

  const plan = planQuery.data;
  const properties = propertiesQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      planQuery.refetch(),
      propertiesQuery.refetch(),
      subscriptionsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const existingSubscription = useMemo(
    () =>
      subscriptions.find((s: any) => s.plan.id === id && s.status === 'ACTIVE'),
    [subscriptions, id],
  );

  const handleSubscribe = async () => {
    if (!selectedPropertyId) {
      Alert.alert('Select Property', 'Please select a property for this plan.');
      return;
    }

    setSubscribing(true);
    try {
      const result = await presentPlanPaymentSheet({
        planId: id!,
        propertyId: selectedPropertyId,
        billingFrequency: frequency,
      });
      if (result.status === 'canceled') return;
      queryClient.invalidateQueries({
        queryKey: ['subscriptions', 'customer'],
      });
      Alert.alert(
        'Subscribed',
        "You're all set. Recurring visits are on the way.",
      );
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Unable to start checkout.');
    } finally {
      setSubscribing(false);
    }
  };

  if (planQuery.isLoading || !plan) return <LoadingScreen />;

  const prices = {
    MONTHLY: plan.monthlyPriceCents / 100,
    QUARTERLY: plan.quarterlyPriceCents / 100,
    ANNUALLY: plan.annualPriceCents / 100,
  };

  const selectedProperty = properties.find(
    (p: any) => p.id === selectedPropertyId,
  );

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable
          onPress={() => router.back()}
          className="mb-4 active:opacity-70"
        >
          <View className="flex-row gap-2 items-center">
            <Ionicons name="arrow-back" size={22} color={colors.lime} />
            <Text className="text-base font-semibold text-brand-lime">
              Back to plans
            </Text>
          </View>
        </Pressable>

        <ScreenHeader title={plan.name} />

        {existingSubscription ? (
          <Card className="mt-4" tone="accent">
            <View className="flex-row gap-2 items-center">
              <Ionicons name="checkmark-circle" size={24} color={colors.lime} />
              <Text className="flex-1 text-base font-bold text-white">
                You're subscribed to this plan
              </Text>
            </View>
            <Text className="mt-2 text-sm text-slate-300">
              Manage your subscription in Settings or view billing history in
              Payments.
            </Text>
          </Card>
        ) : null}

        <Card className="mt-4">
          <Text className="mb-3 text-lg font-semibold text-white">
            Details
          </Text>
          {plan.description ? (
            <Text className="mb-4 text-base leading-6 text-slate-300">
              {plan.description}
            </Text>
          ) : null}

          <Text className="mb-2 text-sm font-semibold text-slate-400">
            Included Services
          </Text>
          <View className="gap-2">
            {plan.services.map((ps: any) => (
              <View key={ps.id} className="flex-row gap-2 items-center">
                <Ionicons name="checkmark" size={18} color={colors.lime} />
                <Text className="flex-1 text-sm text-slate-200">
                  {ps.service.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {!existingSubscription ? (
          <>
            <Card className="mt-4">
              <Text className="mb-3 text-lg font-semibold text-white">
                Billing
              </Text>
              <View className="gap-2">
                {[
                  { value: 'MONTHLY', label: 'Monthly', savings: null },
                  {
                    value: 'QUARTERLY',
                    label: 'Quarterly',
                    savings: 'Save 5%',
                  },
                  { value: 'ANNUALLY', label: 'Annual', savings: 'Save 10%' },
                ].map((option) => (
                  <PressableCard
                    key={option.value}
                    onPress={() =>
                      setFrequency(option.value as BillingFrequency)
                    }
                    tone={frequency === option.value ? 'accent' : 'default'}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-white">
                          {option.label}
                        </Text>
                        {option.savings ? (
                          <Text className="mt-0.5 text-sm text-brand-lime">
                            {option.savings}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="text-xl font-bold text-white">
                        ${prices[option.value as BillingFrequency].toFixed(0)}
                      </Text>
                    </View>
                  </PressableCard>
                ))}
              </View>
            </Card>

            <Card className="mt-4">
              <Text className="mb-3 text-lg font-semibold text-white">
                Property
              </Text>
              {properties.length === 0 ? (
                <>
                  <Text className="mb-3 text-sm text-slate-400">
                    Add a property before subscribing.
                  </Text>
                  <PrimaryButton
                    label="Add Property"
                    icon="add-circle"
                    onPress={() => router.push('/settings')}
                  />
                </>
              ) : (
                <View className="gap-2">
                  {properties.map((property: any) => (
                    <PressableCard
                      key={property.id}
                      onPress={() => setSelectedPropertyId(property.id)}
                      tone={
                        selectedPropertyId === property.id
                          ? 'accent'
                          : 'default'
                      }
                    >
                      <View className="flex-row gap-3 items-center">
                        <Ionicons name="home" size={20} color={colors.lime} />
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-white">
                            {property.address}
                          </Text>
                          <Text className="mt-0.5 text-sm text-slate-400">
                            {property.city}, {property.state} {property.zip}
                          </Text>
                        </View>
                      </View>
                    </PressableCard>
                  ))}
                </View>
              )}
            </Card>

            {properties.length > 0 ? (
              <View className="mt-6">
                <PrimaryButton
                  label={`Subscribe for $${prices[frequency].toFixed(0)}`}
                  icon="checkmark-circle"
                  onPress={handleSubscribe}
                  loading={subscribing}
                  disabled={!selectedPropertyId}
                />
                <Text className="mt-3 text-xs text-center text-slate-400">
                  Pay securely in the app with Stripe
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
