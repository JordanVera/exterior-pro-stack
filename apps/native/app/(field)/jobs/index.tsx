import { ScrollView, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { JobCard } from '@/components/JobCard';
import { EmptyState, LoadingScreen, Screen } from '@/components/Screen';

export default function JobsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const jobsQuery = useQuery({
    queryKey: ['jobs', 'active'],
    queryFn: () => trpc.job.listMine.query({ view: 'active' }),
  });

  if (jobsQuery.isLoading) return <LoadingScreen />;

  const jobs = jobsQuery.data ?? [];

  return (
    <Screen>
      <ScrollView className="flex-1 px-5 pt-2" contentContainerClassName="pb-8">
        <Text className="text-sm font-semibold tracking-widest uppercase text-brand-lime">
          Field
        </Text>
        <Text className="mt-1 text-3xl font-bold text-white">Jobs</Text>
        <Text className="mt-2 mb-6 text-base text-slate-400">
          {user?.role === 'CREW'
            ? 'Upcoming and in-progress work for your crew.'
            : 'Pending, scheduled, and in-progress jobs.'}
        </Text>
        {jobs.length === 0 ? (
          <EmptyState
            title="No active jobs"
            body={
              user?.role === 'CREW'
                ? 'Ask your owner to add your phone to a crew and assign work.'
                : 'Accepted jobs will appear here after a customer picks your bid.'
            }
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push(`/jobs/${job.id}`)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
