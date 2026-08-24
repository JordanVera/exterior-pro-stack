import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';
import { serviceIcon } from '@/lib/utils';

export type ServiceCategoryTile = {
  id: string;
  name: string;
};

const TILE_TONES = [
  { bg: colors.lime, icon: colors.ink },
  { bg: '#fbbf24', icon: colors.ink },
  { bg: '#2dd4bf', icon: colors.ink },
  { bg: '#fb7185', icon: '#ffffff' },
] as const;

export function CategoryTiles({
  categories,
  onSelect,
}: {
  categories: ServiceCategoryTile[];
  onSelect: (categoryId: string) => void;
}) {
  const tiles = categories.slice(0, 4);
  if (tiles.length === 0) return null;

  return (
    <View className="flex-row justify-between">
      {tiles.map((category, index) => {
        const tone = TILE_TONES[index] ?? TILE_TONES[0];
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            className="flex-1 items-center px-1 active:opacity-80"
          >
            <View
              className="justify-center items-center w-16 h-16 rounded-2xl"
              style={{ backgroundColor: tone.bg }}
            >
              <Ionicons
                name={serviceIcon(category.name)}
                size={26}
                color={tone.icon}
              />
            </View>
            <Text
              className="mt-2 text-xs font-semibold text-center text-white"
              numberOfLines={2}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
