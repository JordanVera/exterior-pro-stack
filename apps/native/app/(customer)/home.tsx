import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { LoadingScreen, Screen } from '@/components/Screen';
import { HomeHeader } from '@/components/customer/HomeHeader';
import { SearchBar } from '@/components/customer/SearchBar';
import { CategoryTiles } from '@/components/customer/CategoryTiles';
import { AccordionSection } from '@/components/customer/AccordionSection';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/ui/Card';
import { colors } from '@/lib/theme';
import { formatJobDate, STATUS_BADGE } from '@/lib/utils';

const ACTIVE_STATUSES = ['OPEN', 'PENDING', 'SCHEDULED', 'IN_PROGRESS'] as const;
const STATUS_PRIORITY: Record<string, number> = {
  IN_PROGRESS: 0,
  SCHEDULED: 1,
  PENDING: 2,
  OPEN: 3,
};

type HomeSection = 'active' | 'bids' | 'properties';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [openSection, setOpenSection] = useState<HomeSection | 'none'>();

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => trpc.property.list.query(),
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'customer'],
    queryFn: () => trpc.job.listForCustomer.query(),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => trpc.service.listCategories.query(),
  });

  const properties = propertiesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      propertiesQuery.refetch(),
      jobsQuery.refetch(),
      categoriesQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const firstName = user?.customerProfile?.firstName ?? '';
  const lastName = user?.customerProfile?.lastName ?? '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'there';

  const activeJobs = useMemo(
    () =>
      jobs
        .filter((job: any) =>
          (ACTIVE_STATUSES as readonly string[]).includes(job.status),
        )
        .sort(
          (a: any, b: any) =>
            (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9),
        ),
    [jobs],
  );

  const jobsWithBids = useMemo(
    () =>
      jobs.filter(
        (job: any) =>
          job.status === 'OPEN' &&
          job.bids?.some((bid: any) => bid.status === 'PENDING'),
      ),
    [jobs],
  );

  const bidsToReview = useMemo(
    () =>
      jobsWithBids.reduce((total: number, job: any) => {
        const pending =
          job.bids?.filter((bid: any) => bid.status === 'PENDING').length || 0;
        return total + pending;
      }, 0),
    [jobsWithBids],
  );

  const featuredJob = activeJobs[0];
  const resolvedSection: HomeSection | null =
    openSection === 'none'
      ? null
      : (openSection ?? (activeJobs.length > 0 ? 'active' : 'properties'));

  const toggleSection = (section: HomeSection) => {
    setOpenSection(resolvedSection === section ? 'none' : section);
  };

  const goToNewJob = (params?: { categoryId?: string; propertyId?: string }) => {
    if (params) {
      router.push({ pathname: '/jobs/new', params });
      return;
    }
    router.push('/jobs/new');
  };

  if (propertiesQuery.isLoading || !user) return <LoadingScreen />;

  if (properties.length === 0) {
    return (
      <Screen>
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-20"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <HomeHeader
            name={displayName}
            onAvatarPress={() => router.push('/settings')}
          />
          <Card className="mt-8" tone="accent">
            <Text className="text-xl font-bold text-white">
              Add your first property
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-300">
              Before requesting service, we need to know where to send crews.
              Add your home or business address to get started.
            </Text>
            <View className="mt-4">
              <PrimaryButton
                label="Add property"
                icon="add-circle"
                onPress={() => router.push('/settings')}
              />
            </View>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HomeHeader
          name={displayName}
          onAvatarPress={() => router.push('/settings')}
        />

        <View className="mt-6">
          <SearchBar onSubmit={() => goToNewJob()} />
        </View>

        {categories.length > 0 ? (
          <View className="mt-8">
            <Text className="mb-4 text-lg font-semibold text-white">
              Services
            </Text>
            <CategoryTiles
              categories={categories}
              onSelect={(categoryId) => goToNewJob({ categoryId })}
            />
          </View>
        ) : null}

        <View className="mt-8 gap-3">
          <AccordionSection
            title="Active jobs"
            count={activeJobs.length}
            expanded={resolvedSection === 'active'}
            onToggle={() => toggleSection('active')}
          >
            {featuredJob ? (
              <FeaturedJobCard
                job={featuredJob}
                onPress={() => router.push(`/jobs/${featuredJob.id}`)}
              />
            ) : (
              <Text className="text-sm text-slate-400">
                No active jobs right now.
              </Text>
            )}
            {activeJobs.length > 1 ? (
              <Pressable
                onPress={() => router.push('/jobs')}
                className="flex-row justify-between items-center pt-4 mt-4 border-t border-line active:opacity-70"
              >
                <Text className="text-sm font-semibold text-brand-lime">
                  View all {activeJobs.length} jobs
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.lime}
                />
              </Pressable>
            ) : null}
          </AccordionSection>

          <AccordionSection
            title="Bids to review"
            count={bidsToReview}
            expanded={resolvedSection === 'bids'}
            onToggle={() => toggleSection('bids')}
          >
            {jobsWithBids.length > 0 ? (
              <View className="gap-3">
                {jobsWithBids.map((job: any) => {
                  const pending =
                    job.bids?.filter((bid: any) => bid.status === 'PENDING')
                      .length || 0;
                  return (
                    <Pressable
                      key={job.id}
                      onPress={() => router.push(`/jobs/${job.id}`)}
                      className="active:opacity-70"
                    >
                      <Text className="text-base font-semibold text-white">
                        {job.service.name}
                      </Text>
                      <Text className="mt-0.5 text-sm text-slate-400">
                        {pending} bid{pending === 1 ? '' : 's'} ·{' '}
                        {job.property.address}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text className="text-sm text-slate-400">
                No bids waiting for review.
              </Text>
            )}
          </AccordionSection>

          <AccordionSection
            title="Properties"
            count={properties.length}
            expanded={resolvedSection === 'properties'}
            onToggle={() => toggleSection('properties')}
          >
            <View className="gap-3">
              {properties.map((property: any) => (
                <Pressable
                  key={property.id}
                  onPress={() => goToNewJob({ propertyId: property.id })}
                  className="flex-row gap-3 items-center active:opacity-70"
                >
                  <View className="justify-center items-center w-10 h-10 rounded-xl bg-white/10">
                    <Ionicons name="home-outline" size={18} color={colors.lime} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      {property.address}
                    </Text>
                    <Text className="mt-0.5 text-sm text-slate-400">
                      {property.city}, {property.state} {property.zip}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.lime}
                  />
                </Pressable>
              ))}
            </View>
          </AccordionSection>
        </View>
      </ScrollView>
    </Screen>
  );
}

function FeaturedJobCard({
  job,
  onPress,
}: {
  job: any;
  onPress: () => void;
}) {
  const pendingBids =
    job.bids?.filter((bid: any) => bid.status === 'PENDING').length || 0;
  const leftStat =
    pendingBids > 0
      ? `${pendingBids} bid${pendingBids === 1 ? '' : 's'} received`
      : job.status === 'OPEN'
        ? 'Waiting for bids'
        : (STATUS_BADGE[job.status]?.label ?? job.status);
  const rightStat = job.scheduledDate
    ? formatJobDate(job.scheduledDate)
    : job.property.address;

  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Text className="text-sm text-slate-400">{job.property.address}</Text>
      <Text className="mt-1 text-lg font-semibold text-white">
        {job.service.name}
      </Text>
      <View className="flex-row gap-2 mt-3">
        <View className="flex-1 p-3 rounded-xl bg-teal-400">
          <Text className="text-sm font-semibold text-white">{leftStat}</Text>
        </View>
        <View className="flex-1 p-3 rounded-xl bg-brand-lime">
          <Text className="text-sm font-semibold text-brand-ink">{rightStat}</Text>
        </View>
      </View>
    </Pressable>
  );
}
