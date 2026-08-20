import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { ComponentProps } from 'react';

type ActivityFeedItemProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
  onPress?: () => void;
};

export function ActivityFeedItem({
  icon,
  iconColor,
  title,
  subtitle,
  time,
  onPress,
}: ActivityFeedItemProps) {
  const content = (
    <>
      <View
        className="justify-center items-center w-10 h-10 rounded-full"
        style={{ backgroundColor: iconColor + '20' }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="mt-0.5 text-sm text-slate-400">{subtitle}</Text>
        <Text className="mt-1 text-xs text-slate-500">{time}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row gap-3 items-start p-3 rounded-2xl border border-line bg-surface active:opacity-80"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="flex-row gap-3 items-start p-3 rounded-2xl border border-line bg-surface">
      {content}
    </View>
  );
}
