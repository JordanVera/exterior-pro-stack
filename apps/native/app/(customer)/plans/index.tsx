import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { LoadingScreen, Screen, EmptyState } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PlanCard } from '@/components/customer/PlanCard';

export default function PlansListScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const plansQuery = useQuery({
    queryKey: ['plans'],
    queryFn: () => trpc.subscription.listPlans.query(),
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', 'customer'],
    queryFn: () => trpc.subscription.listForCustomer.query(),
    retry: false,
  });

  const plans = plansQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([plansQuery.refetch(), subscriptionsQuery.refetch()]);
    setRefreshing(false);
  };

  const subscribedPlanIds = useMemo(
    () =>
      new Set(
        subscriptions
          .filter((s: any) => s.status === 'ACTIVE')
          .map((s: any) => s.plan.id),
      ),
    [subscriptions],
  );

  if (plansQuery.isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <View className="flex-1">
        <View className="px-5">
          <ScreenHeader title="Plans" />
        </View>

        <FlatList
          data={plans}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              onPress={() => router.push(`/plans/${item.id}`)}
              isSubscribed={subscribedPlanIds.has(item.id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No plans available"
              body="Check back later for subscription plans"
            />
          }
        />
      </View>
    </Screen>
  );
}
