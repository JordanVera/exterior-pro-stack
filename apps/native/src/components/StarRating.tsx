import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export function StarRating({
  value,
  onChange,
  size = 22,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const interactive = Boolean(onChange) && !readOnly;

  return (
    <View className="flex-row items-center gap-1" accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? '#fbbf24' : colors.muted}
          />
        );

        if (!interactive) {
          return <View key={star}>{icon}</View>;
        }

        return (
          <Pressable
            key={star}
            onPress={() => onChange?.(star)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

export function RatingSummary({
  average,
  count,
}: {
  average: number | null | undefined;
  count: number | undefined;
}) {
  if (!count || average == null) {
    return <Text className="text-sm text-slate-400">New</Text>;
  }

  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name="star" size={14} color="#fbbf24" />
      <Text className="text-sm font-semibold text-white">
        {average.toFixed(1)}
      </Text>
      <Text className="text-sm text-slate-400">({count})</Text>
    </View>
  );
}
