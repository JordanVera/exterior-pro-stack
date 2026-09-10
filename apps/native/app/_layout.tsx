import '../global.css';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import { queryClient } from '@/lib/query';
import { colors } from '@/lib/theme';
import {
  getLastNotificationResponse,
  setupNotificationHandlers,
} from '@/lib/push-notifications';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootLayoutNav() {
  const { user } = useAuth();

  // Setup notification handlers with role-based routing
  useEffect(() => {
    const subscription = setupNotificationHandlers(user);
    getLastNotificationResponse().then((response) => {
      if (!response || !user) return;
      const data = response.notification.request.content.data;
      const jobId = typeof data?.jobId === 'string' ? data.jobId : null;
      if (!jobId) return;
      if (data?.type === 'JOB_MESSAGE') {
        router.push(`/jobs/messages/${jobId}`);
        return;
      }
      router.push(`/jobs/${jobId}`);
    });
    return () => subscription.remove();
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night },
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // Hiding on error too: shipping system fonts beats a permanent splash.
  const ready = fontsLoaded || Boolean(fontError);

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <View className="flex-1 bg-brand-night" onLayout={onLayout}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </AuthProvider>
      </QueryClientProvider>
    </View>
  );
}
