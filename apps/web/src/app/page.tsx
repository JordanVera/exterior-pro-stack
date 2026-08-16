'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { isAuthenticated } from '../lib/auth';
import { LandingPage } from '@/components/landing/landing-page';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setChecking(false);
      return;
    }
    trpc.auth.me
      .query()
      .then((user) => {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (!user.role) router.push('/onboarding/role');
        else if (!user.hasProfile) router.push('/onboarding/profile');
        else if (user.role === 'CUSTOMER') router.push('/customer');
        else if (user.role === 'PROVIDER') router.push('/provider');
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
          <p className="text-sm text-muted-foreground">Loading</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
