'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { isAuthenticated } from '@/lib/auth';

/**
 * Renders nothing. Signed-in visitors who land on `/` are routed to the right
 * dashboard while the marketing page paints behind this check.
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) return;

    trpc.auth.me
      .query()
      .then((user) => {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (!user.role) router.push('/onboarding/role');
        else if (!user.hasProfile) router.push('/onboarding/profile');
        else if (user.role === 'CUSTOMER') router.push('/customer');
        else if (user.role === 'PROVIDER') router.push('/provider');
      })
      .catch(() => {
        /* stay on the landing page */
      });
  }, [router]);

  return null;
}
