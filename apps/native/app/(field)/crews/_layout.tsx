import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/Screen';
import { colors, fonts } from '@/lib/theme';

export default function CrewsLayout() {
  const { isReady, user } = useAuth();

  if (!isReady) return <LoadingScreen />;
  if (user?.role === 'CREW') return <Redirect href="/account" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.night },
        headerTintColor: colors.lime,
        headerTitleStyle: { color: '#fff', fontFamily: fonts.bold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.night },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Crews' }} />
      <Stack.Screen name="[id]" options={{ title: 'Crew' }} />
    </Stack>
  );
}
