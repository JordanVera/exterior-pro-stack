import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/Screen';
import { tabIcon, tabScreenOptions } from '@/components/ui/tabBar';

export default function CustomerLayout() {
  const { isReady, user } = useAuth();

  if (!isReady) return <LoadingScreen />;
  if (!user || user.role !== 'CUSTOMER') return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={tabScreenOptions}>
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
