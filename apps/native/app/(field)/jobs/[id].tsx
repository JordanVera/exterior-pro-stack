import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { queryClient } from '@/lib/query';
import { colors } from '@/lib/theme';
import type { FieldJob } from '@/lib/types';
import {
  TIME_PRESETS,
  formatAddress,
  formatJobDateTime,
  formatTimeLabel,
  nextDays,
  serviceIcon,
  toLocalIsoDate,
} from '@/lib/utils';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, LoadingScreen, Screen } from '@/components/Screen';
import { JobPhotos, hasBeforeAndAfterPhotos } from '@/components/JobPhotos';
import {
  BottomSheet,
  Card,
  Chip,
  IconButton,
  SectionPanel,
  StickyActionBar,
} from '@/components/ui';

function invalidateJobs() {
  return queryClient.invalidateQueries({ queryKey: ['jobs'] });
}

function alertError(title: string) {
  return (err: unknown) =>
    Alert.alert(title, err instanceof Error ? err.message : 'Try again');
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const isProvider = user?.role === 'PROVIDER';
  const [assignOpen, setAssignOpen] = useState(false);

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => trpc.job.getById.query({ jobId: id }),
    enabled: Boolean(id),
  });
  const job = jobQuery.data;

  const unreadQuery = useQuery({
    queryKey: ['job-message-unread', id],
    queryFn: () => trpc.message.unreadCount.query({ jobId: id! }),
    enabled:
      Boolean(id) &&
      ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
        jobQuery.data?.status ?? '',
      ),
    refetchInterval: 15000,
  });

  const crewsQuery = useQuery({
    queryKey: ['crews'],
    queryFn: () => trpc.crew.list.query(),
    enabled: isProvider && assignOpen,
  });

  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string | null>(null);

  // Offer the next week, plus the job's own date when it already has one
  // outside that window, so rescheduling never silently drops the current slot.
  const days = useMemo(() => {
    const base = nextDays(7);
    if (!job?.scheduledDate) return base;
    const current = toLocalIsoDate(new Date(job.scheduledDate));
    if (base.some((day) => day.iso === current)) return base;
    return [
      {
        iso: current,
        label: new Date(job.scheduledDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      },
      ...base,
    ];
  }, [job?.scheduledDate]);

  const times = useMemo(() => {
    const current = job?.scheduledTime;
    if (!current || TIME_PRESETS.includes(current)) return TIME_PRESETS;
    return [current, ...TIME_PRESETS].sort();
  }, [job?.scheduledTime]);

  const statusMutation = useMutation({
    mutationFn: (status: 'IN_PROGRESS' | 'COMPLETED') =>
      trpc.job.updateStatus.mutate({ jobId: id, status }),
    onSuccess: () => invalidateJobs(),
  });

  const assignMutation = useMutation({
    mutationFn: async (crewId: string) => {
      // "Change crew" is unassign-then-assign: the model allows several crews
      // per job, but the field app treats it as exactly one.
      for (const assignment of job?.assignments ?? []) {
        if (assignment.crewId === crewId) continue;
        await trpc.job.unassignCrew.mutate({
          jobId: id,
          crewId: assignment.crewId,
        });
      }
      return trpc.job.assignCrew.mutate({ jobId: id, crewId });
    },
    onSuccess: async () => {
      await invalidateJobs();
      setAssignOpen(false);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (crewId: string) =>
      trpc.job.unassignCrew.mutate({ jobId: id, crewId }),
    onSuccess: async () => {
      await invalidateJobs();
      setAssignOpen(false);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (input: { scheduledDate: string; scheduledTime: string }) =>
      trpc.job.schedule.mutate({ jobId: id, ...input }),
    onSuccess: () => invalidateJobs(),
  });

  if (jobQuery.isLoading) return <LoadingScreen />;

  if (!job) {
    return (
      <Screen>
        <View className="px-5 pt-6">
          <EmptyState
            icon="help-circle-outline"
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
  const assignedCrew = job.assignments[0]?.crew;
  const canComplete = hasBeforeAndAfterPhotos(job.photos ?? []);

  // The mutation force-sets SCHEDULED, so exposing it on an in-progress job
  // would quietly knock the job backwards.
  const canSchedule =
    isProvider && (job.status === 'PENDING' || job.status === 'SCHEDULED');

  const selectedDate =
    scheduleDate ??
    (job.scheduledDate
      ? toLocalIsoDate(new Date(job.scheduledDate))
      : (days[0]?.iso ?? ''));
  const selectedTime = scheduleTime ?? job.scheduledTime ?? '09:00';
  const scheduleUnchanged =
    Boolean(job.scheduledDate) &&
    selectedDate === toLocalIsoDate(new Date(job.scheduledDate!)) &&
    selectedTime === job.scheduledTime;

  const openMaps = () => {
    const q = encodeURIComponent(address);
    Linking.openURL(
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${q}`
        : `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    );
  };

  const callCustomer = () => {
    if (!customerPhone) {
      Alert.alert('No phone number', 'This customer has no phone on file.');
      return;
    }
    Linking.openURL(`tel:${customerPhone}`);
  };

  const runStatus = (status: 'IN_PROGRESS' | 'COMPLETED') => {
    statusMutation.mutate(status, {
      onError: alertError('Could not update job'),
    });
  };

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8 pt-2">
        <View className="flex-row gap-3 justify-between items-start">
          <View className="flex-row flex-1 gap-3 items-center">
            <View className="justify-center items-center w-12 h-12 rounded-2xl bg-brand-lime/15">
              <Ionicons
                name={serviceIcon(job.service.name)}
                size={24}
                color={colors.lime}
              />
            </View>
            <Text className="flex-1 font-bold text-[26px] leading-8 text-white">
              {job.service.name}
            </Text>
          </View>
          <StatusBadge status={job.status} />
        </View>

        <View className="flex-row gap-2 items-center mt-3">
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text className="text-base text-slate-200">
            {job.scheduledDate
              ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
              : 'Not scheduled yet'}
          </Text>
        </View>

        <Card className="mt-5">
          <Text className="text-xs font-semibold tracking-wide uppercase text-slate-400">
            Property
          </Text>
          <Text className="mt-2 text-[17px] leading-6 text-white">
            {address}
          </Text>
          <Text className="mt-1 text-sm text-slate-400">{customerName}</Text>
          <View className="flex-row gap-3 mt-4">
            <IconButton
              icon="navigate-outline"
              label="Navigate"
              onPress={openMaps}
              tone="accent"
              className="flex-1"
            />
            <IconButton
              icon="call-outline"
              label="Call"
              onPress={callCustomer}
              className="flex-1"
            />
          </View>
          {['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
            job.status,
          ) ? (
            <View className="mt-3">
              <IconButton
                icon="chatbubble-ellipses-outline"
                label={
                  unreadQuery.data?.count
                    ? `Message (${unreadQuery.data.count})`
                    : 'Message'
                }
                onPress={() => router.push(`/jobs/messages/${id}`)}
                className="w-full"
              />
            </View>
          ) : null}
        </Card>

        {job.customerNotes ? (
          <Card className="mt-3">
            <Text className="text-xs font-semibold tracking-wide uppercase text-slate-400">
              Customer notes
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-200">
              {job.customerNotes}
            </Text>
          </Card>
        ) : null}

        {job.property.notes ? (
          <Card className="mt-3">
            <Text className="text-xs font-semibold tracking-wide uppercase text-slate-400">
              Property notes
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-200">
              {job.property.notes}
            </Text>
          </Card>
        ) : null}

        {canSchedule ? (
          <View className="mt-8">
            <SectionPanel
              title={job.status === 'SCHEDULED' ? 'Reschedule' : 'Schedule'}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                className="mb-3"
              >
                {days.map((day) => (
                  <Chip
                    key={day.iso}
                    label={day.label.split(', ')[0] ?? day.label}
                    sublabel={day.label.split(', ')[1]}
                    selected={selectedDate === day.iso}
                    onPress={() => setScheduleDate(day.iso)}
                  />
                ))}
              </ScrollView>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {times.map((time) => (
                  <Chip
                    key={time}
                    label={formatTimeLabel(time)}
                    selected={selectedTime === time}
                    onPress={() => setScheduleTime(time)}
                  />
                ))}
              </View>
              <PrimaryButton
                label={
                  job.status === 'SCHEDULED'
                    ? 'Update schedule'
                    : 'Save schedule'
                }
                icon="calendar-outline"
                variant="secondary"
                disabled={scheduleUnchanged}
                onPress={() =>
                  scheduleMutation.mutate(
                    {
                      scheduledDate: selectedDate,
                      scheduledTime: selectedTime,
                    },
                    { onError: alertError('Could not schedule') },
                  )
                }
                loading={scheduleMutation.isPending}
              />
            </SectionPanel>
          </View>
        ) : null}

        {isProvider ? (
          <View className="mt-8">
            <SectionPanel
              title="Crew"
              actionLabel={assignedCrew ? 'Change' : undefined}
              onAction={assignedCrew ? () => setAssignOpen(true) : undefined}
            >
              {assignedCrew ? (
                <Card>
                  <View className="flex-row gap-3 items-center">
                    <View className="justify-center items-center w-11 h-11 rounded-2xl bg-brand-lime/15">
                      <Ionicons name="people" size={20} color={colors.lime} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-[17px] text-white">
                        {assignedCrew.name}
                      </Text>
                      <Text className="text-sm text-slate-400">
                        Assigned to this job
                      </Text>
                    </View>
                  </View>
                </Card>
              ) : (
                <PrimaryButton
                  label="Assign crew"
                  icon="people-outline"
                  variant="secondary"
                  onPress={() => setAssignOpen(true)}
                />
              )}
            </SectionPanel>
          </View>
        ) : null}

        <JobPhotos job={job} token={token} />
      </ScrollView>

      <JobActionBar
        job={job}
        canComplete={canComplete}
        pending={statusMutation.isPending}
        onStatus={runStatus}
      />

      <BottomSheet
        visible={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={assignedCrew ? 'Change crew' : 'Assign a crew'}
        subtitle={
          assignedCrew
            ? `${assignedCrew.name} is on this job right now.`
            : 'Pick the crew running this job.'
        }
      >
        <ScrollView className="max-h-[360px]">
          {(crewsQuery.data ?? []).map((crew) => {
            const active = crew.id === assignedCrew?.id;
            return (
              <Pressable
                key={crew.id}
                onPress={() =>
                  assignMutation.mutate(crew.id, {
                    onError: alertError('Could not assign'),
                  })
                }
                className={`mb-2 flex-row items-center gap-3 rounded-2xl border px-4 py-4 active:opacity-80 ${
                  active
                    ? 'border-brand-lime/40 bg-brand-lime/10'
                    : 'border-line bg-surface'
                }`}
              >
                <View className="flex-1">
                  <Text className="font-semibold text-[17px] text-white">
                    {crew.name}
                  </Text>
                  <Text className="text-sm text-slate-400">
                    {crew.members.length} member
                    {crew.members.length === 1 ? '' : 's'}
                  </Text>
                </View>
                {active ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.lime}
                  />
                ) : null}
              </Pressable>
            );
          })}
          {crewsQuery.data?.length === 0 ? (
            <Text className="text-base text-slate-400">
              Create a crew on the web portal first.
            </Text>
          ) : null}
        </ScrollView>

        {assignedCrew ? (
          <View className="mt-3">
            <PrimaryButton
              label="Remove crew"
              variant="danger"
              icon="person-remove-outline"
              loading={unassignMutation.isPending}
              onPress={() =>
                unassignMutation.mutate(assignedCrew.id, {
                  onError: alertError('Could not remove crew'),
                })
              }
            />
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

/**
 * Primary status action, pinned above the home indicator. Renders nothing for a
 * finished job beyond a confirmation line.
 */
function JobActionBar({
  job,
  canComplete,
  pending,
  onStatus,
}: {
  job: FieldJob;
  canComplete: boolean;
  pending: boolean;
  onStatus: (status: 'IN_PROGRESS' | 'COMPLETED') => void;
}) {
  if (job.status === 'COMPLETED') {
    return (
      <StickyActionBar>
        <View className="flex-row gap-2 justify-center items-center py-1">
          <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
          <Text className="text-base font-semibold text-green-400">
            This job is complete.
          </Text>
        </View>
      </StickyActionBar>
    );
  }

  if (job.status === 'SCHEDULED' || job.status === 'PENDING') {
    return (
      <StickyActionBar>
        <PrimaryButton
          label="Start job"
          icon="play"
          onPress={() => onStatus('IN_PROGRESS')}
          loading={pending}
        />
        {/* Kept for crews who photograph the work and only open the app after,
            which the previous screen allowed straight from SCHEDULED. */}
        {job.status === 'SCHEDULED' && canComplete ? (
          <Pressable
            onPress={() => onStatus('COMPLETED')}
            className="items-center pt-3 active:opacity-70"
          >
            <Text className="font-semibold text-[15px] text-brand-lime">
              Skip ahead and mark complete
            </Text>
          </Pressable>
        ) : null}
      </StickyActionBar>
    );
  }

  if (job.status === 'IN_PROGRESS') {
    return (
      <StickyActionBar>
        <PrimaryButton
          label="Mark complete"
          icon="checkmark"
          onPress={() => onStatus('COMPLETED')}
          loading={pending}
          disabled={!canComplete}
        />
        {!canComplete ? (
          <Text className="mt-2 text-sm text-center text-amber-400">
            Add before and after photos to complete
          </Text>
        ) : null}
      </StickyActionBar>
    );
  }

  return null;
}
