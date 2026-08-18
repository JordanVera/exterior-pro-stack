import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';

export function Screen({
  children,
  edges,
}: {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  return (
    <SafeAreaView
      className="flex-1 bg-brand-night"
      edges={edges ?? ['top', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
}

export function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-brand-night">
      <ActivityIndicator color={colors.lime} size="large" />
    </View>
  );
}

export function EmptyState({
  title,
  body,
  icon = 'checkmark-done-outline',
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center px-6 py-10 rounded-3xl border border-line bg-surface">
      <View className="justify-center items-center mb-4 w-14 h-14 rounded-2xl bg-brand-lime/15">
        <Ionicons name={icon} size={26} color={colors.lime} />
      </View>
      <Text className="text-lg font-semibold text-center text-white">
        {title}
      </Text>
      <Text className="mt-2 text-base leading-6 text-center text-slate-400">
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="px-5 py-3 mt-5 rounded-full border border-brand-lime/40 bg-brand-lime/15 active:opacity-80"
        >
          <Text className="font-semibold text-[15px] text-brand-lime">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
