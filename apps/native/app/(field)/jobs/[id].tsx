import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/query";
import {
  formatAddress,
  formatJobDateTime,
  nextDays,
  TIME_PRESETS,
} from "@/lib/utils";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState, LoadingScreen, Screen } from "@/components/Screen";
import {
  JobPhotos,
  hasBeforeAndAfterPhotos,
} from "@/components/JobPhotos";

function invalidateJobs() {
  return queryClient.invalidateQueries({ queryKey: ["jobs"] });
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const isProvider = user?.role === "PROVIDER";
  const [assignOpen, setAssignOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(nextDays(1)[0]?.iso ?? "");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const jobQuery = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => trpc.job.getById.query({ jobId: id }),
    enabled: Boolean(id),
  });

  const crewsQuery = useQuery({
    queryKey: ["crews"],
    queryFn: () => trpc.crew.list.query(),
    enabled: isProvider && assignOpen,
  });

  const statusMutation = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED") =>
      trpc.job.updateStatus.mutate({ jobId: id, status }),
    onSuccess: () => invalidateJobs(),
  });

  const assignMutation = useMutation({
    mutationFn: (crewId: string) =>
      trpc.job.assignCrew.mutate({ jobId: id, crewId }),
    onSuccess: async () => {
      await invalidateJobs();
      setAssignOpen(false);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      trpc.job.schedule.mutate({
        jobId: id,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime,
      }),
    onSuccess: () => invalidateJobs(),
  });

  if (jobQuery.isLoading) return <LoadingScreen />;

  const job = jobQuery.data;
  if (!job) {
    return (
      <Screen>
        <View className="px-5 pt-6">
          <EmptyState
            title="Job not found"
            body="This job may have been removed or is not assigned to you."
          />
        </View>
      </Screen>
    );
  }

  const address = formatAddress(job.property);
  const customerPhone = job.property.customer.user.phone;
  const customerName = `${job.property.customer.firstName} ${job.property.customer.lastName}`;
  const assigned = job.assignments.map((a) => a.crew.name).join(", ");
  const canComplete = hasBeforeAndAfterPhotos(job.photos ?? []);

  const openMaps = () => {
    const q = encodeURIComponent(address);
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${q}`
        : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    Linking.openURL(url);
  };

  const callCustomer = () => {
    if (!customerPhone) {
      Alert.alert("No phone number", "This customer has no phone on file.");
      return;
    }
    Linking.openURL(`tel:${customerPhone}`);
  };

  const runStatus = (status: "IN_PROGRESS" | "COMPLETED") => {
    statusMutation.mutate(status, {
      onError: (err) =>
        Alert.alert("Could not update job", err instanceof Error ? err.message : "Try again"),
    });
  };

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10 pt-2">
        <View className="mb-4 flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-2xl font-bold text-white">
            {job.service.name}
          </Text>
          <StatusBadge status={job.status} />
        </View>

        <Text className="text-base text-slate-300">
          {job.scheduledDate
            ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
            : "Not scheduled yet"}
        </Text>
        <Text className="mt-2 text-base leading-6 text-white">{address}</Text>
        <Text className="mt-1 text-sm text-slate-400">{customerName}</Text>
        {assigned ? (
          <Text className="mt-2 text-sm text-brand-lime">Crew: {assigned}</Text>
        ) : (
          <Text className="mt-2 text-sm text-amber-400">No crew assigned</Text>
        )}

        {job.customerNotes ? (
          <View className="mt-4 rounded-2xl border border-white/10 bg-navy-800 p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer notes
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-200">
              {job.customerNotes}
            </Text>
          </View>
        ) : null}

        {job.property.notes ? (
          <View className="mt-3 rounded-2xl border border-white/10 bg-navy-800 p-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Property notes
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-200">
              {job.property.notes}
            </Text>
          </View>
        ) : null}

        <View className="mt-6 gap-3">
          <PrimaryButton label="Navigate" onPress={openMaps} variant="secondary" />
          <PrimaryButton
            label={customerPhone ? "Call customer" : "No customer phone"}
            onPress={callCustomer}
            variant="secondary"
            disabled={!customerPhone}
          />
        </View>

        {isProvider && job.status === "PENDING" ? (
          <View className="mt-8">
            <Text className="mb-3 text-lg font-semibold text-white">Schedule</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {nextDays(7).map((day) => (
                <Pressable
                  key={day.iso}
                  onPress={() => setScheduleDate(day.iso)}
                  className={`mr-2 rounded-2xl px-4 py-3 ${scheduleDate === day.iso ? "bg-brand-lime" : "bg-navy-700"}`}
                >
                  <Text
                    className={`text-sm font-semibold ${scheduleDate === day.iso ? "text-brand-ink" : "text-white"}`}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {TIME_PRESETS.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setScheduleTime(time)}
                  className={`rounded-full px-4 py-2 ${scheduleTime === time ? "bg-brand-lime" : "bg-navy-700"}`}
                >
                  <Text
                    className={`font-semibold ${scheduleTime === time ? "text-brand-ink" : "text-white"}`}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton
              label="Save schedule"
              onPress={() =>
                scheduleMutation.mutate(undefined, {
                  onError: (err) =>
                    Alert.alert(
                      "Could not schedule",
                      err instanceof Error ? err.message : "Try again",
                    ),
                })
              }
              loading={scheduleMutation.isPending}
            />
          </View>
        ) : null}

        {isProvider ? (
          <View className="mt-6">
            <PrimaryButton
              label="Assign crew"
              onPress={() => setAssignOpen(true)}
              variant="secondary"
            />
          </View>
        ) : null}

        <JobPhotos job={job} token={token} />

        <View className="mt-8 gap-3">
          {job.status === "SCHEDULED" || job.status === "PENDING" ? (
            <PrimaryButton
              label="Start job"
              onPress={() => runStatus("IN_PROGRESS")}
              loading={statusMutation.isPending}
            />
          ) : null}
          {job.status === "IN_PROGRESS" || job.status === "SCHEDULED" ? (
            <>
              <PrimaryButton
                label="Mark complete"
                onPress={() => runStatus("COMPLETED")}
                loading={statusMutation.isPending}
                disabled={!canComplete}
              />
              {!canComplete ? (
                <Text className="text-center text-sm text-amber-400">
                  Add before and after photos to complete
                </Text>
              ) : null}
            </>
          ) : null}
          {job.status === "COMPLETED" ? (
            <Text className="text-center text-base text-green-400">
              This job is complete.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={assignOpen} animationType="slide" transparent>
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setAssignOpen(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-3xl bg-navy-800 px-5 pb-10 pt-4">
            <Text className="mb-4 text-xl font-bold text-white">Assign a crew</Text>
            {(crewsQuery.data ?? []).map((crew) => (
              <Pressable
                key={crew.id}
                onPress={() =>
                  assignMutation.mutate(crew.id, {
                    onError: (err) =>
                      Alert.alert(
                        "Could not assign",
                        err instanceof Error ? err.message : "Try again",
                      ),
                  })
                }
                className="mb-2 rounded-2xl border border-white/10 bg-navy-700 px-4 py-4"
              >
                <Text className="text-lg font-semibold text-white">{crew.name}</Text>
                <Text className="text-sm text-slate-400">
                  {crew.members.length} member{crew.members.length === 1 ? "" : "s"}
                </Text>
              </Pressable>
            ))}
            {crewsQuery.data?.length === 0 ? (
              <Text className="text-base text-slate-400">
                Create a crew on the web portal first.
              </Text>
            ) : null}
            <View className="mt-4">
              <PrimaryButton
                label="Close"
                onPress={() => setAssignOpen(false)}
                variant="secondary"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
