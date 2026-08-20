import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { formatPhoneDisplay } from '@/lib/crews';
import { initialsFor } from '@/lib/utils';
import type { CrewList } from '@/lib/types';

type Member = CrewList[number]['members'][number];

export function MemberRow({
  member,
  onEdit,
  onRemove,
}: {
  member: Member;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="mb-2 flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/15">
        <Text className="font-bold text-sm text-brand-lime">
          {initialsFor(member.name)}
        </Text>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="font-semibold text-[17px] text-white">
            {member.name}
          </Text>
          {member.role ? (
            <Text className="text-sm text-slate-400">({member.role})</Text>
          ) : null}
          {member.userId ? (
            <View className="rounded-full bg-brand-lime/15 px-2 py-0.5">
              <Text className="font-semibold text-[11px] text-brand-lime">
                Can sign in
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-0.5 text-sm text-slate-400">
          {formatPhoneDisplay(member.phone)}
        </Text>
      </View>

      <View className="flex-row gap-1">
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:opacity-70"
        >
          <Ionicons name="pencil" size={16} color={colors.mist} />
        </Pressable>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-red-500/15 active:opacity-70"
        >
          <Ionicons name="trash-outline" size={16} color="#f87171" />
        </Pressable>
      </View>
    </View>
  );
}
