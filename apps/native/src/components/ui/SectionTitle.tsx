import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function SectionTitle({
  children,
  action,
}: {
  children: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-lg font-semibold text-white">{children}</Text>
      {action}
    </View>
  );
}
