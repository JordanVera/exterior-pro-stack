import Ionicons from '@expo/vector-icons/Ionicons';
import { View, type ColorValue } from 'react-native';
import { colors, fonts } from '@/lib/theme';

export const tabScreenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.night,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 88,
    paddingTop: 10,
  },
  tabBarActiveTintColor: colors.lime,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelStyle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 0,
  },
};

/** Outline glyph with a lime underline on the active tab. */
export function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return function TabIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return (
      <View className="items-center">
        <Ionicons name={name} size={size} color={color} />
        <View
          className="mt-1 h-[3px] w-4 rounded-full"
          style={{ backgroundColor: focused ? colors.lime : 'transparent' }}
        />
      </View>
    );
  };
}
