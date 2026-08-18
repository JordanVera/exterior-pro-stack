import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

export type StatTone = 'lime' | 'amber' | 'blue' | 'muted';

export type StatTile = {
  id: string;
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: StatTone;
  onPress?: () => void;
};

const TONE_ICON: Record<StatTone, string> = {
  lime: colors.lime,
  amber: '#fbbf24',
  blue: '#60a5fa',
  muted: colors.muted,
};

const TONE_CHIP: Record<StatTone, string> = {
  lime: 'bg-brand-lime/15',
  amber: 'bg-amber-400/15',
  blue: 'bg-blue-400/15',
  muted: 'bg-white/10',
};

/**
 * Two-up grid of at-a-glance counts. Kept to two columns so the numbers stay
 * large enough to read at arm's length in daylight.
 */
export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {tiles.map((tile) => {
        const tone = tile.tone ?? 'muted';
        const body = (
          <>
            <View className="flex-row justify-between items-center">
              <View
                className={`justify-center items-center w-9 h-9 rounded-xl ${TONE_CHIP[tone]}`}
              >
                <Ionicons name={tile.icon} size={17} color={TONE_ICON[tone]} />
              </View>
              {tile.onPress ? (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.muted}
                />
              ) : null}
            </View>
            <Text className="mt-3 text-3xl font-bold text-white">
              {tile.value}
            </Text>
            <Text className="mt-0.5 text-sm text-slate-400">{tile.label}</Text>
          </>
        );

        // Two per row with a 12px gap. Deliberately not `flex-1`: a lone tile on
        // the last row should stay half width rather than stretching across.
        const sizing = 'grow-0 basis-[48%]';

        return tile.onPress ? (
          <Pressable
            key={tile.id}
            onPress={tile.onPress}
            className={`p-4 rounded-2xl border ${sizing} border-line bg-surface active:opacity-80`}
          >
            {body}
          </Pressable>
        ) : (
          <View
            key={tile.id}
            className={`p-4 rounded-2xl border ${sizing} border-line bg-surface`}
          >
            {body}
          </View>
        );
      })}
    </View>
  );
}
