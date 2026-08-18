import { Text, View } from 'react-native';
import { STATUS_BADGE } from '../lib/utils';

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: string;
  size?: 'sm' | 'md';
}) {
  const badge = STATUS_BADGE[status] ?? {
    bg: 'bg-slate-500/30',
    text: 'text-slate-200',
    label: status,
  };

  return (
    <View
      className={`rounded-full ${size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${badge.bg}`}
    >
      <Text
        className={`font-semibold ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${badge.text}`}
      >
        {badge.label}
      </Text>
    </View>
  );
}
