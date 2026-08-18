import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { invalidateCrews } from '@/lib/crews';
import { colors } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState, LoadingScreen, Screen } from '@/components/Screen';
import { BottomSheet, PressableCard, ScreenHeader } from '@/components/ui';

function alertError(title: string) {
  return (err: unknown) =>
    Alert.alert(title, err instanceof Error ? err.message : 'Try again');
}

export default function CrewsIndexScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const crewsQuery = useQuery({
    queryKey: ['crews'],
    queryFn: () => trpc.crew.list.query(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => trpc.crew.create.mutate({ name }),
    onSuccess: async (crew) => {
      await invalidateCrews();
      setCreateOpen(false);
      setNewName('');
      router.push(`/crews/${crew.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trpc.crew.delete.mutate({ id }),
    onSuccess: () => invalidateCrews(),
  });

  if (crewsQuery.isLoading) return <LoadingScreen />;

  const crews = crewsQuery.data ?? [];

  const refresh = async () => {
    setRefreshing(true);
    await crewsQuery.refetch();
    setRefreshing(false);
  };

  const confirmDelete = (crew: { id: string; name: string }) => {
    Alert.alert(
      'Delete crew?',
      `Remove "${crew.name}" and all its members? Jobs assigned to this crew will lose the assignment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteMutation.mutate(crew.id, {
              onError: alertError('Could not delete crew'),
            }),
        },
      ],
    );
  };

  const submitCreate = () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Name required', 'Give the crew a name before saving.');
      return;
    }
    createMutation.mutate(name, {
      onError: alertError('Could not create crew'),
    });
  };

  return (
    <Screen edges={['left', 'right']}>
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
        <ScreenHeader
          eyebrow="Field"
          title="Crews"
          subtitle="Create teams and add phone numbers so they can sign in on the app."
        />

        <View className="mt-6">
          <PrimaryButton
            label="New crew"
            icon="add"
            onPress={() => setCreateOpen(true)}
          />
        </View>

        <View className="mt-6">
          {crews.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No crews yet"
              body="Add a crew, then give each member a phone number so they can log in and see assigned jobs."
              actionLabel="Create your first crew"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            crews.map((crew) => (
              <PressableCard
                key={crew.id}
                onPress={() => router.push(`/crews/${crew.id}`)}
                onLongPress={() => confirmDelete(crew)}
                className="mb-3"
              >
                <View className="flex-row gap-3 items-center">
                  <View className="justify-center items-center w-11 h-11 rounded-2xl bg-brand-lime/15">
                    <Text className="text-lg font-bold text-brand-lime">
                      {crew.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-semibold text-[17px] text-white">
                      {crew.name}
                    </Text>
                    <Text className="text-sm text-slate-400">
                      {crew.members.length === 0
                        ? 'No members yet'
                        : `${crew.members.length} member${crew.members.length === 1 ? '' : 's'}`}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.muted}
                  />
                </View>
              </PressableCard>
            ))
          )}
        </View>
      </ScrollView>

      <BottomSheet
        visible={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setNewName('');
        }}
        title="New crew"
        subtitle="You can add members after the crew is created."
      >
        <Text className="mb-2 text-sm font-medium text-slate-300">Crew name</Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Team Alpha"
          placeholderTextColor="#64748b"
          className="px-4 h-14 text-lg text-white rounded-2xl border border-line-strong bg-surface-sunken"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submitCreate}
        />
        <View className="mt-4">
          <PrimaryButton
            label="Create crew"
            icon="checkmark"
            onPress={submitCreate}
            loading={createMutation.isPending}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
