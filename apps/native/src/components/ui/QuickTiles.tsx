import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export type QuickTile = {
  id: string;
  label: string;
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const TILE_TONES = [
  { bg: colors.lime, fg: colors.ink },
  { bg: '#fbbf24', fg: colors.ink },
  { bg: '#2dd4bf', fg: colors.ink },
  { bg: '#fb7185', fg: '#ffffff' },
] as const;

export function QuickTiles({ tiles }: { tiles: QuickTile[] }) {
  const visible = tiles.slice(0, 4);
  if (visible.length === 0) return null;

  return (
    <View className="flex-row justify-between">
      {visible.map((tile, index) => {
        const tone = TILE_TONES[index] ?? TILE_TONES[0];
        return (
          <Pressable
            key={tile.id}
            onPress={tile.onPress}
            disabled={!tile.onPress}
            accessibilityRole={tile.onPress ? 'button' : 'text'}
            accessibilityLabel={`${tile.label} ${tile.value ?? ''}`}
            className="flex-1 items-center px-1 active:opacity-80"
          >
            <View
              className="justify-center items-center w-16 h-16 rounded-2xl"
              style={{ backgroundColor: tone.bg }}
            >
              {tile.value !== undefined ? (
                <Text
                  className="text-xl font-bold"
                  style={{ color: tone.fg }}
                >
                  {tile.value}
                </Text>
              ) : tile.icon ? (
                <Ionicons name={tile.icon} size={26} color={tone.fg} />
              ) : null}
            </View>
            <Text
              className="mt-2 text-xs font-semibold text-center text-white"
              numberOfLines={2}
            >
              {tile.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
