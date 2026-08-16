import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@repo/api';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  // SSR — use localhost
  return `http://localhost:3000`;
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch(url, opts) {
        return fetch(url, { ...opts, credentials: 'include' });
      },
    }),
  ],
});
