import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/Screen';
import { colors, fonts } from '@/lib/theme';

/** Filled glyph on the active tab, outline when inactive. */
function tabIcon(
  active: keyof typeof Ionicons.glyphMap,
  inactive: keyof typeof Ionicons.glyphMap,
) {
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
      <Ionicons name={focused ? active : inactive} size={size} color={color} />
    );
  };
}

export default function CustomerLayout() {
  const { isReady, user } = useAuth();

  if (!isReady) return <LoadingScreen />;
  if (!user || user.role !== 'CUSTOMER') return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
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
          fontFamily: fonts.semibold,
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: tabIcon('briefcase', 'briefcase-outline'),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: tabIcon('calendar', 'calendar-outline'),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: tabIcon('card', 'card-outline'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: tabIcon('settings', 'settings-outline'),
        }}
      />
    </Tabs>
  );
}
