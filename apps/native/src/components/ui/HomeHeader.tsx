import { Pressable, Text, View } from 'react-native';
import { getGreeting, initialsFor } from '@/lib/utils';

export function HomeHeader({
  name,
  onAvatarPress,
}: {
  name: string;
  onAvatarPress: () => void;
}) {
  const initials = initialsFor(name) || '?';

  return (
    <View className="flex-row gap-4 justify-between items-center">
      <View className="flex-1">
        <Text className="text-base text-slate-400">{getGreeting()},</Text>
        <Text
          className="mt-0.5 font-bold text-[28px] leading-9 text-white"
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      <Pressable
        onPress={onAvatarPress}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        className="justify-center items-center w-14 h-14 rounded-full bg-brand-lime active:opacity-80"
      >
        <Text className="text-lg font-bold text-brand-ink">{initials}</Text>
      </Pressable>
    </View>
  );
}
