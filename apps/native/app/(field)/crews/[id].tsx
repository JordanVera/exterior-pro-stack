import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { digitsToE164, invalidateCrews, phoneToDigits } from '@/lib/crews';
import type { CrewList } from '@/lib/types';
import { MemberRow } from '@/components/MemberRow';
import { PhoneField } from '@/components/PhoneField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState, LoadingScreen, Screen } from '@/components/Screen';
import { BottomSheet, SectionPanel } from '@/components/ui';

type Member = CrewList[number]['members'][number];

function alertError(title: string) {
  return (err: unknown) =>
    Alert.alert(title, err instanceof Error ? err.message : 'Try again');
}

export default function CrewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const crewsQuery = useQuery({
    queryKey: ['crews'],
    queryFn: () => trpc.crew.list.query(),
  });

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => trpc.job.listMine.query({ view: 'all' }),
  });

  const crew = useMemo(
    () => crewsQuery.data?.find((item) => item.id === id),
    [crewsQuery.data, id],
  );

  const [renameOpen, setRenameOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRole, setMemberRole] = useState('');

  const resetMemberForm = () => {
    setMemberName('');
    setMemberPhone('');
    setMemberRole('');
  };

  useEffect(() => {
    if (crew) setCrewName(crew.name);
  }, [crew?.name]);

  const updateMutation = useMutation({
    mutationFn: (name: string) => trpc.crew.update.mutate({ id: id!, name }),
    onSuccess: () => {
      invalidateCrews();
      setRenameOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => trpc.crew.delete.mutate({ id: id! }),
    onSuccess: async () => {
      await invalidateCrews();
      router.back();
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () =>
      trpc.crew.addMember.mutate({
        crewId: id!,
        name: memberName.trim(),
        phone: digitsToE164(memberPhone),
        role: memberRole.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateCrews();
      resetMemberForm();
      setAddOpen(false);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: () =>
      trpc.crew.updateMember.mutate({
        id: editMember!.id,
        name: memberName.trim(),
        phone: digitsToE164(memberPhone),
        role: memberRole.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateCrews();
      resetMemberForm();
      setEditMember(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      trpc.crew.removeMember.mutate({ id: memberId }),
    onSuccess: () => invalidateCrews(),
  });

  if (crewsQuery.isLoading) return <LoadingScreen />;

  if (!crew) {
    return (
      <Screen edges={['left', 'right']}>
        <View className="px-5 pt-6">
          <EmptyState
            icon="help-circle-outline"
            title="Crew not found"
            body="This crew may have been deleted."
          />
        </View>
      </Screen>
    );
  }

  const activeJobs =
    jobsQuery.data?.filter(
      (job) =>
        job.assignments.some((a) => a.crewId === crew.id) &&
        (job.status === 'PENDING' ||
          job.status === 'SCHEDULED' ||
          job.status === 'IN_PROGRESS'),
    ).length ?? 0;

  const openAddMember = () => {
    resetMemberForm();
    setAddOpen(true);
  };

  const openEditMember = (member: Member) => {
    setMemberName(member.name);
    setMemberPhone(phoneToDigits(member.phone));
    setMemberRole(member.role ?? '');
    setEditMember(member);
  };

  const submitRename = () => {
    const name = crewName.trim();
    if (!name) {
      Alert.alert('Name required', 'Crew name cannot be empty.');
      return;
    }
    updateMutation.mutate(name, {
      onError: alertError('Could not rename crew'),
    });
  };

  const submitMember = () => {
    if (!memberName.trim()) {
      Alert.alert('Name required', 'Enter the member name.');
      return;
    }
    if (memberPhone.replace(/\D/g, '').length !== 10) {
      Alert.alert(
        'Phone required',
        'Enter a 10-digit phone number so they can sign in on the app.',
      );
      return;
    }

    if (editMember) {
      updateMemberMutation.mutate(undefined, {
        onError: alertError('Could not update member'),
      });
    } else {
      addMemberMutation.mutate(undefined, {
        onError: alertError('Could not add member'),
      });
    }
  };

  const confirmRemoveMember = (member: Member) => {
    Alert.alert('Remove member?', `Remove ${member.name} from ${crew.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeMemberMutation.mutate(member.id, {
            onError: alertError('Could not remove member'),
          }),
      },
    ]);
  };

  const confirmDeleteCrew = () => {
    const assignmentNote =
      activeJobs > 0
        ? ` This crew is on ${activeJobs} active job${activeJobs === 1 ? '' : 's'}.`
        : '';

    Alert.alert(
      'Delete crew?',
      `Remove "${crew.name}" and all its members?${assignmentNote}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteMutation.mutate(undefined, {
              onError: alertError('Could not delete crew'),
            }),
        },
      ],
    );
  };

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-3 justify-between items-start">
          <View className="flex-1">
            <Text className="font-bold text-[28px] leading-8 text-white">
              {crew.name}
            </Text>
            <Text className="mt-1 text-base text-slate-400">
              {crew.members.length} member
              {crew.members.length === 1 ? '' : 's'}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setCrewName(crew.name);
              setRenameOpen(true);
            }}
            hitSlop={8}
            className="rounded-full border border-line-strong bg-surface px-4 py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-brand-lime">
              Rename
            </Text>
          </Pressable>
        </View>

        <View className="mt-8">
          <SectionPanel
            title="Members"
            count={crew.members.length}
            actionLabel="Add"
            onAction={openAddMember}
          >
            {crew.members.length === 0 ? (
              <EmptyState
                icon="person-add-outline"
                title="No members yet"
                body="Add a phone number for each person who should see jobs on this crew."
                actionLabel="Add member"
                onAction={openAddMember}
              />
            ) : (
              crew.members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onEdit={() => openEditMember(member)}
                  onRemove={() => confirmRemoveMember(member)}
                />
              ))
            )}
          </SectionPanel>
        </View>

        <View className="mt-10">
          <PrimaryButton
            label="Delete crew"
            variant="danger"
            icon="trash-outline"
            loading={deleteMutation.isPending}
            onPress={confirmDeleteCrew}
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename crew"
      >
        <Text className="mb-2 text-sm font-medium text-slate-300">
          Crew name
        </Text>
        <TextInput
          value={crewName}
          onChangeText={setCrewName}
          placeholder="Team Alpha"
          placeholderTextColor="#64748b"
          className="px-4 h-14 text-lg text-white rounded-2xl border border-line-strong bg-surface-sunken"
          autoFocus
        />
        <View className="mt-4">
          <PrimaryButton
            label="Save"
            icon="checkmark"
            onPress={submitRename}
            loading={updateMutation.isPending}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={addOpen || Boolean(editMember)}
        onClose={() => {
          setAddOpen(false);
          setEditMember(null);
          resetMemberForm();
        }}
        title={editMember ? 'Edit member' : 'Add member'}
        subtitle="They sign in to this app with this phone number."
      >
        <Text className="mb-2 text-sm font-medium text-slate-300">Name</Text>
        <TextInput
          value={memberName}
          onChangeText={setMemberName}
          placeholder="Carlos Rivera"
          placeholderTextColor="#64748b"
          className="px-4 mb-4 h-14 text-lg text-white rounded-2xl border border-line-strong bg-surface-sunken"
          autoFocus={!editMember}
        />

        <Text className="mb-2 text-sm font-medium text-slate-300">
          Phone number
        </Text>
        <PhoneField
          value={memberPhone}
          onChange={setMemberPhone}
          autoFocus={Boolean(editMember)}
        />

        <Text className="mt-4 mb-2 text-sm font-medium text-slate-300">
          Role (optional)
        </Text>
        <TextInput
          value={memberRole}
          onChangeText={setMemberRole}
          placeholder="Lead, Technician…"
          placeholderTextColor="#64748b"
          className="px-4 h-14 text-lg text-white rounded-2xl border border-line-strong bg-surface-sunken"
        />

        <View className="mt-4">
          <PrimaryButton
            label={editMember ? 'Save changes' : 'Add member'}
            icon="checkmark"
            onPress={submitMember}
            loading={
              addMemberMutation.isPending || updateMemberMutation.isPending
            }
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
