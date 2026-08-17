import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { getDateString, getGreeting } from "@/lib/utils";
import { JobCard } from "@/components/JobCard";
import { EmptyState, LoadingScreen, Screen } from "@/components/Screen";

export default function TodayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const jobsQuery = useQuery({
    queryKey: ["jobs", "today"],
    queryFn: () => trpc.job.listMine.query({ view: "today" }),
  });

  const name =
    user?.role === "CREW"
      ? user.crewMember?.name?.split(" ")[0]
      : user?.providerProfile?.businessName;

  if (jobsQuery.isLoading) return <LoadingScreen />;

  const jobs = jobsQuery.data ?? [];

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerClassName="pb-8"
      >
        <Text className="text-sm font-semibold uppercase tracking-widest text-brand-lime">
          Today
        </Text>
        <Text className="mt-1 text-sm text-slate-400">{getDateString()}</Text>
        <Text className="mt-1 text-3xl font-bold text-white">
          {getGreeting()}
          {name ? `, ${name}` : ""}
        </Text>
        <Text className="mt-2 text-base text-slate-400">
          {user?.role === "CREW"
            ? "Jobs assigned to your crew today."
            : "Jobs on the schedule today."}
        </Text>

        <View className="mt-6">
          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs today"
              body={
                user?.role === "CREW"
                  ? "When your owner assigns work to your crew, it will show up here."
                  : "Schedule a job or assign a crew from the Jobs tab."
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
        </View>
      </ScrollView>
    </Screen>
  );
}
