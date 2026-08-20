import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@repo/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getDevServerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

export function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    const devHost = getDevServerHost();
    if (devHost) {
      return `http://${devHost}:3000`;
    }
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        return authToken ? { authorization: `Bearer ${authToken}` } : {};
      },
    }),
  ],
});
