import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { LoadingScreen, Screen, EmptyState } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FilterPills, type FilterOption } from '@/components/ui/FilterPills';
import { PaymentCard } from '@/components/customer/PaymentCard';
import { Card } from '@/components/ui/Card';
import { colors } from '@/lib/theme';

type PaymentFilter = 'all' | 'job' | 'subscription' | 'tip';

const FILTER_OPTIONS: FilterOption<PaymentFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'job', label: 'Jobs' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'tip', label: 'Tips' },
];

export default function PaymentsScreen() {
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'customer'],
    queryFn: () => trpc.payment.listForCustomer.query(),
    retry: false,
  });

  const payments = paymentsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await paymentsQuery.refetch();
    setRefreshing(false);
  };

  const filteredPayments = useMemo(() => {
    if (filter === 'all') return payments;
    if (filter === 'job')
      return payments.filter((p: any) => p.kind === 'JOB');
    if (filter === 'subscription')
      return payments.filter((p: any) => p.kind === 'SUBSCRIPTION');
    if (filter === 'tip') return payments.filter((p: any) => p.kind === 'TIP');
    return payments;
  }, [payments, filter]);

  const stats = useMemo(() => {
    const totalCents = payments
      .filter((p: any) => p.status === 'SUCCEEDED')
      .reduce((sum: number, p: any) => sum + p.amountCents, 0);

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const ytdCents = payments
      .filter(
        (p: any) =>
          p.status === 'SUCCEEDED' && new Date(p.createdAt) >= yearStart,
      )
      .reduce((sum: number, p: any) => sum + p.amountCents, 0);

    return {
      total: (totalCents / 100).toFixed(2),
      ytd: (ytdCents / 100).toFixed(2),
    };
  }, [payments]);

  const filterOptionsWithCounts = useMemo(
    () =>
      FILTER_OPTIONS.map((opt) => ({
        ...opt,
        count:
          opt.value === 'all'
            ? payments.length
            : opt.value === 'job'
              ? payments.filter((p: any) => p.kind === 'JOB').length
              : opt.value === 'subscription'
                ? payments.filter((p: any) => p.kind === 'SUBSCRIPTION').length
                : payments.filter((p: any) => p.kind === 'TIP').length,
      })),
    [payments],
  );

  if (paymentsQuery.isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <View className="flex-1">
        <View className="px-5">
          <ScreenHeader
            eyebrow="Payments"
            title="Payment History"
            subtitle="Receipts and billing history"
          />

          <View className="flex-row gap-3 mt-4">
            <Card className="flex-1">
              <Text className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Total Spent
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white">
                ${stats.total}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                This Year
              </Text>
              <Text className="mt-1 text-2xl font-bold text-brand-lime">
                ${stats.ytd}
              </Text>
            </Card>
          </View>
        </View>

        <View className="mt-6 mb-4">
          <FilterPills
            options={filterOptionsWithCounts}
            value={filter}
            onChange={setFilter}
          />
        </View>

        <FlatList
          data={filteredPayments}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="wallet-outline"
              title={
                filter === 'all' ? 'No payments yet' : `No ${filter} payments`
              }
              body={
                filter === 'all'
                  ? 'Your payment history will appear here'
                  : 'Try changing the filter to see other payments'
              }
            />
          }
        />
      </View>
    </Screen>
  );
}
