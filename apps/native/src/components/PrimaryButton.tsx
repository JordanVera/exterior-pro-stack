import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const surface =
    variant === 'danger'
      ? 'bg-red-600'
      : variant === 'secondary'
        ? 'border border-line-strong bg-surface-raised'
        : 'bg-brand-lime';
  const textClass =
    variant === 'secondary' || variant === 'danger'
      ? 'text-white'
      : 'text-brand-ink';
  const iconColor = variant === 'primary' ? colors.ink : '#fff';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => undefined,
        );
        onPress();
      }}
      disabled={inactive}
      className={`min-h-[56px] items-center justify-center rounded-2xl px-4 active:opacity-80 ${surface} ${inactive ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View className="flex-row gap-2 items-center">
          {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
          <Text className={`text-lg font-bold ${textClass}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
