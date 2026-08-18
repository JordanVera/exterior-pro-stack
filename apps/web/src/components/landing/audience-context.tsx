'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AuthIntent } from '@/lib/auth-intent';

export type Audience = 'homeowner' | 'provider';

type AudienceContextValue = {
  audience: Audience;
  setAudience: (audience: Audience) => void;
  /** Maps the current audience onto the login intent param. */
  intent: AuthIntent;
};

const AudienceContext = createContext<AudienceContextValue | null>(null);

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudience] = useState<Audience>('homeowner');

  const value = useMemo<AudienceContextValue>(
    () => ({
      audience,
      setAudience,
      intent: audience === 'provider' ? 'provider' : 'customer',
    }),
    [audience],
  );

  return (
    <AudienceContext.Provider value={value}>
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  const context = useContext(AudienceContext);
  if (!context) {
    throw new Error('useAudience must be used within an AudienceProvider');
  }
  return context;
}
