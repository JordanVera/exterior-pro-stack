import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export function AccordionSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const header = (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${title}, ${count}`}
      className="flex-row justify-between items-center"
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
      <View className="flex-row gap-2 items-center">
        <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-white/10 px-2">
          <Text className="text-xs font-semibold text-white">{count}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.muted}
        />
      </View>
    </Pressable>
  );

  if (!expanded) {
    return (
      <View className="px-4 py-4 rounded-2xl bg-surface">{header}</View>
    );
  }

  return (
    <View className="p-4 rounded-3xl border border-line bg-surface">
      {header}
      <View className="mt-4">{children}</View>
    </View>
  );
}
