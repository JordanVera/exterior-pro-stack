import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, type ColorValue } from 'react-native';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/Screen';
import { colors, fonts } from '@/lib/theme';

/** Outline glyph with a lime underline on the active tab. */
function tabIcon(name: keyof typeof Ionicons.glyphMap) {
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
          fontFamily: fonts.medium,
          fontSize: 11,
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home-outline'),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: tabIcon('briefcase-outline'),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: tabIcon('calendar-outline'),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: tabIcon('card-outline'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: tabIcon('settings-outline'),
        }}
      />
    </Tabs>
  );
}
