import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { LoadingScreen, Screen, EmptyState } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { RatingSummary } from '@/components/StarRating';
import { ReviewList } from '@/components/ReviewList';
import { colors } from '@/lib/theme';

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['provider', id],
    queryFn: () => trpc.provider.getById.query({ id: id! }),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <LoadingScreen />;

  const provider = query.data;
  if (!provider) {
    return (
      <Screen>
        <View className="flex-1 px-5">
          <Pressable onPress={() => router.back()} className="mb-4 active:opacity-70">
            <View className="flex-row gap-2 items-center">
              <Ionicons name="arrow-back" size={22} color={colors.lime} />
              <Text className="text-base font-semibold text-brand-lime">Back</Text>
            </View>
          </Pressable>
          <EmptyState
            icon="business-outline"
            title="Provider not found"
            body="This profile may have been removed."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-20"
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
          />
        }
      >
        <Pressable onPress={() => router.back()} className="mb-4 active:opacity-70">
          <View className="flex-row gap-2 items-center">
            <Ionicons name="arrow-back" size={22} color={colors.lime} />
            <Text className="text-base font-semibold text-brand-lime">Back</Text>
          </View>
        </Pressable>

        <Card>
          <Text className="text-2xl font-bold text-white">
            {provider.businessName}
          </Text>
          <View className="mt-2">
            <RatingSummary
              average={provider.rating.average}
              count={provider.rating.count}
            />
          </View>
          {provider.description ? (
            <Text className="mt-3 text-sm leading-5 text-slate-300">
              {provider.description}
            </Text>
          ) : null}
        </Card>

        {provider.services.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-white">
              Services
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {provider.services.map((item) => (
                <View
                  key={item.id}
                  className="rounded-full border border-line bg-surface-raised px-3 py-1.5"
                >
                  <Text className="text-sm text-slate-200">
                    {item.service.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-6">
          <Text className="mb-3 text-lg font-semibold text-white">
            Reviews{provider.reviews.length ? ` (${provider.reviews.length})` : ''}
          </Text>
          <ReviewList reviews={provider.reviews} />
        </View>
      </ScrollView>
    </Screen>
  );
}
