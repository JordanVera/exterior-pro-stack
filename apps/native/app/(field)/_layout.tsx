import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/Screen';
import { tabIcon, tabScreenOptions } from '@/components/ui/tabBar';

export default function FieldLayout() {
  const { isReady, isFieldUser } = useAuth();

  if (!isReady) return <LoadingScreen />;
  if (!isFieldUser) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: tabIcon('today-outline'),
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
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: tabIcon('settings-outline'),
        }}
      />
      <Tabs.Screen name="crews" options={{ href: null }} />
    </Tabs>
  );
}
