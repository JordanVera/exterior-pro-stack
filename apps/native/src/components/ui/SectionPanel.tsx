import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

/** Titled group with an optional count badge and a text action on the right. */
export function SectionPanel({
  title,
  count,
  actionLabel,
  onAction,
  children,
  className = '',
}: {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={className}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row gap-2 items-center">
          <Text className="text-lg font-semibold text-white">{title}</Text>
          {typeof count === 'number' ? (
            <View className="rounded-full bg-white/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-slate-300">
                {count}
              </Text>
            </View>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            className="active:opacity-70"
          >
            <Text className="text-sm font-semibold text-brand-lime">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
