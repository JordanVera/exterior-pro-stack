import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import type { FieldJobListItem } from "@/lib/types";
import {
  formatAddress,
  formatJobDateTime,
  isToday,
  serviceIcon,
} from "@/lib/utils";
import { JobCard } from "@/components/JobCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingScreen, Screen } from "@/components/Screen";
import { TodayGlanceMap } from "@/components/TodayGlanceMap";
import {
  AccordionSection,
  Card,
  HomeHeader,
  IconButton,
  QuickTiles,
  type QuickTile,
} from "@/components/ui";

type Job = FieldJobListItem;

/** Jobs on today's plate: anything in progress, plus today's scheduled work. */
function todaysJobs(jobs: Job[]) {
  return jobs.filter(
    (job) =>
      job.status === "IN_PROGRESS" ||
      (job.status === "SCHEDULED" &&
        job.scheduledDate &&
        isToday(job.scheduledDate)),
  );
}

/** In-progress first, then the rest in clock order so the map and list agree. */
function sortTodaysRoute(jobs: Job[]) {
  return [...jobs].sort((a, b) => {
    if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
    if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
    return (a.scheduledTime ?? "99:99").localeCompare(
      b.scheduledTime ?? "99:99",
    );
  });
}

/** Scheduled work still ahead, excluding whatever is already on today's list. */
function upcomingCount(jobs: Job[]) {
  return jobs.filter(
    (job) =>
      job.status === "SCHEDULED" &&
      job.scheduledDate &&
      !isToday(job.scheduledDate) &&
      new Date(job.scheduledDate) > new Date(),
  ).length;
}

function completedThisWeek(jobs: Job[]) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return jobs.filter(
    (job) =>
      job.status === "COMPLETED" &&
      job.completedAt &&
      new Date(job.completedAt) >= weekAgo,
  ).length;
}

export default function TodayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isCrew = user?.role === "CREW";
  const [refreshing, setRefreshing] = useState(false);
  const [openSection, setOpenSection] = useState<"today" | "more" | "none">();

  // One `all` query powers both the stat band and the list; filtering happens
  // client-side so pulling to refresh updates every number at once.
  const jobsQuery = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => trpc.job.listMine.query({ view: "all" }),
  });

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const today = useMemo(() => sortTodaysRoute(todaysJobs(jobs)), [jobs]);

  const tiles = useMemo<QuickTile[]>(() => {
    const inProgress = jobs.filter((j) => j.status === "IN_PROGRESS").length;

    if (isCrew) {
      return [
        { id: "today", label: "On today", value: today.length },
        { id: "progress", label: "In progress", value: inProgress },
        {
          id: "upcoming",
          label: "Upcoming",
          value: upcomingCount(jobs),
          onPress: () => router.push("/jobs"),
        },
        { id: "done", label: "This week", value: completedThisWeek(jobs) },
      ];
    }

    return [
      { id: "today", label: "On today", value: today.length },
      {
        id: "unscheduled",
        label: "Unscheduled",
        value: jobs.filter((j) => j.status === "PENDING").length,
        onPress: () => router.push("/jobs"),
      },
      {
        id: "needs-crew",
        label: "Needs crew",
        value: jobs.filter(
          (j) =>
            j.assignments.length === 0 &&
            (j.status === "PENDING" || j.status === "SCHEDULED"),
        ).length,
        onPress: () => router.push("/jobs"),
      },
      { id: "progress", label: "In progress", value: inProgress },
    ];
  }, [isCrew, jobs, today.length, router]);

  if (jobsQuery.isLoading) return <LoadingScreen />;

  const displayName = isCrew
    ? user?.crewMember?.name || "there"
    : user?.providerProfile?.businessName || "there";

  // In-progress work outranks the next scheduled slot — that's what someone is
  // standing in front of right now.
  const upNext =
    today.find((job) => job.status === "IN_PROGRESS") ?? today[0] ?? null;
  const rest = today.filter((job) => job.id !== upNext?.id);

  const refresh = async () => {
    setRefreshing(true);
    await jobsQuery.refetch();
    setRefreshing(false);
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5 pt-2"
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
        <HomeHeader
          name={displayName}
          onAvatarPress={() => router.push("/settings")}
        />

        <View className="mt-6">
          <QuickTiles tiles={tiles} />
        </View>

        {isCrew ? (
          <TodayGlanceMap
            jobs={today}
            onSelectJob={(jobId) => router.push(`/jobs/${jobId}`)}
          />
        ) : null}

        <View className="mt-8 gap-3">
          <AccordionSection
            title="On today"
            count={today.length}
            expanded={(openSection ?? "today") === "today"}
            onToggle={() =>
              setOpenSection(
                (openSection ?? "today") === "today" ? "none" : "today",
              )
            }
          >
            {upNext ? (
              <UpNextCard
                job={upNext}
                onOpen={() => router.push(`/jobs/${upNext.id}`)}
              />
            ) : (
              <View>
                <Text className="text-sm text-slate-400">
                  {isCrew
                    ? "When your owner assigns work to your crew, it will show up here."
                    : "Schedule a job or assign a crew from the Jobs tab."}
                </Text>
                {isCrew ? null : (
                  <Pressable
                    onPress={() => router.push("/jobs")}
                    className="mt-3 active:opacity-70"
                  >
                    <Text className="text-sm font-semibold text-brand-lime">
                      Go to jobs
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </AccordionSection>

          <AccordionSection
            title="Also today"
            count={rest.length}
            expanded={openSection === "more"}
            onToggle={() =>
              setOpenSection(openSection === "more" ? "none" : "more")
            }
          >
            {rest.length > 0 ? (
              rest.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => router.push(`/jobs/${job.id}`)}
                />
              ))
            ) : (
              <Text className="text-sm text-slate-400">
                Nothing else on the board today.
              </Text>
            )}
          </AccordionSection>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Hero treatment for the job that needs attention first, with inline navigation. */
function UpNextCard({ job, onOpen }: { job: Job; onOpen: () => void }) {
  const address = formatAddress(job.property);
  const crew = job.assignments[0]?.crew.name;

  const navigate = () => {
    const q = encodeURIComponent(address);
    Linking.openURL(
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${q}`
        : `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    );
  };

  return (
    <Card tone="accent">
      <Pressable onPress={onOpen} className="active:opacity-80">
        <View className="flex-row gap-3 justify-between items-start">
          <View className="flex-row flex-1 gap-3 items-center">
            <View className="justify-center items-center w-11 h-11 rounded-2xl bg-brand-lime/20">
              <Ionicons
                name={serviceIcon(job.service.name)}
                size={22}
                color={colors.lime}
              />
            </View>
            <Text className="flex-1 text-xl font-bold text-white">
              {job.service.name}
            </Text>
          </View>
          <StatusBadge status={job.status} size="sm" />
        </View>

        <Text className="mt-4 text-lg font-semibold text-white">
          {job.scheduledDate
            ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
            : "Not scheduled"}
        </Text>
        <Text className="mt-1 text-[15px] leading-6 text-slate-300">
          {address}
        </Text>
        {crew ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={14} color={colors.lime} />
            <Text className="text-sm font-medium text-brand-lime">{crew}</Text>
          </View>
        ) : null}
      </Pressable>

      <View className="flex-row gap-3 mt-5">
        <IconButton
          icon="navigate-outline"
          label="Navigate"
          onPress={navigate}
          tone="accent"
          className="flex-1"
        />
        <IconButton
          icon="arrow-forward"
          label="Open job"
          onPress={onOpen}
          className="flex-1"
        />
      </View>
    </Card>
  );
}
