import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import type { FieldJobListItem } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { EmptyState, LoadingScreen, Screen } from "@/components/Screen";
import { FilterPills, ScreenHeader, type FilterOption } from "@/components/ui";

type Filter = "all" | "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Needs schedule" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: "No jobs yet",
    body: "Accepted jobs appear here once a customer picks your bid.",
  },
  PENDING: {
    title: "Nothing to schedule",
    body: "Every job has a date on it. Nice work.",
  },
  SCHEDULED: {
    title: "Nothing scheduled",
    body: "Schedule a pending job to see it here.",
  },
  IN_PROGRESS: {
    title: "Nothing in progress",
    body: "Start a job from its detail screen and it will show up here.",
  },
  COMPLETED: {
    title: "No completed jobs",
    body: "Finished work lands here as a running history.",
  },
};

export default function JobsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetching every job once and filtering on device keeps pill switching
  // instant and gives us completed history without a second endpoint.
  const jobsQuery = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => trpc.job.listMine.query({ view: "all" }),
  });

  const jobs = useMemo<FieldJobListItem[]>(
    () => jobsQuery.data ?? [],
    [jobsQuery.data],
  );

  const options = useMemo<FilterOption<Filter>[]>(
    () =>
      FILTERS.map((option) => ({
        ...option,
        count:
          option.value === "all"
            ? jobs.length
            : jobs.filter((job) => job.status === option.value).length,
      })),
    [jobs],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? jobs.filter((job) => job.status !== "CANCELLED")
        : jobs.filter((job) => job.status === filter),
    [jobs, filter],
  );

  if (jobsQuery.isLoading) return <LoadingScreen />;

  const refresh = async () => {
    setRefreshing(true);
    await jobsQuery.refetch();
    setRefreshing(false);
  };

  const empty = EMPTY_COPY[filter];

  return (
    <Screen>
      <View className="px-5 pt-2">
        <ScreenHeader
          eyebrow="Field"
          title="Jobs"
          subtitle={
            user?.role === "CREW"
              ? "Work assigned to your crew, past and upcoming."
              : "Everything you have won, from unscheduled to complete."
          }
        />
      </View>

      {/* Full-bleed so the pill row can scroll past the screen edge. */}
      <View className="mt-5">
        <FilterPills options={options} value={filter} onChange={setFilter} />
      </View>

      <ScrollView
        className="mt-5 flex-1 px-5"
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.lime}
            colors={[colors.lime]}
          />
        }
      >
        {visible.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title={empty.title}
            body={
              filter === "all" && user?.role === "CREW"
                ? "Ask your owner to add your phone to a crew and assign work."
                : empty.body
            }
            actionLabel={filter === "all" ? undefined : "Show all jobs"}
            onAction={filter === "all" ? undefined : () => setFilter("all")}
          />
        ) : (
          <>
            <Text className="mb-3 text-sm text-slate-400">
              {visible.length} {visible.length === 1 ? "job" : "jobs"}
            </Text>
            {visible.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/jobs/${job.id}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
