import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { LoadingScreen, Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatTiles, type StatTile } from '@/components/ui/StatTiles';
import { PropertyCarousel } from '@/components/customer/PropertyCarousel';
import { ActivityFeedItem } from '@/components/customer/ActivityFeedItem';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/ui/Card';
import { colors } from '@/lib/theme';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => trpc.property.list.query(),
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'customer'],
    queryFn: () => trpc.job.listForCustomer.query(),
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', 'customer'],
    queryFn: () => trpc.subscription.listForCustomer.query(),
    retry: false,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'customer'],
    queryFn: () => trpc.payment.listForCustomer.query(),
    retry: false,
  });

  const properties = propertiesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      propertiesQuery.refetch(),
      jobsQuery.refetch(),
      subscriptionsQuery.refetch(),
      paymentsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const firstName = user?.customerProfile?.firstName || 'there';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Property summaries with job counts
  const propertySummaries = useMemo(() => {
    return properties.map((prop: any) => {
      const propertyJobs = jobs.filter((j: any) => j.property.id === prop.id);
      const completedJobs = propertyJobs.filter(
        (j: any) => j.status === 'COMPLETED',
      );
      return {
        id: prop.id,
        address: prop.address,
        city: prop.city,
        state: prop.state,
        zip: prop.zip,
        imageUrl: prop.imageUrl,
        jobCount: propertyJobs.length,
        completedCount: completedJobs.length,
      };
    });
  }, [properties, jobs]);

  // Stats calculations
  const activeJobs = useMemo(
    () =>
      jobs.filter((j: any) =>
        ['PENDING', 'SCHEDULED', 'IN_PROGRESS'].includes(j.status),
      ).length,
    [jobs],
  );

  const bidsToReview = useMemo(
    () =>
      jobs
        .filter((j: any) => j.status === 'OPEN')
        .reduce((total: number, job: any) => {
          const pendingBids =
            job.bids?.filter((b: any) => b.status === 'PENDING').length || 0;
          return total + pendingBids;
        }, 0),
    [jobs],
  );

  const activePlans = useMemo(
    () => subscriptions.filter((s: any) => s.status === 'ACTIVE').length,
    [subscriptions],
  );

  const spentThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cents = payments
      .filter(
        (p: any) =>
          p.status === 'SUCCEEDED' && new Date(p.createdAt) >= monthStart,
      )
      .reduce((total: number, p: any) => total + p.amountCents, 0);
    return (cents / 100).toFixed(0);
  }, [payments]);

  // Activity feed
  const activityItems = useMemo(() => {
    const items: any[] = [];

    jobs.forEach((j: any) => {
      if (j.status === 'OPEN') {
        const bidCount =
          j.bids?.filter((b: any) => b.status === 'PENDING').length || 0;
        items.push({
          id: `job-open-${j.id}`,
          jobId: j.id,
          icon: 'briefcase-outline',
          iconColor: colors.lime,
          title: `Job requested: ${j.service.name}`,
          subtitle:
            bidCount > 0
              ? `${bidCount} bid${bidCount > 1 ? 's' : ''} received`
              : 'Waiting for bids',
          time: timeAgo(j.createdAt),
          date: new Date(j.createdAt),
        });
      } else if (j.status === 'COMPLETED' && j.completedAt) {
        items.push({
          id: `job-done-${j.id}`,
          jobId: j.id,
          icon: 'checkmark-circle',
          iconColor: '#10b981',
          title: `Completed: ${j.service.name}`,
          subtitle: j.property.address,
          time: timeAgo(j.completedAt),
          date: new Date(j.completedAt),
        });
      } else if (j.status === 'SCHEDULED' && j.scheduledDate) {
        items.push({
          id: `job-sched-${j.id}`,
          jobId: j.id,
          icon: 'time-outline',
          iconColor: '#60a5fa',
          title: `Scheduled: ${j.service.name}`,
          subtitle: new Date(j.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          time: timeAgo(j.createdAt),
          date: new Date(j.createdAt),
        });
      }
    });

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 6);
  }, [jobs]);

  const tiles: StatTile[] = [
    {
      id: 'active',
      label: 'Active jobs',
      value: activeJobs,
      icon: 'briefcase',
      tone: 'lime',
      onPress: () => router.push('/jobs'),
    },
    {
      id: 'bids',
      label: 'Bids to review',
      value: bidsToReview,
      icon: 'pricetag',
      tone: 'amber',
      onPress: () => router.push('/jobs'),
    },
    {
      id: 'properties',
      label: 'Properties',
      value: properties.length,
      icon: 'home',
      tone: 'blue',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'spend',
      label: 'Spent this month',
      value: `$${spentThisMonth}`,
      icon: 'wallet',
      tone: 'muted',
      onPress: () => router.push('/payments'),
    },
  ];

  if (propertiesQuery.isLoading || !user) return <LoadingScreen />;

  // First property onboarding
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
          <ScreenHeader
            eyebrow="Dashboard"
            title={
              <>
                {greeting}, <Text className="text-brand-lime">{firstName}</Text>
              </>
            }
            subtitle={new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          />

          <Card className="mt-6" tone="accent">
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
        <ScreenHeader
          eyebrow="Dashboard"
          title={
            <>
              {greeting}, <Text className="text-brand-lime">{firstName}</Text>
            </>
          }
          subtitle={new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        />

        {bidsToReview > 0 ? (
          <Card className="mt-4" tone="accent">
            <View className="flex-row gap-3 justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-bold text-white">
                  {bidsToReview} bid{bidsToReview > 1 ? 's' : ''} to review
                </Text>
                <Text className="mt-0.5 text-sm text-slate-300">
                  Review and accept bids to schedule your jobs
                </Text>
              </View>
              <PrimaryButton
                label="Review"
                icon="arrow-forward"
                onPress={() => router.push('/jobs')}
                variant="primary"
              />
            </View>
          </Card>
        ) : null}

        <View className="mt-6">
          <StatTiles tiles={tiles} />
        </View>

        <View className="mt-6">
          <PropertyCarousel
            properties={propertySummaries}
            onRequestService={(propertyId) =>
              router.push({
                pathname: '/jobs/new',
                params: { propertyId },
              })
            }
          />
        </View>

        {activityItems.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Recent Activity
            </Text>
            <View className="gap-2">
              {activityItems.map((item) => (
                <ActivityFeedItem
                  key={item.id}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  title={item.title}
                  subtitle={item.subtitle}
                  time={item.time}
                  onPress={() => router.push(`/jobs/${item.jobId}`)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-6">
          <PrimaryButton
            label="Request a service"
            icon="add-circle"
            onPress={() => router.push('/jobs/new')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}
