import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { LoadingScreen, Screen, EmptyState } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FilterPills, type FilterOption } from '@/components/ui/FilterPills';
import { CustomerJobCard } from '@/components/customer/JobCard';
import { colors } from '@/lib/theme';

type JobStatus =
  | 'all'
  | 'OPEN'
  | 'PENDING'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

const FILTER_OPTIONS: FilterOption<JobStatus>[] = [
  { value: 'all', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function CustomerJobsListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<JobStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'customer'],
    queryFn: () => trpc.job.listForCustomer.query(),
  });

  const jobs = jobsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await jobsQuery.refetch();
    setRefreshing(false);
  };

  const filteredJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter((j: any) => j.status === filter);
  }, [jobs, filter]);

  const filterOptionsWithCounts = useMemo(
    () =>
      FILTER_OPTIONS.map((opt) => ({
        ...opt,
        count:
          opt.value === 'all'
            ? jobs.length
            : jobs.filter((j: any) => j.status === opt.value).length,
      })),
    [jobs],
  );

  if (jobsQuery.isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <View className="flex-1">
        <View className="px-5">
          <ScreenHeader title="Jobs" />
        </View>

        <View className="mt-4 mb-4">
          <FilterPills
            options={filterOptionsWithCounts}
            value={filter}
            onChange={setFilter}
          />
        </View>

        <FlatList
          data={filteredJobs}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <CustomerJobCard
              job={item}
              onPress={() => router.push(`/jobs/${item.id}`)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title={
                filter === 'all'
                  ? 'No jobs yet'
                  : `No ${filter.toLowerCase()} jobs`
              }
              body={
                filter === 'all'
                  ? 'Request a service to get started'
                  : 'Try changing the filter or request a new service'
              }
            />
          }
        />
      </View>

      <Pressable
        onPress={() => router.push('/jobs/new')}
        className="absolute right-6 bottom-6 justify-center items-center w-16 h-16 rounded-full border-2 shadow-lg border-brand-lime/30 bg-brand-lime active:opacity-80"
        style={{
          shadowColor: colors.lime,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </Screen>
  );
}
